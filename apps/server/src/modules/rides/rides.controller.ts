import { Request, Response } from 'express';
import {
  createRide,
  getDriverRides,
  requestRide,
  getRiderRequests,
  getAllDriverRideRequests,
  updateRideRequestStatus,
} from './rides.service.js';
import { findMatchingRides } from '../matching/matching.service.js';
import { createRideSchema, searchRideSchema } from '@campunex/shared';

export async function handleCreateRide(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createRideSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const driverId = req.user!.userId;
    const ride = await createRide({ driverId, ...parseResult.data });

    res.status(201).json({ message: 'Ride published successfully', ride });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create ride' });
  }
}

export async function handleGetMyRides(req: Request, res: Response): Promise<void> {
  try {
    const driverId = req.user!.userId || (req.user as any)?.id;
    const rides = await getDriverRides(driverId);
    res.status(200).json({ rides });
  } catch (err: any) {
    console.error('handleGetMyRides Error:', err);
    res.status(200).json({ rides: [] });
  }
}

export async function handleSearchMatches(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = searchRideSchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const matches = await findMatchingRides(parseResult.data);
    res.status(200).json({ matches, count: matches.length });
  } catch (err: any) {
    console.error('handleSearchMatches Error:', err);
    res.status(200).json({ matches: [], count: 0 });
  }
}

export async function handleRequestRide(req: Request, res: Response): Promise<void> {
  try {
    const riderId = req.user!.userId || (req.user as any)?.id;
    const rideId = req.params.id;
    const { pickup, dropoff } = req.body;

    if (!pickup || !dropoff) {
      res.status(400).json({ error: 'Pickup and dropoff coordinates are required' });
      return;
    }

    const requestRecord = await requestRide({ riderId, rideId, pickup, dropoff });
    res.status(201).json({ message: 'Ride request submitted', request: requestRecord });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to request ride' });
  }
}

export async function handleGetMyRequests(req: Request, res: Response): Promise<void> {
  try {
    const riderId = req.user!.userId || (req.user as any)?.id;
    const requests = await getRiderRequests(riderId);
    res.status(200).json({ requests });
  } catch (err: any) {
    console.error('handleGetMyRequests Error:', err);
    res.status(200).json({ requests: [] });
  }
}

export async function handleGetDriverRideRequests(req: Request, res: Response): Promise<void> {
  try {
    const driverId = req.user!.userId || (req.user as any)?.id;
    const rideId = req.params.id || (req.query.rideId as string);
    const requests = await getAllDriverRideRequests(driverId, rideId);
    res.status(200).json({ requests });
  } catch (err: any) {
    console.error('handleGetDriverRideRequests Error:', err);
    res.status(200).json({ requests: [] });
  }
}

export async function handleUpdateRequestStatus(req: Request, res: Response): Promise<void> {
  try {
    const driverId = req.user!.userId;
    const requestId = req.params.requestId;
    const { status } = req.body;

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Status must be ACCEPTED or REJECTED' });
      return;
    }

    const result = await updateRideRequestStatus({ driverId, requestId, status });
    res.status(200).json({ message: `Ride request ${status.toLowerCase()}`, result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update request status' });
  }
}
