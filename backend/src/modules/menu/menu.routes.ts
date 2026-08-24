import { Router } from 'express';
import { getMenuItems, getMenuItem, postMenuItem, patchMenuItem, removeMenuItem } from './menu.controller';
import { authenticate, authorize } from '../auth/auth.middleware';
import { uploadMenuImage } from '../../middlewares/uploadHandler';

const router = Router();

router.get('/', authenticate, getMenuItems);
router.get('/:id', authenticate, getMenuItem);

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  uploadMenuImage.single('image'),
  postMenuItem
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  uploadMenuImage.single('image'),
  patchMenuItem
);

router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), removeMenuItem);

export default router;