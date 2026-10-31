import { Router } from 'express';
import { getRecipesForMenuItem, upsertRecipeLine, removeRecipeLine } from './recipe.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/menu-item/:menuItemId', getRecipesForMenuItem);
router.post('/', authorize('ADMIN'), upsertRecipeLine);
router.delete('/:id', authorize('ADMIN'), removeRecipeLine);

export default router;