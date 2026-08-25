import { Router } from 'express';
import { postClockIn, postClockOut, getShifts, getActiveStaff } from './staff.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/clock-in', postClockIn);
router.post('/clock-out', postClockOut);
router.get('/active', authorize('ADMIN', 'MANAGER'), getActiveStaff);

// Any authenticated user may view shifts — but only their own; Admin/Manager
// may additionally filter by any userId. The narrowing happens in the
// service layer below, not here, since it depends on comparing the query's
// userId against the caller's identity.
router.get('/shifts', getShifts);

export default router;