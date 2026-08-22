import { pool } from '../../config/db.js';
import { config } from '../../config/index.js';
import { MatchResult, Ride } from '@campunex/shared';

export interface SearchMatchParams {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  departure_time?: string;
  max_distance_meters?: number;
}

export async function findMatchingRides(params: SearchMatchParams): Promise<MatchResult[]> {
  const {
    pickup_lat,
    pickup_lng,
    dropoff_lat,
    dropoff_lng,
    departure_time,
    max_distance_meters = config.spatial.matchingProximityMeters,
  } = params;

  const query = `
    SELECT 
      r.id,
      r.driver_id,
      r.origin_name,
      r.destination_name,
      ST_Y(r.origin_geom::geometry) AS origin_lat,
      ST_X(r.origin_geom::geometry) AS origin_lng,
      ST_Y(r.destination_geom::geometry) AS destination_lat,
      ST_X(r.destination_geom::geometry) AS destination_lng,
      ST_AsGeoJSON(r.route_geometry) AS route_geometry,
      r.departure_time,
      r.total_seats,
      r.available_seats,
      r.status,
      r.created_at,
      r.updated_at,
      u.name AS driver_name,
      -- PostGIS Spatial Proximity Distances in meters (SRID 4326 Geography)
      ST_Distance(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS pickup_dist,
      ST_Distance(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography) AS dest_dist,
      -- PostGIS Line Fraction Order (0.0 to 1.0 along driver route)
      ST_LineLocatePoint(r.route_geometry::geometry, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geometry) AS pickup_fraction,
      ST_LineLocatePoint(r.route_geometry::geometry, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geometry) AS dest_fraction,
      -- Route Length in meters
      ST_Length(r.route_geometry::geography) AS driver_route_length
    FROM rides r
    JOIN users u ON r.driver_id = u.id
    WHERE (r.status = 'SCHEDULED' OR r.status = 'OPEN')
      AND r.available_seats > 0
      AND r.departure_time + INTERVAL '30 minutes' >= NOW()
      AND ST_DWithin(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $5);
  `;

  const values = [pickup_lng, pickup_lat, dropoff_lng, dropoff_lat, max_distance_meters];
  const res = await pool.query(query, values);

  const results: MatchResult[] = res.rows
    .map((row) => {
      const pickupDist = parseFloat(row.pickup_dist) || 0;
      const destDist = parseFloat(row.dest_dist) || 0;
      const pickupFraction = parseFloat(row.pickup_fraction) || 0;
      const destFraction = parseFloat(row.dest_fraction) || 0.99;
      const driverRouteLen = parseFloat(row.driver_route_length) || 10000;

      // 1. ROUTE COVERAGE (50% Weight)
      // Percentage of passenger trip covered along the driver corridor
      const coveredFraction = Math.max(0, destFraction - pickupFraction);
      const routeCoverageScore = Math.min(100, Math.max(0, coveredFraction * 100));

      // 2. PICKUP PROXIMITY (20% Weight)
      // 0m = 100%, 500m = 0%
      const pickupScore = Math.max(0, 100 - (pickupDist / max_distance_meters) * 100);

      // 3. DESTINATION PROXIMITY (20% Weight)
      // 0m = 100%, 1000m = 0%
      const destScore = Math.max(0, 100 - (destDist / (max_distance_meters * 2)) * 100);

      // 4. DIRECTION / ORDER (10% Weight)
      // 100% if pickup is before dropoff along driver route, else 0%
      const directionScore = pickupFraction <= destFraction ? 100 : 0;

      // Weighted Final Score
      const matchScore = Math.round(
        routeCoverageScore * 0.50 +
        pickupScore * 0.20 +
        destScore * 0.20 +
        directionScore * 0.10
      );

      const ride: Ride = {
        id: row.id,
        driver_id: row.driver_id,
        origin_name: row.origin_name,
        destination_name: row.destination_name,
        origin: { latitude: parseFloat(row.origin_lat), longitude: parseFloat(row.origin_lng) },
        destination: { latitude: parseFloat(row.destination_lat), longitude: parseFloat(row.destination_lng) },
        route_geometry: row.route_geometry,
        departure_time: new Date(row.departure_time).toISOString(),
        total_seats: row.total_seats,
        available_seats: row.available_seats,
        status: row.status,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      };

      return {
        ride,
        driver_name: row.driver_name,
        matchScore,
        routeCompatibility: Math.round(routeCoverageScore),
        pickupDistanceMeters: Math.round(pickupDist),
        dropoffDistanceMeters: Math.round(destDist),
        timeDifferenceMinutes: 0,
      };
    })
    .filter((m) => m.matchScore >= 40); // Filter out unviable matches

  // Sort descending by calculated matchScore
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}
