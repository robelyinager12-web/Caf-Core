import { Router } from 'express';
import { register, signup, login, refresh, postChangePassword } from './auth.controller';
import { authenticate, authorize } from './auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.post('/register', authenticate, authorize('ADMIN', 'MANAGER'), register);

// Public self-signup — no auth required. Shares the same strict rate
// limiter as /login to blunt automated mass-account-creation abuse, since
// this endpoint has no invitation gate at all.
router.post('/signup', authRateLimiter, signup);

router.post('/login', authRateLimiter, login);
router.post('/refresh', refresh);
router.post('/change-password', authenticate, postChangePassword);

export default router;