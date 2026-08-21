import { Router } from 'express';
import {
  handleCreateRide,
  handleGetMyRides,
  handleSearchMatches,
  handleRequestRide,
  handleGetMyRequests,
  handleGetDriverRideRequests,
  handleUpdateRequestStatus,
} from '../modules/rides/rides.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// PostGIS spatial ride matching endpoint (Public/Authenticated)
router.get('/matches', handleSearchMatches);

// Driver endpoints
router.post('/', authenticate, requireRole('DRIVER'), handleCreateRide);
router.get('/my-rides', authenticate, requireRole('DRIVER'), handleGetMyRides);
router.get('/:id/requests', authenticate, requireRole('DRIVER'), handleGetDriverRideRequests);

// Rider endpoints
router.post('/:id/requests', authenticate, requireRole('RIDER'), handleRequestRide);
router.get('/requests/my-requests', authenticate, requireRole('RIDER'), handleGetMyRequests);

// Request approval/rejection endpoint
router.patch('/requests/:requestId/status', authenticate, requireRole('DRIVER'), handleUpdateRequestStatus);

export default router;
