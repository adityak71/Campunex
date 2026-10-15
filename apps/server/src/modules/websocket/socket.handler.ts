import { Server, Socket } from 'socket.io';
import { verifyToken, JwtPayload } from '../../utils/jwt.js';
import { redis } from '../../config/redis.js';
import { pool } from '../../config/db.js';
import { LocationUpdatePayload } from '@campunex/shared';
import { createAndEmitNotification, notifyAdmins } from '../../utils/notifications.js';

export function initializeWebSocketHandlers(io: Server): void {
  // Authentication Middleware for WebSocket Connections
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      socket.data.user = payload as JwtPayload;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user: JwtPayload = socket.data.user;
    console.log(`⚡ [WebSocket] User connected: ${user.email} (${user.role}) | Socket ID: ${socket.id}`);

    // Auto-join personal user room for targeted events (e.g., OTP delivery to rider only)
    const personalRoom = `user:${user.userId}`;
    socket.join(personalRoom);
    console.log(`🔐 [WebSocket] ${user.email} joined personal room ${personalRoom}`);

    socket.on('trip:join', async (data: { tripId: string }) => {
      try {
        const { tripId } = data;
        if (!tripId) return;

        // Verify authorization (Must be driver or rider of the trip)
        const tripRes = await pool.query(
          'SELECT driver_id, rider_id, status FROM trips WHERE id = $1;',
          [tripId]
        );

        if (tripRes.rows.length === 0) {
          socket.emit('trip:error', { message: 'Trip not found' });
          return;
        }

        const trip = tripRes.rows[0];
        const currentUserId = user.userId || (user as any).id;
        if (trip.driver_id !== currentUserId && trip.rider_id !== currentUserId) {
          socket.emit('trip:error', { message: 'Unauthorized to join this trip room' });
          return;
        }

        const roomName = `trip:${tripId}`;
        socket.join(roomName);
        console.log(`👤 [WebSocket] ${user.email} joined room ${roomName}`);

        // Fetch last known driver location from Redis
        const lastLoc = await redis.hgetall(`trip:location:${tripId}`);
        socket.emit('trip:joined', {
          tripId,
          status: trip.status,
          lastLocation: lastLoc?.lat ? { lat: parseFloat(lastLoc.lat), lng: parseFloat(lastLoc.lng) } : null,
        });
      } catch (err: any) {
        socket.emit('trip:error', { message: 'Failed to join trip room' });
      }
    });

    // 2. Leave Trip Room
    socket.on('trip:leave', (data: { tripId: string }) => {
      if (data?.tripId) {
        socket.leave(`trip:${data.tripId}`);
      }
    });

    // 3. Driver Live GPS Location Stream
    socket.on('trip:location', async (payload: LocationUpdatePayload) => {
      try {
        const { tripId, latitude, longitude, timestamp } = payload;
        if (!tripId || latitude === undefined || longitude === undefined) return;

        if (user.role !== 'DRIVER') {
          socket.emit('trip:error', { message: 'Only driver can emit GPS location updates' });
          return;
        }

        // Strict RBAC: Verify driver owns this trip and trip is active
        const tripCheck = await pool.query(
          `SELECT driver_id, status FROM trips WHERE id = $1;`,
          [tripId]
        );

        if (tripCheck.rows.length === 0) {
          socket.emit('trip:error', { message: 'Trip not found' });
          return;
        }

        const trip = tripCheck.rows[0];
        const driverId = user.userId || (user as any).id;
        if (trip.driver_id !== driverId) {
          socket.emit('trip:error', { message: 'Unauthorized: You are not the driver of this trip' });
          return;
        }

        if (!['STARTED', 'IN_PROGRESS', 'OTP_PENDING'].includes(trip.status)) {
          socket.emit('trip:error', { message: `Cannot broadcast GPS: Trip is in ${trip.status} state` });
          return;
        }

        // Cache latest driver location in Redis for instant retrieval
        await redis.hset(`trip:location:${tripId}`, {
          lat: latitude.toString(),
          lng: longitude.toString(),
          timestamp: (timestamp || Date.now()).toString(),
        });

        // Broadcast location update to Rider in real-time
        socket.to(`trip:${tripId}`).emit('trip:location_update', {
          tripId,
          latitude,
          longitude,
          timestamp: timestamp || Date.now(),
        });
      } catch (err: any) {
        console.error('GPS update failed:', err);
      }
    });

    // 4. Reconnection State Synchronization
    socket.on('trip:reconnect_sync', async (data: { tripId: string }) => {
      try {
        const { tripId } = data;
        if (!tripId) return;

        const tripRes = await pool.query('SELECT status FROM trips WHERE id = $1;', [tripId]);
        const lastLoc = await redis.hgetall(`trip:location:${tripId}`);

        socket.emit('trip:sync_state', {
          tripId,
          status: tripRes.rows[0]?.status || 'UNKNOWN',
          lastLocation: lastLoc?.lat ? { lat: parseFloat(lastLoc.lat), lng: parseFloat(lastLoc.lng) } : null,
        });
      } catch (err) {
        socket.emit('trip:error', { message: 'Failed to sync trip state' });
      }
    });

    // 5. Emergency SOS Trigger (Strict Role-Isolated + Admin Alerts)
    socket.on('trip:sos', async (data: { tripId: string; reason?: string }) => {
      try {
        const { tripId, reason } = data;
        if (!tripId) return;

        const currentUserId = user.userId || (user as any).id;
        const tripRes = await pool.query(
          'SELECT id, driver_id, rider_id, status FROM trips WHERE id = $1;',
          [tripId]
        );

        if (tripRes.rows.length === 0) {
          socket.emit('trip:error', { message: 'Trip not found' });
          return;
        }

        const trip = tripRes.rows[0];
        if (trip.driver_id !== currentUserId && trip.rider_id !== currentUserId) {
          socket.emit('trip:error', { message: 'Unauthorized: Not a trip participant' });
          return;
        }

        // Broadcast urgent SOS alert to the trip room
        io.to(`trip:${tripId}`).emit('trip:sos_alert', {
          tripId,
          triggeredBy: user.email,
          role: user.role,
          reason: reason || 'Emergency assistance requested',
          timestamp: new Date().toISOString(),
        });

        // Notify the OTHER participant
        const isRiderReporter = trip.rider_id === currentUserId;
        const otherPartyId = isRiderReporter ? trip.driver_id : trip.rider_id;
        const otherPartyRole = isRiderReporter ? 'DRIVER' : 'RIDER';

        await createAndEmitNotification({
          recipient_id: otherPartyId,
          recipient_role: otherPartyRole,
          event_type: 'SOS_EMERGENCY_TRIGGERED',
          entity_type: 'TRIP',
          entity_id: tripId,
          category: 'SAFETY',
          title: '🚨 EMERGENCY: SOS Alert Triggered',
          message: `The ${user.role.toLowerCase()} triggered an emergency SOS alert. Campus authorities have been notified.`,
          priority: 'CRITICAL',
          action_type: 'VIEW_TRIP',
          action_url: `/trip/${tripId}`,
        });

        // Notify all platform admins immediately
        await notifyAdmins({
          event_type: 'SOS_EMERGENCY_TRIGGERED',
          entity_type: 'TRIP',
          entity_id: tripId,
          category: 'SAFETY',
          title: `🚨 CRITICAL: SOS Emergency on Trip #${tripId.slice(0, 8)}`,
          message: `SOS triggered by ${user.role} (${user.email}) on active trip #${tripId.slice(0, 8)}. Reason: ${reason || 'Urgent Intervention Needed'}.`,
          priority: 'CRITICAL',
          action_type: 'ADMIN_EMERGENCY',
          action_url: `/admin`,
        });
      } catch (err) {
        console.error('Failed to process SOS trigger:', err);
      }
    });

    // 6. Driver Proximity Notification (Driver Approaching Pickup Landmark)
    socket.on('trip:driver_proximity', async (data: { tripId: string }) => {
      try {
        const { tripId } = data;
        if (!tripId || user.role !== 'DRIVER') return;

        const currentUserId = user.userId || (user as any).id;
        const tripRes = await pool.query(
          'SELECT id, rider_id, status FROM trips WHERE id = $1 AND driver_id = $2;',
          [tripId, currentUserId]
        );

        if (tripRes.rows.length === 0) return;
        const trip = tripRes.rows[0];

        // Notify rider
        await createAndEmitNotification({
          recipient_id: trip.rider_id,
          recipient_role: 'RIDER',
          event_type: 'DRIVER_APPROACHING',
          entity_type: 'TRIP',
          entity_id: tripId,
          category: 'TRIP',
          title: 'Driver Approaching Pickup Point',
          message: 'Your driver is within 500m of the pickup landmark. Please prepare for departure.',
          priority: 'HIGH',
          action_type: 'TRACK_TRIP',
          action_url: `/trip/${tripId}`,
        });
      } catch (err) {
        console.error('Failed to emit proximity notification:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [WebSocket] User disconnected: ${user?.email}`);
    });
  });
}
