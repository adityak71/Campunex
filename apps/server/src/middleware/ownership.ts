import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db.js';

export async function requireRideOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    const rideId = req.params.id || req.params.rideId;

    if (!userId || !rideId) {
      res.status(400).json({ error: 'Ride ID and authenticated user context required' });
      return;
    }

    const checkRes = await pool.query('SELECT driver_id FROM rides WHERE id = $1;', [rideId]);
    if (checkRes.rows.length === 0) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    if (checkRes.rows[0].driver_id !== userId) {
      res.status(403).json({ error: 'Forbidden: You do not own this published ride' });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error during ownership verification' });
  }
}

export async function requireTripParticipant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    const tripId = req.params.id || req.params.tripId;

    if (!userId || !tripId) {
      res.status(400).json({ error: 'Trip ID and authenticated user context required' });
      return;
    }

    const checkRes = await pool.query('SELECT driver_id, rider_id FROM trips WHERE id = $1;', [tripId]);
    if (checkRes.rows.length === 0) {
      res.status(404).json({ error: 'Trip session not found' });
      return;
    }

    const { driver_id, rider_id } = checkRes.rows[0];
    if (driver_id !== userId && rider_id !== userId) {
      res.status(403).json({ error: 'Forbidden: You are not an authorized participant in this trip' });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error during trip participant verification' });
  }
}

export async function requireRequestOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    const requestId = req.params.id || req.params.requestId;

    if (!userId || !requestId) {
      res.status(400).json({ error: 'Request ID and authenticated user context required' });
      return;
    }

    const checkRes = await pool.query('SELECT rider_id FROM ride_requests WHERE id = $1;', [requestId]);
    if (checkRes.rows.length === 0) {
      res.status(404).json({ error: 'Ride request not found' });
      return;
    }

    if (checkRes.rows[0].rider_id !== userId) {
      res.status(403).json({ error: 'Forbidden: You do not own this seat request' });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error during request ownership verification' });
  }
}
