import { pool } from '../../config/db.js';
import { generateAndStoreTripOtp, verifyTripOtp } from '../otp/otp.service.js';
import { io } from '../../server.js';
import { createAndEmitNotification } from '../../utils/notifications.js';
import { TripStatus } from '@campunex/shared';

export async function getTripById(tripId: string, userId: string): Promise<any> {
  const query = `
    SELECT 
      t.id,
      t.ride_request_id,
      t.ride_id,
      t.rider_id,
      t.driver_id,
      t.status,
      t.started_at,
      t.completed_at,
      t.created_at,
      t.updated_at,
      r.origin_name,
      r.destination_name,
      ST_Y(r.origin_geom::geometry) AS origin_lat,
      ST_X(r.origin_geom::geometry) AS origin_lng,
      ST_Y(r.destination_geom::geometry) AS destination_lat,
      ST_X(r.destination_geom::geometry) AS destination_lng,
      ST_AsGeoJSON(r.route_geometry) AS route_geometry,
      u_driver.name AS driver_name,
      u_rider.name AS rider_name
    FROM trips t
    JOIN rides r ON t.ride_id = r.id
    JOIN users u_driver ON t.driver_id = u_driver.id
    JOIN users u_rider ON t.rider_id = u_rider.id
    WHERE t.id = $1;
  `;
  const res = await pool.query(query, [tripId]);

  if (res.rows.length === 0) {
    throw new Error('Trip not found');
  }

  const trip = res.rows[0];
  if (trip.driver_id !== userId && trip.rider_id !== userId) {
    throw new Error('Unauthorized to view this trip');
  }

  return trip;
}

export async function initiateStartOtp(driverId: string, tripId: string): Promise<{ otp: string }> {
  const tripRes = await pool.query(
    'SELECT driver_id, status FROM trips WHERE id = $1;',
    [tripId]
  );

  if (tripRes.rows.length === 0) {
    throw new Error('Trip not found');
  }

  const trip = tripRes.rows[0];
  if (trip.driver_id !== driverId) {
    throw new Error('Unauthorized: Only the driver can request the start OTP');
  }

  if (!['ACCEPTED', 'OTP_PENDING', 'STARTED'].includes(trip.status)) {
    throw new Error(`Cannot generate start OTP for trip in ${trip.status} state`);
  }

  const { otp, hash } = await generateAndStoreTripOtp(tripId, 'START');

  await pool.query(
    `UPDATE trips SET status = 'OTP_PENDING', start_otp_hash = $1, updated_at = NOW() WHERE id = $2;`,
    [hash, tripId]
  );

  // Broadcast OTP event ONLY to rider's personal room (not driver)
  const riderIdForOtp = await pool.query('SELECT rider_id FROM trips WHERE id = $1;', [tripId]);
  const riderId = riderIdForOtp.rows[0]?.rider_id;
  if (riderId) {
    io.to(`user:${riderId}`).emit('trip:otp_generated', {
      tripId,
      type: 'START',
      otp,
    });
  }

  io.to(`trip:${tripId}`).emit('trip:status_change', {
    tripId,
    status: 'OTP_PENDING' as TripStatus,
    timestamp: new Date().toISOString(),
  });

  return { otp };
}

export async function processStartOtpVerification(
  driverId: string,
  tripId: string,
  submittedOtp: string
): Promise<{ status: TripStatus }> {
  const tripRes = await pool.query('SELECT driver_id, status FROM trips WHERE id = $1;', [
    tripId,
  ]);

  if (tripRes.rows.length === 0) {
    throw new Error('Trip not found');
  }

  const trip = tripRes.rows[0];
  if (trip.driver_id !== driverId) {
    throw new Error('Unauthorized: Only the driver can verify the start OTP');
  }

  await verifyTripOtp(tripId, 'START', submittedOtp);

  const updatedStatus: TripStatus = 'IN_PROGRESS';
  await pool.query(
    `UPDATE trips SET status = $1, started_at = NOW(), updated_at = NOW() WHERE id = $2;`,
    [updatedStatus, tripId]
  );

  // Fetch rider_id to notify them
  const riderRes = await pool.query('SELECT rider_id FROM trips WHERE id = $1;', [tripId]);
  const riderId = riderRes.rows[0]?.rider_id;
  if (riderId) {
    await createAndEmitNotification({
      userId: riderId,
      role: 'RIDER',
      category: 'TRIP',
      type: 'TRIP_STARTED',
      title: 'Trip Has Started!',
      message: 'Your driver has verified your OTP. The trip is now in progress.',
      state: 'SUCCESS',
      priority: 'HIGH',
      link: `/trip/${tripId}`,
      action_label: 'Track Trip',
    });
  }

  // Broadcast status update to trip room
  io.to(`trip:${tripId}`).emit('trip:status_change', {
    tripId,
    status: updatedStatus,
    timestamp: new Date().toISOString(),
  });

  return { status: updatedStatus };
}

export async function initiateCompletionOtp(
  driverId: string,
  tripId: string
): Promise<{ otp: string }> {
  const tripRes = await pool.query('SELECT driver_id, status FROM trips WHERE id = $1;', [
    tripId,
  ]);

  if (tripRes.rows.length === 0) {
    throw new Error('Trip not found');
  }

  const trip = tripRes.rows[0];
  if (trip.driver_id !== driverId) {
    throw new Error('Unauthorized: Only the driver can request completion OTP');
  }

  if (!['STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(trip.status)) {
    throw new Error(`Cannot generate completion OTP for trip in ${trip.status} state`);
  }

  const { otp, hash } = await generateAndStoreTripOtp(tripId, 'COMPLETION');

  await pool.query(
    `UPDATE trips SET status = 'COMPLETION_PENDING', completion_otp_hash = $1, updated_at = NOW() WHERE id = $2;`,
    [hash, tripId]
  );

  // Broadcast OTP event ONLY to rider's personal room (not driver)
  const riderIdForCompOtp = await pool.query('SELECT rider_id FROM trips WHERE id = $1;', [tripId]);
  const riderIdComp = riderIdForCompOtp.rows[0]?.rider_id;
  if (riderIdComp) {
    io.to(`user:${riderIdComp}`).emit('trip:otp_generated', {
      tripId,
      type: 'COMPLETION',
      otp,
    });
  }

  io.to(`trip:${tripId}`).emit('trip:status_change', {
    tripId,
    status: 'COMPLETION_PENDING' as TripStatus,
    timestamp: new Date().toISOString(),
  });

  return { otp };
}

export async function processCompletionOtpVerification(
  driverId: string,
  tripId: string,
  submittedOtp: string
): Promise<{ status: TripStatus }> {
  const tripRes = await pool.query('SELECT driver_id, status FROM trips WHERE id = $1;', [
    tripId,
  ]);

  if (tripRes.rows.length === 0) {
    throw new Error('Trip not found');
  }

  const trip = tripRes.rows[0];
  if (trip.driver_id !== driverId) {
    throw new Error('Unauthorized: Only the driver can verify completion OTP');
  }

  await verifyTripOtp(tripId, 'COMPLETION', submittedOtp);

  const updatedStatus: TripStatus = 'COMPLETED';
  await pool.query(
    `UPDATE trips SET status = $1, completed_at = NOW(), updated_at = NOW() WHERE id = $2;`,
    [updatedStatus, tripId]
  );

  // Fetch rider_id to notify both parties of trip completion
  const riderForCompletion = await pool.query('SELECT rider_id FROM trips WHERE id = $1;', [tripId]);
  const riderIdComp = riderForCompletion.rows[0]?.rider_id;
  const completionLink = `/trip/${tripId}`;

  if (riderIdComp) {
    await createAndEmitNotification({
      userId: riderIdComp,
      role: 'RIDER',
      category: 'TRIP',
      type: 'TRIP_COMPLETED',
      title: 'Trip Completed!',
      message: 'Your campus commute has been completed successfully. Thank you for using Campunex!',
      state: 'SUCCESS',
      priority: 'NORMAL',
      link: completionLink,
      action_label: 'View Trip',
    });
  }
  await createAndEmitNotification({
    userId: driverId,
    role: 'DRIVER',
    category: 'TRIP',
    type: 'TRIP_COMPLETED',
    title: 'Trip Completed!',
    message: 'All completion OTPs verified. Trip logged in Campunex history.',
    state: 'SUCCESS',
    priority: 'NORMAL',
    link: '/driver/history',
    action_label: 'View History',
  });

  io.to(`trip:${tripId}`).emit('trip:status_change', {
    tripId,
    status: updatedStatus,
    timestamp: new Date().toISOString(),
  });

  return { status: updatedStatus };
}

export async function getUserTripHistory(userId: string): Promise<any[]> {
  const query = `
    SELECT 
      t.id,
      t.status,
      t.started_at,
      t.completed_at,
      t.created_at,
      r.origin_name,
      r.destination_name,
      r.departure_time,
      u_driver.name AS driver_name,
      u_rider.name AS rider_name
    FROM trips t
    JOIN rides r ON t.ride_id = r.id
    JOIN users u_driver ON t.driver_id = u_driver.id
    JOIN users u_rider ON t.rider_id = u_rider.id
    WHERE t.driver_id = $1 OR t.rider_id = $1
    ORDER BY t.created_at DESC;
  `;
  const res = await pool.query(query, [userId]);
  return res.rows;
}

export async function markRiderNoShow(driverId: string, rideRequestId: string): Promise<void> {
  // Verify the trip and driver
  const tripRes = await pool.query(
    'SELECT id, ride_id, status FROM trips WHERE ride_request_id = $1 AND driver_id = $2;',
    [rideRequestId, driverId]
  );

  if (tripRes.rows.length === 0) {
    throw new Error('Trip not found or unauthorized');
  }

  const trip = tripRes.rows[0];
  if (['COMPLETED', 'CANCELLED'].includes(trip.status)) {
    throw new Error(`Cannot mark no-show for a trip in ${trip.status} state`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update trip to CANCELLED
    await client.query('UPDATE trips SET status = $1, updated_at = NOW() WHERE id = $2;', [
      'CANCELLED',
      trip.id,
    ]);

    // Update ride_request to CANCELLED
    await client.query('UPDATE ride_requests SET status = $1, updated_at = NOW() WHERE id = $2;', [
      'CANCELLED',
      rideRequestId,
    ]);

    // Restore the seat in rides
    await client.query('UPDATE rides SET available_seats = available_seats + 1 WHERE id = $1;', [
      trip.ride_id,
    ]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
