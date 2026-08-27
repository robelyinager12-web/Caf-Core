import { Router } from 'express';
import { register, login, refresh, postChangePassword } from './auth.controller';
import { authenticate, authorize } from './auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.post('/register', authenticate, authorize('ADMIN', 'MANAGER'), register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', refresh);
router.post('/change-password', authenticate, postChangePassword);

export default router;