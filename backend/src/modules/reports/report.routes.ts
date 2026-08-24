import { Router } from 'express';
import {
  getSalesSummaryReport,
  getTopItemsReport,
  getInventoryUsage,
  getStockAdjustmentAudit,
} from './report.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'MANAGER'));

router.get('/sales-summary', getSalesSummaryReport);
router.get('/top-items', getTopItemsReport);
router.get('/inventory-usage', getInventoryUsage);
router.get('/stock-adjustments', getStockAdjustmentAudit);

export default router;