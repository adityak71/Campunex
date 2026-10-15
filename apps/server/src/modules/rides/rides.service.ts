import { pool } from '../../config/db.js';
import { redis } from '../../config/redis.js';
import { generate4DigitOtp, hashOtp } from '../otp/otp.service.js';
import { io } from '../../server.js';
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

  // 1. Verify driver KYC and vehicle profile is approved by Admin
  const driverProfileRes = await pool.query(
    'SELECT approval_status FROM driver_profiles WHERE user_id = $1;',
    [driverId]
  );
  if (driverProfileRes.rows.length === 0 || driverProfileRes.rows[0].approval_status !== 'APPROVED') {
    throw new Error('Your driver profile is pending verification. You can offer rides once approved by Admin (usually 24-48 hours).');
  }

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
    recipient_id: driverId,
    recipient_role: 'DRIVER',
    event_type: 'RIDE_CREATED',
    entity_type: 'RIDE',
    entity_id: ride.id,
    category: 'RIDE',
    title: 'Ride Published Successfully',
    message: `Your route from ${row.origin_name} to ${row.destination_name} is now open for route matching.`,
    priority: 'NORMAL',
    action_type: 'VIEW_RIDE',
    action_url: `/driver/rides/${ride.id}`,
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

    return res.rows.map((row: any) => {
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

export async function getRideById(rideId: string): Promise<any> {
  const query = `
    SELECT 
      r.id,
      r.driver_id,
      r.origin_name,
      r.destination_name,
      COALESCE(ST_Y(r.origin_geom::geometry), 31.2536) AS origin_lat,
      COALESCE(ST_X(r.origin_geom::geometry), 75.7037) AS origin_lng,
      COALESCE(ST_Y(r.destination_geom::geometry), 31.3260) AS destination_lat,
      COALESCE(ST_X(r.destination_geom::geometry), 75.5762) AS destination_lng,
      ST_AsGeoJSON(r.route_geometry) AS route_geometry,
      r.departure_time,
      r.total_seats,
      r.available_seats,
      r.status,
      r.created_at,
      r.updated_at,
      u.name AS driver_name,
      u.verification_status AS driver_verification_status
    FROM rides r
    JOIN users u ON r.driver_id = u.id
    WHERE r.id = $1;
  `;
  const res = await pool.query(query, [rideId]);
  if (res.rows.length === 0) {
    throw new Error('Ride not found');
  }

  const row = res.rows[0];
  return {
    id: row.id,
    driver_id: row.driver_id,
    driver_name: row.driver_name,
    driver_verified: row.driver_verification_status === 'VERIFIED',
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
      recipient_id: driverIdForNotif,
      recipient_role: 'DRIVER',
      event_type: 'RIDE_REQUEST_RECEIVED',
      entity_type: 'RIDE_REQUEST',
      entity_id: insertRes.rows[0].id,
      category: 'REQUEST',
      title: 'New Ride Seat Request',
      message: 'A rider has requested a seat on your published route.',
      priority: 'HIGH',
      action_type: 'REVIEW_REQUEST',
      action_url: '/driver/requests',
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
      r.available_seats,
      t.id AS trip_id
    FROM ride_requests req
    JOIN rides r ON req.ride_id = r.id
    JOIN users u ON req.rider_id = u.id
    LEFT JOIN trips t ON t.ride_request_id = req.id
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

      // Decrement seats atomically and update ride status if full (prevents negative seats)
      const updateSeatsRes = await client.query(
        `UPDATE rides 
         SET available_seats = available_seats - 1,
             status = CASE WHEN available_seats - 1 <= 0 THEN 'FULL' ELSE status END
         WHERE id = $1 AND available_seats > 0
         RETURNING available_seats;`,
        [reqInfo.ride_id]
      );

      if (updateSeatsRes.rowCount === 0) {
        throw new Error('Seat concurrency conflict: No available seats remaining');
      }

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
        recipient_id: reqInfo.rider_id,
        recipient_role: 'RIDER',
        event_type: 'RIDE_REQUEST_ACCEPTED',
        entity_type: 'TRIP',
        entity_id: tripId,
        category: 'REQUEST',
        title: 'Ride Request Accepted!',
        message: 'Your seat booking has been accepted. A live trip tracking room is now active.',
        priority: 'HIGH',
        action_type: 'VIEW_TRIP',
        action_url: tripId ? `/trip/${tripId}` : `/rides/requests`,
      });

      // If ride is now fully booked, notify the driver
      if (updateSeatsRes.rows[0]?.available_seats === 0) {
        await createAndEmitNotification({
          recipient_id: driverId,
          recipient_role: 'DRIVER',
          event_type: 'RIDE_FULL',
          entity_type: 'RIDE',
          entity_id: reqInfo.ride_id,
          category: 'RIDE',
          title: 'Ride Fully Booked!',
          message: 'All available seats on your published route have been booked.',
          priority: 'NORMAL',
          action_type: 'VIEW_RIDE',
          action_url: `/driver/rides/${reqInfo.ride_id}`,
        });
      }

      await client.query('COMMIT');
      return { requestStatus: 'ACCEPTED', trip: tripRes.rows[0] };
    } else {
      await client.query('UPDATE ride_requests SET status = \'REJECTED\' WHERE id = $1;', [
        requestId,
      ]);

      // Notify rider their request was declined (DB + WebSocket)
      await createAndEmitNotification({
        recipient_id: reqInfo.rider_id,
        recipient_role: 'RIDER',
        event_type: 'RIDE_REQUEST_REJECTED',
        entity_type: 'RIDE_REQUEST',
        entity_id: requestId,
        category: 'REQUEST',
        title: 'Driver Declined Your Request',
        message: 'Your seat request was declined. Explore other compatible rides.',
        priority: 'NORMAL',
        action_type: 'FIND_RIDES',
        action_url: '/rides/find',
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

export async function initiateRideRequestCancelOtp(data: {
  riderId: string;
  requestId: string;
}): Promise<{ message: string; otp: string }> {
  const { riderId, requestId } = data;

  const reqRes = await pool.query(
    `SELECT req.id, req.rider_id, req.status, r.origin_name, r.destination_name
     FROM ride_requests req
     JOIN rides r ON req.ride_id = r.id
     WHERE req.id = $1;`,
    [requestId]
  );

  if (reqRes.rows.length === 0) {
    throw new Error('Ride request not found');
  }

  const reqInfo = reqRes.rows[0];
  if (reqInfo.rider_id !== riderId) {
    throw new Error('Unauthorized: You can only request cancellation OTP for your own bookings');
  }

  if (reqInfo.status !== 'ACCEPTED') {
    throw new Error('Cancellation OTP is only required for accepted bookings');
  }

  // Generate 4-digit OTP
  const otp = generate4DigitOtp();
  const hash = hashOtp(otp);
  const redisKey = `otp:cancel_request:${requestId}`;
  await redis.setex(redisKey, 300, hash); // 5 minutes TTL

  // Send via WebSocket to rider's room
  io.to(`user:${riderId}`).emit('trip:cancellation_otp', {
    requestId,
    otp,
    message: 'Your 4-digit cancellation verification code',
  });

  return { message: 'Cancellation OTP generated and sent to your account', otp };
}

export async function initiateRideCancelOtp(data: {
  driverId: string;
  rideId: string;
}): Promise<{ message: string; otp?: string; otpRequired: boolean }> {
  const { driverId, rideId } = data;

  const rideRes = await pool.query(
    `SELECT id, driver_id, status FROM rides WHERE id = $1;`,
    [rideId]
  );

  if (rideRes.rows.length === 0) {
    throw new Error('Ride not found');
  }

  const ride = rideRes.rows[0];
  if (ride.driver_id !== driverId) {
    throw new Error('Unauthorized: You can only cancel your own rides');
  }

  // Check if ride has accepted riders
  const acceptedCountRes = await pool.query(
    `SELECT COUNT(*)::int AS count FROM ride_requests WHERE ride_id = $1 AND status = 'ACCEPTED';`,
    [rideId]
  );
  const hasAcceptedRiders = (acceptedCountRes.rows[0]?.count ?? 0) > 0;

  if (!hasAcceptedRiders) {
    return { message: 'No accepted riders on this ride; OTP not required', otpRequired: false };
  }

  const otp = generate4DigitOtp();
  const hash = hashOtp(otp);
  const redisKey = `otp:cancel_ride:${rideId}`;
  await redis.setex(redisKey, 300, hash);

  io.to(`user:${driverId}`).emit('trip:cancellation_otp', {
    rideId,
    otp,
    message: 'Your 4-digit ride cancellation verification code',
  });

  return { message: 'Cancellation OTP generated and sent to your account', otp, otpRequired: true };
}

export async function cancelRideRequest(data: {
  riderId: string;
  requestId: string;
  otp?: string;
}): Promise<any> {
  const { riderId, requestId, otp } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reqRes = await client.query(
      `SELECT req.id, req.ride_id, req.rider_id, req.status, r.driver_id, r.total_seats
       FROM ride_requests req
       JOIN rides r ON req.ride_id = r.id
       WHERE req.id = $1 FOR UPDATE;`,
      [requestId]
    );

    if (reqRes.rows.length === 0) {
      throw new Error('Ride request not found');
    }

    const reqInfo = reqRes.rows[0];

    if (reqInfo.rider_id !== riderId) {
      throw new Error('Unauthorized: You can only cancel your own booking requests');
    }

    if (reqInfo.status === 'CANCELLED') {
      await client.query('ROLLBACK');
      return { message: 'Request is already cancelled' };
    }

    // Check associated trip state - cannot cancel if already in transit
    const tripRes = await client.query(
      `SELECT id, status FROM trips WHERE ride_request_id = $1;`,
      [requestId]
    );
    const associatedTrip = tripRes.rows[0];
    if (associatedTrip && ['STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED'].includes(associatedTrip.status)) {
      throw new Error(`Cannot cancel ride booking: The trip is already ${associatedTrip.status.toLowerCase()} in transit.`);
    }

    // If it was already accepted, require cancellation OTP!
    if (reqInfo.status === 'ACCEPTED') {
      if (!otp || !otp.trim()) {
        throw new Error('Cancellation OTP is required to cancel an accepted ride booking. Please request a cancellation OTP first.');
      }

      const redisKey = `otp:cancel_request:${requestId}`;
      const storedHash = await redis.get(redisKey);
      if (!storedHash) {
        throw new Error('Cancellation OTP has expired or was not requested. Please click "Request Cancellation OTP".');
      }

      const submittedHash = hashOtp(otp.trim());
      if (submittedHash !== storedHash) {
        throw new Error('Invalid cancellation OTP code. Please enter the correct 4-digit code.');
      }

      await redis.del(redisKey);

      // Release seat back to ride atomically
      await client.query(
        `UPDATE rides 
         SET available_seats = LEAST(total_seats, available_seats + 1),
             status = CASE WHEN status = 'FULL' THEN 'SCHEDULED' ELSE status END
         WHERE id = $1;`,
        [reqInfo.ride_id]
      );

      // Cancel associated trip if active
      await client.query(
        `UPDATE trips SET status = 'CANCELLED', updated_at = NOW() WHERE ride_request_id = $1;`,
        [requestId]
      );
    }

    await client.query(
      `UPDATE ride_requests SET status = 'CANCELLED' WHERE id = $1;`,
      [requestId]
    );

    // Notify driver about cancellation
    await createAndEmitNotification({
      recipient_id: reqInfo.driver_id,
      recipient_role: 'DRIVER',
      event_type: 'RIDE_REQUEST_CANCELLED',
      entity_type: 'RIDE',
      entity_id: reqInfo.ride_id,
      category: 'REQUEST',
      title: 'Passenger Cancelled Booking',
      message: 'A passenger has cancelled their seat request. A seat has been reopened.',
      priority: 'NORMAL',
      action_type: 'VIEW_RIDE',
      action_url: `/driver/rides/${reqInfo.ride_id}`,
    });

    await client.query('COMMIT');
    return { success: true, message: 'Ride request cancelled successfully' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function cancelRide(data: {
  driverId: string;
  rideId: string;
  otp?: string;
}): Promise<any> {
  const { driverId, rideId, otp } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const rideRes = await client.query(
      `SELECT id, driver_id, status FROM rides WHERE id = $1 FOR UPDATE;`,
      [rideId]
    );

    if (rideRes.rows.length === 0) {
      throw new Error('Ride not found');
    }

    const ride = rideRes.rows[0];

    if (ride.driver_id !== driverId) {
      throw new Error('Unauthorized: You can only cancel your own published rides');
    }

    if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
      throw new Error(`Cannot cancel a ride that is already ${ride.status.toLowerCase()}`);
    }

    // Check if any trip is currently active in transit
    const activeTripsRes = await client.query(
      `SELECT id FROM trips WHERE ride_id = $1 AND status IN ('STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING');`,
      [rideId]
    );
    if (activeTripsRes.rows.length > 0) {
      throw new Error('Cannot cancel ride: A trip is currently active in transit. Please complete the trip with the passenger.');
    }

    // Check if ride has any accepted riders
    const acceptedCountRes = await client.query(
      `SELECT COUNT(*)::int AS count FROM ride_requests WHERE ride_id = $1 AND status = 'ACCEPTED';`,
      [rideId]
    );
    const hasAcceptedRiders = (acceptedCountRes.rows[0]?.count ?? 0) > 0;

    if (hasAcceptedRiders) {
      if (!otp || !otp.trim()) {
        throw new Error('Cancellation OTP is required to cancel a ride with accepted passengers. Please request a cancellation OTP first.');
      }
      const redisKey = `otp:cancel_ride:${rideId}`;
      const storedHash = await redis.get(redisKey);
      if (!storedHash) {
        throw new Error('Cancellation OTP has expired or was not requested. Please request a new OTP.');
      }
      const submittedHash = hashOtp(otp.trim());
      if (submittedHash !== storedHash) {
        throw new Error('Invalid cancellation OTP code.');
      }
      await redis.del(redisKey);
    }

    // Mark ride cancelled
    await client.query(
      `UPDATE rides SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1;`,
      [rideId]
    );

    // Cancel all accepted trips
    await client.query(
      `UPDATE trips SET status = 'CANCELLED', updated_at = NOW() WHERE ride_id = $1 AND status != 'COMPLETED';`,
      [rideId]
    );

    // Find all affected riders to notify them
    const affectedRiders = await client.query(
      `SELECT rider_id FROM ride_requests WHERE ride_id = $1 AND status IN ('REQUESTED', 'ACCEPTED');`,
      [rideId]
    );

    // Cancel all open or accepted requests
    await client.query(
      `UPDATE ride_requests SET status = 'CANCELLED' WHERE ride_id = $1 AND status IN ('REQUESTED', 'ACCEPTED');`,
      [rideId]
    );

    await client.query('COMMIT');

    // Notify all affected riders
    for (const r of affectedRiders.rows) {
      createAndEmitNotification({
        recipient_id: r.rider_id,
        recipient_role: 'RIDER',
        event_type: 'RIDE_CANCELLED_BY_DRIVER',
        entity_type: 'RIDE',
        entity_id: rideId,
        category: 'RIDE',
        title: 'Ride Cancelled by Driver',
        message: 'The driver had to cancel this scheduled ride. Please explore alternate rides.',
        priority: 'HIGH',
        action_type: 'FIND_RIDES',
        action_url: '/rides/find',
      }).catch(console.error);
    }

    return { success: true, message: 'Ride cancelled successfully' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateRideSeats(data: {
  driverId: string;
  rideId: string;
  totalSeats: number;
}): Promise<any> {
  const { driverId, rideId, totalSeats } = data;

  const rideRes = await pool.query(
    `SELECT id, driver_id, total_seats, available_seats, status FROM rides WHERE id = $1;`,
    [rideId]
  );

  if (rideRes.rows.length === 0) {
    throw new Error('Ride not found');
  }

  const ride = rideRes.rows[0];
  if (ride.driver_id !== driverId) {
    throw new Error('Unauthorized: You can only update seats for your own rides');
  }

  const bookedSeats = ride.total_seats - ride.available_seats;
  if (totalSeats < bookedSeats) {
    throw new Error(`Cannot set seats lower than already confirmed bookings (${bookedSeats})`);
  }

  const newAvailable = totalSeats - bookedSeats;
  const newStatus = newAvailable === 0 ? 'FULL' : ride.status === 'FULL' ? 'SCHEDULED' : ride.status;

  const updateRes = await pool.query(
    `UPDATE rides 
     SET total_seats = $1, available_seats = $2, status = $3, updated_at = NOW() 
     WHERE id = $4
     RETURNING id, total_seats, available_seats, status;`,
    [totalSeats, newAvailable, newStatus, rideId]
  );

  // If newly filled, notify driver
  if (newAvailable === 0) {
    createAndEmitNotification({
      recipient_id: driverId,
      recipient_role: 'DRIVER',
      event_type: 'RIDE_FULL',
      entity_type: 'RIDE',
      entity_id: rideId,
      category: 'RIDE',
      title: 'Ride Fully Booked!',
      message: 'All seats on your route have been booked. Ride is now marked full.',
      priority: 'NORMAL',
      action_type: 'VIEW_RIDE',
      action_url: `/driver/rides/${rideId}`,
    });
  }

  // Notify all confirmed riders of ride configuration change
  const ridersRes = await pool.query(
    `SELECT DISTINCT rider_id FROM ride_requests WHERE ride_id = $1 AND status = 'ACCEPTED';`,
    [rideId]
  );
  for (const r of ridersRes.rows) {
    createAndEmitNotification({
      recipient_id: r.rider_id,
      recipient_role: 'RIDER',
      event_type: 'RIDE_UPDATED',
      entity_type: 'RIDE',
      entity_id: rideId,
      category: 'RIDE',
      title: 'Ride Details Updated',
      message: 'Your driver has updated the seat availability for this scheduled commute.',
      priority: 'NORMAL',
      action_type: 'FIND_RIDES',
      action_url: `/rides/find`,
    });
  }

  return updateRes.rows[0];
}
