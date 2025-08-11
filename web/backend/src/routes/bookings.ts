import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  getOwnerBookings,
  getOwnerBookingAnalytics
} from '../controllers/bookings';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public booking routes (for users)
router.route('/')
  .get(getBookings)
  .post(authorize('User'), createBooking);

router.route('/:id')
  .get(getBooking);

router.route('/:id/cancel')
  .patch(authorize('User'), cancelBooking);

// Owner-specific routes
router.get('/owner', authorize('Owner'), getOwnerBookings);
router.get('/owner/analytics', authorize('Owner'), getOwnerBookingAnalytics);
router.put('/:id/status', authorize('Owner'), updateBookingStatus);

// Facility-specific bookings
router.get('/facility/:facilityId', getBookings);

export default router;
