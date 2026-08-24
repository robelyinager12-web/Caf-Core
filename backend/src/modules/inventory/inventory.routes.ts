import { Router } from 'express';
import {
  getIngredients,
  postIngredient,
  postStockAdjustment,
  patchThreshold,
} from './inventory.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER', 'KITCHEN'), getIngredients);
router.post('/', authorize('ADMIN', 'MANAGER'), postIngredient);
router.post('/:ingredientId/adjust', authorize('ADMIN', 'MANAGER'), postStockAdjustment);
router.patch('/:ingredientId/threshold', authorize('ADMIN', 'MANAGER'), patchThreshold);

export default router;