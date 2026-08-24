import { Router } from 'express';
import { register, login, refresh } from './auth.controller';
import { authenticate, authorize } from './auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();

// Only an already-authenticated Admin/Manager can create new staff accounts —
// there is no public self-signup in a staff-only cafeteria system.
router.post('/register', authenticate, authorize('ADMIN', 'MANAGER'), register);

router.post('/login', authRateLimiter, login);
router.post('/refresh', refresh);

export default router;