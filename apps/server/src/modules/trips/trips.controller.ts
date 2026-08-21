import { Request, Response } from 'express';
import {
  getTripById,
  initiateStartOtp,
  processStartOtpVerification,
  initiateCompletionOtp,
  processCompletionOtpVerification,
} from './trips.service.js';
import { verifyOtpSchema } from '@campunex/shared';

export async function handleGetTrip(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const tripId = req.params.id;
    const trip = await getTripById(tripId, userId);
    res.status(200).json({ trip });
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Trip not found' });
  }
}

export async function handleGenerateStartOtp(req: Request, res: Response): Promise<void> {
  try {
    const driverId = req.user!.userId;
    const tripId = req.params.id;
    const { otp } = await initiateStartOtp(driverId, tripId);
    res.status(200).json({ message: 'Start OTP generated and sent to rider', devOtp: otp });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to generate start OTP' });
  }
}

export async function handleVerifyStartOtp(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = verifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const driverId = req.user!.userId;
    const tripId = req.params.id;
    const result = await processStartOtpVerification(driverId, tripId, parseResult.data.otp);

    res.status(200).json({ message: 'Ride initiated successfully! Trip is now IN_PROGRESS.', result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Start OTP verification failed' });
  }
}

export async function handleGenerateCompletionOtp(req: Request, res: Response): Promise<void> {
  try {
    const driverId = req.user!.userId;
    const tripId = req.params.id;
    const { otp } = await initiateCompletionOtp(driverId, tripId);
    res.status(200).json({ message: 'Completion OTP generated and sent to rider', devOtp: otp });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to generate completion OTP' });
  }
}

export async function handleVerifyCompletionOtp(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = verifyOtpSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const driverId = req.user!.userId;
    const tripId = req.params.id;
    const result = await processCompletionOtpVerification(driverId, tripId, parseResult.data.otp);

    res.status(200).json({ message: 'Trip COMPLETED successfully!', result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Completion OTP verification failed' });
  }
}

export async function handleGetTripHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { getUserTripHistory } = await import('./trips.service.js');
    const history = await getUserTripHistory(userId);
    res.status(200).json({ history });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch trip history' });
  }
}
