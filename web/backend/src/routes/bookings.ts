import express from 'express';
import {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  cancelBooking
} from '../controllers/bookings';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All booking routes require authentication

router.route('/')
  .get(getBookings)
  .post(authorize('User'), createBooking);

router.route('/:id')
  .get(getBooking);

router.route('/:id/status')
  .put(authorize('Owner'), updateBookingStatus);

router.route('/:id/cancel')
  .put(cancelBooking);

export default router;
