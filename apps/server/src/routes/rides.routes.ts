import { Router } from 'express';
import {
  handleCreateRide,
  handleGetMyRides,
  handleSearchMatches,
  handleRequestRide,
  handleGetMyRequests,
  handleGetDriverRideRequests,
  handleUpdateRequestStatus,
  handleGetRideById,
  handleCancelRideRequest,
  handleCancelRide,
  handleUpdateRideSeats,
  handleRequestCancelRideRequestOtp,
  handleRequestCancelRideOtp,
} from '../modules/rides/rides.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// PostGIS spatial ride matching endpoint (Public/Authenticated)
router.get('/matches', handleSearchMatches);

// Driver endpoints
router.post('/', authenticate, requireRole('DRIVER'), handleCreateRide);
router.get('/my-rides', authenticate, requireRole('DRIVER'), handleGetMyRides);
router.get('/driver-requests', authenticate, requireRole('DRIVER'), handleGetDriverRideRequests);
router.get('/:id/requests', authenticate, requireRole('DRIVER'), handleGetDriverRideRequests);
router.post('/:id/cancel-otp', authenticate, requireRole('DRIVER'), handleRequestCancelRideOtp);
router.patch('/:id/cancel', authenticate, requireRole('DRIVER'), handleCancelRide);
router.patch('/:id/seats', authenticate, requireRole('DRIVER'), handleUpdateRideSeats);

// Rider endpoints
router.post('/:id/requests', authenticate, requireRole('RIDER'), handleRequestRide);
router.get('/requests/my-requests', authenticate, requireRole('RIDER'), handleGetMyRequests);
router.post('/requests/:requestId/cancel-otp', authenticate, requireRole('RIDER'), handleRequestCancelRideRequestOtp);
router.patch('/requests/:requestId/cancel', authenticate, requireRole('RIDER'), handleCancelRideRequest);

// Request approval/rejection endpoint
router.patch('/requests/:requestId/status', authenticate, requireRole('DRIVER'), handleUpdateRequestStatus);

// Get single ride details (for Rider to view/book or Driver to inspect)
router.get('/:id', authenticate, handleGetRideById);

export default router;
