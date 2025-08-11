import express from 'express';
import {
  getAdminStats,
  getUserTrends,
  getBookingTrends,
  getActiveSports,
  getRecentUsers,
  getPendingFacilities,
  banUser,
  deleteUser,
  approveFacility
} from '../controllers/admin';
import { protect } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// Admin dashboard stats
router.get('/stats', getAdminStats);

// Trends and analytics
router.get('/trends/users', getUserTrends);
router.get('/trends/bookings', getBookingTrends);
router.get('/sports/active', getActiveSports);

// User management
router.get('/users/recent', getRecentUsers);
router.patch('/users/:id/ban', banUser);
router.delete('/users/:id', deleteUser);

// Facility management
router.get('/facilities/pending', getPendingFacilities);
router.patch('/facilities/:id/approve', approveFacility);

export default router;
