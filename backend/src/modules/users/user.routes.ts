import { Router } from 'express';
import { getUsers, getUser, patchUser, removeUser } from './user.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', authorize('ADMIN'), getUser);
router.patch('/:id', authorize('ADMIN'), patchUser);
router.delete('/:id', authorize('ADMIN'), removeUser);

export default router;