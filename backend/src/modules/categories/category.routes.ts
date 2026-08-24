import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory } from './category.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.get('/', authenticate, listCategories);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createCategory);
router.patch('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteCategory);

export default router;