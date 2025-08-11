import express from 'express';
import {
  getSports,
  getSport,
  createSport,
  updateSport,
  deleteSport,
  getPopularSports,
  updateSportPopularity
} from '../controllers/sports';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getSports);
router.get('/popular', getPopularSports);
router.get('/:id', getSport);
router.patch('/:id/popularity', updateSportPopularity);

// Protected routes (Admin/Owner only)
router.post('/', protect, authorize('Owner'), createSport);
router.put('/:id', protect, authorize('Owner'), updateSport);
router.delete('/:id', protect, authorize('Owner'), deleteSport);

export default router;
