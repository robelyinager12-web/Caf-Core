import { Router } from 'express';
import {
  postOrder,
  getOrders,
  getOrder,
  patchOrderStatus,
  getOrdersHistory,
} from './order.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MANAGER', 'CASHIER'), postOrder);
router.get('/', authorize('ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN'), getOrders);
router.get('/history', authorize('ADMIN', 'MANAGER'), getOrdersHistory);
router.get('/:id', authorize('ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN'), getOrder);
router.patch('/:id/status', authorize('ADMIN', 'MANAGER', 'CASHIER', 'KITCHEN'), patchOrderStatus);

export default router;