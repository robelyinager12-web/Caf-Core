import { Router } from 'express';
import { getRecipesForMenuItem, upsertRecipeLine, removeRecipeLine } from './recipe.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/menu-item/:menuItemId', getRecipesForMenuItem);
router.post('/', authorize('ADMIN', 'MANAGER'), upsertRecipeLine);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), removeRecipeLine);

export default router;