import { Router } from 'express';
import { postClockIn, postClockOut, getShifts, getActiveStaff } from './staff.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/clock-in', postClockIn);
router.post('/clock-out', postClockOut);
router.get('/active', authorize('ADMIN', 'MANAGER'), getActiveStaff);
router.get('/shifts', authorize('ADMIN', 'MANAGER'), getShifts);

export default router;