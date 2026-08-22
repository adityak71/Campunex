import { pool } from '../../config/db.js';
import { pointToWkt, lineStringToWkt } from '../../utils/postgis.js';
import { createAndEmitNotification } from '../../utils/notifications.js';
import { GeoPoint, Ride } from '@campunex/shared';

export async function createRide(data: {
  driverId: string;
  origin_name: string;
  destination_name: string;
  origin: GeoPoint;
  destination: GeoPoint;
  waypoints?: GeoPoint[];
  departure_time: string;
  total_seats: number;
}): Promise<Ride> {
  const {
    driverId,
    origin_name,
    destination_name,
    origin,
    destination,
    waypoints = [],
    departure_time,
    total_seats,
  } = data;

  const originWkt = pointToWkt(origin);
  const destWkt = pointToWkt(destination);

  const routePoints = [origin, ...waypoints, destination];
  const routeWkt = lineStringToWkt(routePoints);

  const query = `
    INSERT INTO rides (
      driver_id,
      origin_name,
      destination_name,
      origin_geom,
      destination_geom,
      route_geometry,
      departure_time,
      total_seats,
      available_seats,
      status
    )
    VALUES (
      $1,
      $2,
      $3,
      ST_GeomFromText($4, 4326),
      ST_GeomFromText($5, 4326),
      ST_GeomFromText($6, 4326),
      $7,
      $8,
      $8,
      'SCHEDULED'
    )
    RETURNING
      id,
      driver_id,
      origin_name,
      destination_name,
      ST_Y(origin_geom::geometry) AS origin_lat,
      ST_X(origin_geom::geometry) AS origin_lng,
      ST_Y(destination_geom::geometry) AS destination_lat,
      ST_X(destination_geom::geometry) AS destination_lng,
      ST_AsGeoJSON(route_geometry) AS route_geometry,
      departure_time,
      total_seats,
      available_seats,
      status,
      created_at,
      updated_at;
  `;

  const res = await pool.query(query, [
    driverId,
    origin_name,
    destination_name,
    originWkt,
    destWkt,
    routeWkt,
    departure_time,
    total_seats,
  ]);

  const row = res.rows[0];
  const ride = {
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

  // Notify driver their ride was published (DB + WebSocket)
  await createAndEmitNotification({
    userId: driverId,
    role: 'DRIVER',
    category: 'RIDE',
    type: 'RIDE_PUBLISHED_SUCCESSFULLY',
    title: 'Ride Published Successfully',
    message: `Your route from ${row.origin_name} to ${row.destination_name} is now open for 500m route matching.`,
    state: 'SUCCESS',
    priority: 'NORMAL',
    link: '/driver/rides',
    action_label: 'View Ride',
  });

  return ride;
}

export async function getDriverRides(driverId: string): Promise<Ride[]> {
  try {
    // Automatically expire unstarted scheduled rides past the 30-minute grace period
    await pool.query(`
      UPDATE rides
      SET status = 'EXPIRED', updated_at = NOW()
      WHERE (status = 'SCHEDULED' OR status = 'OPEN')
        AND departure_time + INTERVAL '30 minutes' < NOW();
    `);

    const query = `
      SELECT 
        id,
        driver_id,
        origin_name,
        destination_name,
        COALESCE(ST_Y(origin_geom::geometry), 31.2536) AS origin_lat,
        COALESCE(ST_X(origin_geom::geometry), 75.7037) AS origin_lng,
        COALESCE(ST_Y(destination_geom::geometry), 31.3260) AS destination_lat,
        COALESCE(ST_X(destination_geom::geometry), 75.5762) AS destination_lng,
        ST_AsGeoJSON(route_geometry) AS route_geometry,
        departure_time,
        total_seats,
        available_seats,
        status,
        created_at,
        updated_at
      FROM rides
      WHERE driver_id = $1
      ORDER BY departure_time DESC;
    `;

    const res = await pool.query(query, [driverId]);

    return res.rows.map((row) => {
      const depTime = new Date(row.departure_time).getTime();
      const isPastGrace = depTime + 30 * 60 * 1000 < Date.now();
      let effectiveStatus = row.status;

      if ((row.status === 'SCHEDULED' || row.status === 'OPEN') && isPastGrace) {
        effectiveStatus = 'EXPIRED';
      }

      return {
        id: row.id,
        driver_id: row.driver_id,
        origin_name: row.origin_name,
        destination_name: row.destination_name,
        origin: { latitude: parseFloat(row.origin_lat || '31.2536'), longitude: parseFloat(row.origin_lng || '75.7037') },
        destination: { latitude: parseFloat(row.destination_lat || '31.3260'), longitude: parseFloat(row.destination_lng || '75.5762') },
        route_geometry: row.route_geometry,
        departure_time: new Date(row.departure_time).toISOString(),
        total_seats: row.total_seats,
        available_seats: row.available_seats,
        status: effectiveStatus,
        created_at: new Date(row.created_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
      };
    });
  } catch (err: any) {
    console.error('getDriverRides error:', err);
    return [];
  }
}

export async function requestRide(data: {
  riderId: string;
  rideId: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
}): Promise<any> {
  const { riderId, rideId, pickup, dropoff } = data;

  const rideRes = await pool.query('SELECT available_seats, status FROM rides WHERE id = $1;', [
    rideId,
  ]);

  if (rideRes.rows.length === 0) {
    throw new Error('Ride not found');
  }

  if (rideRes.rows[0].available_seats <= 0) {
    throw new Error('No available seats for this ride');
  }

  const existingRes = await pool.query(
    'SELECT id FROM ride_requests WHERE ride_id = $1 AND rider_id = $2 AND status != \'CANCELLED\';',
    [rideId, riderId]
  );

  if (existingRes.rows.length > 0) {
    throw new Error('You have already submitted a request for this ride');
  }

  const pickupWkt = pointToWkt(pickup);
  const dropoffWkt = pointToWkt(dropoff);

  const insertRes = await pool.query(
    `INSERT INTO ride_requests (ride_id, rider_id, pickup_geom, dropoff_geom, status)
     VALUES ($1, $2, ST_GeomFromText($3, 4326), ST_GeomFromText($4, 4326), 'REQUESTED')
     RETURNING id, ride_id, rider_id, status, created_at;`,
    [rideId, riderId, pickupWkt, dropoffWkt]
  );

  // Notify the driver of the new incoming seat request (DB + WebSocket)
  const rideDriverRes = await pool.query('SELECT driver_id FROM rides WHERE id = $1;', [rideId]);
  const driverIdForNotif = rideDriverRes.rows[0]?.driver_id;
  if (driverIdForNotif) {
    await createAndEmitNotification({
      userId: driverIdForNotif,
      role: 'DRIVER',
      category: 'REQUEST',
      type: 'NEW_RIDER_REQUEST',
      title: 'New Ride Seat Request',
      message: 'A rider has requested a seat on your published route.',
      state: 'ACTION_REQUIRED',
      priority: 'HIGH',
      link: '/driver/requests',
      action_label: 'Review Request',
    });
  }

  return insertRes.rows[0];
}

export async function getRiderRequests(riderId: string): Promise<any[]> {
  const query = `
    SELECT 
      req.id,
      req.ride_id,
      req.status,
      req.created_at,
      r.origin_name,
      r.destination_name,
      r.departure_time,
      u.name AS driver_name,
      t.id AS trip_id,
      t.status AS trip_status
    FROM ride_requests req
    JOIN rides r ON req.ride_id = r.id
    JOIN users u ON r.driver_id = u.id
    LEFT JOIN trips t ON t.ride_request_id = req.id
    WHERE req.rider_id = $1
    ORDER BY req.created_at DESC;
  `;
  const res = await pool.query(query, [riderId]);
  return res.rows;
}

export async function getRideRequestsForDriver(driverId: string, rideId: string): Promise<any[]> {
  return getAllDriverRideRequests(driverId, rideId);
}

export async function getAllDriverRideRequests(driverId: string, rideId?: string): Promise<any[]> {
  let query = `
    SELECT 
      req.id,
      req.ride_id,
      req.rider_id,
      req.status,
      req.created_at,
      u.name AS rider_name,
      u.email AS rider_email,
      r.origin_name AS ride_origin,
      r.destination_name AS ride_dest,
      ST_Y(r.origin_geom::geometry) AS origin_lat,
      ST_X(r.origin_geom::geometry) AS origin_lng,
      ST_Y(r.destination_geom::geometry) AS dest_lat,
      ST_X(r.destination_geom::geometry) AS dest_lng,
      r.departure_time,
      r.total_seats,
      r.available_seats
    FROM ride_requests req
    JOIN rides r ON req.ride_id = r.id
    JOIN users u ON req.rider_id = u.id
    WHERE r.driver_id = $1
  `;

  const values: any[] = [driverId];
  if (rideId) {
    query += ` AND req.ride_id = $2`;
    values.push(rideId);
  }

  query += ` ORDER BY req.created_at DESC;`;
  const res = await pool.query(query, values);
  return res.rows;
}

export async function updateRideRequestStatus(data: {
  driverId: string;
  requestId: string;
  status: 'ACCEPTED' | 'REJECTED';
}): Promise<any> {
  const { driverId, requestId, status } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reqRes = await client.query(
      `SELECT req.id, req.ride_id, req.rider_id, req.status, r.driver_id, r.available_seats
       FROM ride_requests req
       JOIN rides r ON req.ride_id = r.id
       WHERE req.id = $1 FOR UPDATE;`,
      [requestId]
    );

    if (reqRes.rows.length === 0) {
      throw new Error('Ride request not found');
    }

    const reqInfo = reqRes.rows[0];

    if (reqInfo.driver_id !== driverId) {
      throw new Error('Unauthorized to manage requests for this ride');
    }

    if (reqInfo.status !== 'REQUESTED') {
      throw new Error(`Request has already been ${reqInfo.status.toLowerCase()}`);
    }

    if (status === 'ACCEPTED') {
      if (reqInfo.available_seats <= 0) {
        throw new Error('Cannot accept request: No available seats remaining');
      }

      // Decrement seats atomically
      await client.query('UPDATE rides SET available_seats = available_seats - 1 WHERE id = $1;', [
        reqInfo.ride_id,
      ]);

      // Update request status
      await client.query('UPDATE ride_requests SET status = \'ACCEPTED\' WHERE id = $1;', [
        requestId,
      ]);

      // Initialize Trip Record
      const tripRes = await client.query(
        `INSERT INTO trips (ride_request_id, ride_id, rider_id, driver_id, status)
         VALUES ($1, $2, $3, $4, 'ACCEPTED')
         RETURNING id, ride_request_id, ride_id, rider_id, driver_id, status, created_at;`,
        [requestId, reqInfo.ride_id, reqInfo.rider_id, driverId]
      );

      const tripId = tripRes.rows[0]?.id;

      // Notify rider their request was accepted (DB + WebSocket)
      await createAndEmitNotification({
        userId: reqInfo.rider_id,
        role: 'RIDER',
        category: 'REQUEST',
        type: 'REQUEST_ACCEPTED',
        title: 'Driver Accepted Your Request!',
        message: 'Your seat booking has been accepted. A live trip tracking room is now active.',
        state: 'SUCCESS',
        priority: 'HIGH',
        link: tripId ? `/trip/${tripId}` : `/rides/requests`,
        action_label: 'View Trip',
      });

      await client.query('COMMIT');
      return { requestStatus: 'ACCEPTED', trip: tripRes.rows[0] };
    } else {
      await client.query('UPDATE ride_requests SET status = \'REJECTED\' WHERE id = $1;', [
        requestId,
      ]);

      // Notify rider their request was declined (DB + WebSocket)
      await createAndEmitNotification({
        userId: reqInfo.rider_id,
        role: 'RIDER',
        category: 'REQUEST',
        type: 'REQUEST_DECLINED',
        title: 'Driver Declined Your Request',
        message: 'Your seat request was declined. Explore other compatible rides.',
        state: 'WARNING',
        priority: 'NORMAL',
        link: '/rides/find',
        action_label: 'Find Rides',
      });

      await client.query('COMMIT');
      return { requestStatus: 'REJECTED' };
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
