import { Router } from 'express';
import {
  handleGetTrip,
  handleGenerateStartOtp,
  handleVerifyStartOtp,
  handleGenerateCompletionOtp,
  handleVerifyCompletionOtp,
  handleGetTripHistory,
} from '../modules/trips/trips.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/history/my-history', authenticate, handleGetTripHistory);
router.get('/:id', authenticate, handleGetTrip);

// Driver Dual OTP Endpoints
router.post('/:id/start-otp', authenticate, requireRole('DRIVER'), handleGenerateStartOtp);
router.post('/:id/verify-start-otp', authenticate, requireRole('DRIVER'), handleVerifyStartOtp);
router.post('/:id/completion-otp', authenticate, requireRole('DRIVER'), handleGenerateCompletionOtp);
router.post('/:id/verify-completion-otp', authenticate, requireRole('DRIVER'), handleVerifyCompletionOtp);

export default router;
