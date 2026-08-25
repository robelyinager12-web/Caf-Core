import { Router } from 'express';
import { getMenuItems, getMenuItem, postMenuItem, patchMenuItem, removeMenuItem } from './menu.controller';
import { authenticate, authorize } from '../auth/auth.middleware';
import { uploadMenuImage } from '../../middlewares/uploadHandler';
import { cacheFor } from '../../middlewares/cacheControl';

const router = Router();

router.get('/', authenticate, cacheFor(30), getMenuItems);
router.get('/:id', authenticate, cacheFor(30), getMenuItem);

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