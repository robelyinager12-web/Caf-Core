import { Router, Response, NextFunction } from 'express';
import { listNotifications, markNotificationRead } from './notification.service';
import { sendSuccess } from '../../utils/apiResponse';
import { authenticate, AuthenticatedRequest } from '../auth/auth.middleware';
import { AppError } from '../../middlewares/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await listNotifications(req.user.role, unreadOnly);
    sendSuccess(res, 200, { message: 'Notifications retrieved successfully', data: notifications });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await markNotificationRead(req.params.id);
    sendSuccess(res, 200, { message: 'Notification marked as read', data: notification });
  } catch (error) {
    next(error);
  }
});

export default router;