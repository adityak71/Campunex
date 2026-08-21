import { Router, Request, Response } from 'express';
import { config } from '../config/index.js';
import { pool } from '../config/db.js';
import { redis } from '../config/redis.js';
import { io } from '../server.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/trips/:id/simulate-location', authenticate, async (req: Request, res: Response): Promise<void> => {
  if (!config.dev.enableSimulator) {
    res.status(403).json({ error: 'GPS Simulation disabled in production' });
    return;
  }

  try {
    const tripId = req.params.id;

    const tripRes = await pool.query(
      `SELECT t.id, t.driver_id, t.status, ST_AsGeoJSON(r.route_geometry) AS route_geometry
       FROM trips t
       JOIN rides r ON t.ride_id = r.id
       WHERE t.id = $1;`,
      [tripId]
    );

    if (tripRes.rows.length === 0) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    const trip = tripRes.rows[0];
    const geoJson = JSON.parse(trip.route_geometry);
    const coordinates: [number, number][] = geoJson.coordinates || [];

    if (coordinates.length === 0) {
      res.status(400).json({ error: 'Route geometry has no coordinates' });
      return;
    }

    res.status(200).json({
      message: `Started GPS simulation for trip along ${coordinates.length} waypoints`,
      waypointCount: coordinates.length,
    });

    // Run asynchronous simulation loop
    (async () => {
      console.log(`📡 [DEV GPS SIMULATOR] Playing back ${coordinates.length} waypoints for trip ${tripId}...`);
      for (let i = 0; i < coordinates.length; i++) {
        const [lng, lat] = coordinates[i];
        const timestamp = Date.now();

        // 1. Cache in Redis
        await redis.hset(`trip:location:${tripId}`, {
          lat: lat.toString(),
          lng: lng.toString(),
          timestamp: timestamp.toString(),
        });

        // 2. Broadcast to room
        io.to(`trip:${tripId}`).emit('trip:location_update', {
          tripId,
          latitude: lat,
          longitude: lng,
          timestamp,
        });

        // Pause 2 seconds between waypoints
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      console.log(`✅ [DEV GPS SIMULATOR] Completed simulation for trip ${tripId}`);
    })();
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'GPS simulation failed' });
  }
});

export default router;
