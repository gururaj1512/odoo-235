import express from 'express';
import {
  getCourts,
  getCourt,
  createCourt,
  updateCourt,
  deleteCourt
} from '../controllers/courts';
import { protect, authorize } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';

const router = express.Router();

// Routes for individual courts
router.route('/:id')
  .get(getCourt)
  .put(protect, authorize('Owner'), uploadMultiple, updateCourt)
  .delete(protect, authorize('Owner'), deleteCourt);

export default router;
