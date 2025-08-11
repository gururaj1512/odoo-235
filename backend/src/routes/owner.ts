import express from 'express';
import {
  getOwnerStats,
  getOwnerBookingTrends,
  getOwnerPeakHours
} from '../controllers/owner';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All owner routes require authentication and owner role
router.use(protect);
router.use(authorize('Owner'));

// Owner dashboard stats
router.get('/stats', getOwnerStats);

// Owner trends and analytics
router.get('/trends/bookings', getOwnerBookingTrends);
router.get('/peak-hours', getOwnerPeakHours);

export default router;
