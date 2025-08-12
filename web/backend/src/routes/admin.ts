import express from 'express';
import {
  getGlobalStats,
  getPendingFacilities,
  updateFacilityApproval,
  getAllUsers,
  updateUserStatus,
  verifyUser,
  updateUser,
  deleteUser,
  getUserDetails,
  getBookingAnalytics
} from '../controllers/admin';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('Admin'));

// Global statistics
router.get('/stats', getGlobalStats);

// Facility approval routes
router.get('/facilities/pending', getPendingFacilities);
router.put('/facilities/:id/approval', updateFacilityApproval);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Analytics routes
router.get('/analytics/bookings', getBookingAnalytics);

export default router;
