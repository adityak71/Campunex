import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGetMe,
  handleVerifyInstitution,
} from '../modules/auth/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

const router = Router();

router.post('/register', authLimiter, handleRegister);
router.post('/login', authLimiter, handleLogin);
router.post('/logout', handleLogout);
router.get('/me', authenticate, handleGetMe);
router.post('/verify-institution', authenticate, handleVerifyInstitution);

export default router;
