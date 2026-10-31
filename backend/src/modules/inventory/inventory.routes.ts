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
router.post('/', authorize('ADMIN'), postIngredient);
router.post('/:ingredientId/adjust', authorize('ADMIN'), postStockAdjustment);
router.patch('/:ingredientId/threshold', authorize('ADMIN'), patchThreshold);

export default router;