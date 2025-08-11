import express from 'express';
import {
  getFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility
} from '../controllers/facilities';
import { protect, authorize } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';

const router = express.Router();

router.route('/')
  .get(getFacilities)
  .post(protect, authorize('Owner'), uploadMultiple, createFacility);

router.route('/:id')
  .get(getFacility)
  .put(protect, authorize('Owner'), uploadMultiple, updateFacility)
  .delete(protect, authorize('Owner'), deleteFacility);

export default router;
