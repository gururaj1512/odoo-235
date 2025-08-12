import express from 'express';
import { addRating, getFacilityRatings, deleteRating } from '../controllers/rating';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/facility/:facilityId', getFacilityRatings);

// Protected routes
router.use(protect);
router.post('/', addRating);
router.delete('/:id', deleteRating);

export default router;
