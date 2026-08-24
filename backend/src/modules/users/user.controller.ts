import { Response, NextFunction } from 'express';
import { updateUserSchema, listUsersQuerySchema } from './user.validation';
import { listUsers, getUserById, updateUser, deactivateUser } from './user.service';
import { sendSuccess } from '../../utils/apiResponse';
import { logAudit } from '../audit/audit.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AppError } from '../../middlewares/errorHandler';

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    const result = await listUsers(query);
    sendSuccess(res, 200, {
      message: 'Users retrieved successfully',
      data: result.users,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await getUserById(req.params.id);
    sendSuccess(res, 200, { message: 'User retrieved successfully', data: user });
  } catch (error) {
    next(error);
  }
}

export async function patchUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const input = updateUserSchema.parse(req.body);
    const updated = await updateUser(req.params.id, input, req.user.userId);

    await logAudit({
      userId: req.user.userId,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: updated.id,
      metadata: { changes: input },
    });

    sendSuccess(res, 200, { message: 'User updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
}

export async function removeUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const deactivated = await deactivateUser(req.params.id, req.user.userId);

    await logAudit({
      userId: req.user.userId,
      action: 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: deactivated.id,
    });

    sendSuccess(res, 200, { message: 'User deactivated successfully', data: deactivated });
  } catch (error) {
    next(error);
  }
}