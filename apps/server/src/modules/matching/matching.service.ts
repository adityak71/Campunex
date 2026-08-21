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

  // Window: +/- 2 hours for departure time filtering if specified, otherwise future rides
  const targetTime = departure_time ? new Date(departure_time) : new Date();
  const timeWindowStart = new Date(targetTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const timeWindowEnd = new Date(targetTime.getTime() + 4 * 60 * 60 * 1000).toISOString();

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
      -- Spatial PostGIS Distances in meters
      ST_Distance(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS pickup_route_distance,
      ST_Distance(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography) AS dropoff_route_distance,
      ST_Distance(r.origin_geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS origin_pickup_distance,
      ST_Distance(r.destination_geom::geography, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography) AS destination_dropoff_distance
    FROM rides r
    JOIN users u ON r.driver_id = u.id
    WHERE r.status = 'SCHEDULED'
      AND r.available_seats > 0
      AND r.departure_time BETWEEN $5 AND $6
      -- PostGIS 500-meter route proximity threshold on pickup AND dropoff
      AND ST_DWithin(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $7)
      AND ST_DWithin(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $7);
  `;

  const values = [
    pickup_lng,
    pickup_lat,
    dropoff_lng,
    dropoff_lat,
    timeWindowStart,
    timeWindowEnd,
    max_distance_meters,
  ];

  const res = await pool.query(query, values);

  const results: MatchResult[] = res.rows.map((row) => {
    const pickupRouteDist = parseFloat(row.pickup_route_distance);
    const dropoffRouteDist = parseFloat(row.dropoff_route_distance);
    const originPickupDist = parseFloat(row.origin_pickup_distance);
    const destDropoffDist = parseFloat(row.destination_dropoff_distance);

    const rideTime = new Date(row.departure_time).getTime();
    const timeDiffMinutes = Math.abs(rideTime - targetTime.getTime()) / (1000 * 60);

    // Scoring Breakdown Matrix (0 - 100)
    // 1. Route Compatibility (40%) - proximity of pickup & dropoff to route line (within 500m)
    const routeScore = Math.max(0, 100 - (pickupRouteDist + dropoffRouteDist) / 10);

    // 2. Pickup Proximity (30%) - distance between rider pickup and driver origin
    const pickupScore = Math.max(0, 100 - originPickupDist / 20);

    // 3. Destination Proximity (20%) - distance between rider dropoff and driver destination
    const destScore = Math.max(0, 100 - destDropoffDist / 20);

    // 4. Time Compatibility (10%) - closeness of departure time
    const timeScore = Math.max(0, 100 - timeDiffMinutes * 2);

    const matchScore = Math.round(
      0.4 * routeScore + 0.3 * pickupScore + 0.2 * destScore + 0.1 * timeScore
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
      routeCompatibility: Math.round(routeScore),
      pickupDistanceMeters: Math.round(pickupRouteDist),
      dropoffDistanceMeters: Math.round(dropoffRouteDist),
      timeDifferenceMinutes: Math.round(timeDiffMinutes),
    };
  });

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}
