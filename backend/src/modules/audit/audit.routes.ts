import { Router } from 'express';
import { getAuditLogs, getAuditActions } from './audit.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', getAuditLogs);
router.get('/actions', getAuditActions);

export default router;