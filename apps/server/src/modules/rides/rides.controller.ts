import { Request, Response } from 'express';
import {
  createRide,
  getDriverRides,
  getRideById,
  requestRide,
  getRiderRequests,
  getAllDriverRideRequests,
  updateRideRequestStatus,
  cancelRideRequest,
  cancelRide,
  updateRideSeats,
  initiateRideRequestCancelOtp,
  initiateRideCancelOtp,
} from './rides.service.js';
import { findMatchingRides } from '../matching/matching.service.js';
import { createRideSchema, searchRideSchema } from '@campunex/shared';
import { verifyToken } from '../../utils/jwt.js';

export async function handleGetRideById(req: Request, res: Response): Promise<void> {
  try {
    const rideId = req.params.id;
    const ride = await getRideById(rideId);
    res.status(200).json({ ride });
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Ride not found' });
  }
}

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
    // Strict RBAC: Deny drivers from searching/booking rides as passengers
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    let token = cookieToken;
    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.role === 'DRIVER') {
        res.status(403).json({ error: 'Forbidden: Drivers cannot search or book rides as passengers' });
        return;
      }
    }

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

export async function handleRequestCancelRideRequestOtp(req: Request, res: Response): Promise<void> {
  try {
    const riderId = req.user!.userId || (req.user as any)?.id;
    const requestId = req.params.requestId;

    const result = await initiateRideRequestCancelOtp({ riderId, requestId });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to request cancellation OTP' });
  }
}

export async function handleCancelRideRequest(req: Request, res: Response): Promise<void> {
  try {
    const riderId = req.user!.userId || (req.user as any)?.id;
    const requestId = req.params.requestId;
    const { otp } = req.body || {};

    const result = await cancelRideRequest({ riderId, requestId, otp });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to cancel ride request' });
  }
}

export async function handleRequestCancelRideOtp(req: Request, res: Response): Promise<void> {
  try {
    const driverId = req.user!.userId || (req.user as any)?.id;
    const rideId = req.params.id;

    const result = await initiateRideCancelOtp({ driverId, rideId });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to request cancellation OTP' });
  }
}

export async function handleCancelRide(req: Request, res: Response): Promise<void> {
  try {
    const driverId = req.user!.userId || (req.user as any)?.id;
    const rideId = req.params.id;
    const { otp } = req.body || {};

    const result = await cancelRide({ driverId, rideId, otp });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to cancel ride' });
  }
}

export async function handleUpdateRideSeats(req: Request, res: Response): Promise<void> {
  try {
    const driverId = req.user!.userId || (req.user as any)?.id;
    const rideId = req.params.id;
    const { totalSeats } = req.body;

    if (!totalSeats || typeof totalSeats !== 'number' || totalSeats < 1) {
      res.status(400).json({ error: 'Valid totalSeats count is required' });
      return;
    }

    const updated = await updateRideSeats({ driverId, rideId, totalSeats });
    res.status(200).json({ message: 'Seats updated successfully', ride: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update seats' });
  }
}

