import { Router } from 'express';
import { postPayment, getPayment, postRefund, getReceipt, getDailySummary } from './payment.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MANAGER', 'CASHIER'), postPayment);
router.get('/summary/daily', authorize('ADMIN', 'MANAGER'), getDailySummary);
router.get('/:orderId', authorize('ADMIN', 'MANAGER', 'CASHIER'), getPayment);
router.get('/:orderId/receipt', authorize('ADMIN', 'MANAGER', 'CASHIER'), getReceipt);
router.post('/:orderId/refund', authorize('ADMIN', 'MANAGER'), postRefund);

export default router;