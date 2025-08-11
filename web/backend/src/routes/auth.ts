import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

export default router;
