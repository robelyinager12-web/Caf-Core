import { Response, NextFunction } from 'express';
import { clockInSchema, listShiftsQuerySchema } from './staff.validation';
import { clockIn, clockOut, listShifts, getCurrentlyActiveStaff } from './staff.service';
import { sendSuccess } from '../../utils/apiResponse';
import { logAudit } from '../audit/audit.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AppError } from '../../middlewares/errorHandler';

export async function postClockIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const input = clockInSchema.parse(req.body);
    const targetUserId = input.userId ?? req.user.userId;

    if (input.userId && input.userId !== req.user.userId) {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
        throw new AppError('You do not have permission to clock in another user', 403);
      }
    }

    const shift = await clockIn(targetUserId);

    await logAudit({
      userId: req.user.userId,
      action: 'STAFF_CLOCKED_IN',
      entityType: 'StaffShift',
      entityId: shift.id,
      metadata: { targetUserId },
    });

    sendSuccess(res, 201, { message: 'Clocked in successfully', data: shift });
  } catch (error) {
    next(error);
  }
}

export async function postClockOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const targetUserId = (req.body.userId as string | undefined) ?? req.user.userId;

    if (req.body.userId && req.body.userId !== req.user.userId) {
      if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
        throw new AppError('You do not have permission to clock out another user', 403);
      }
    }

    const shift = await clockOut(targetUserId);

    await logAudit({
      userId: req.user.userId,
      action: 'STAFF_CLOCKED_OUT',
      entityType: 'StaffShift',
      entityId: shift.id,
      metadata: { targetUserId },
    });

    sendSuccess(res, 200, { message: 'Clocked out successfully', data: shift });
  } catch (error) {
    next(error);
  }
}

export async function getShifts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const query = listShiftsQuerySchema.parse(req.query);
    const result = await listShifts(query, req.user.userId, req.user.role);

    sendSuccess(res, 200, {
      message: 'Shifts retrieved successfully',
      data: result.shifts,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getActiveStaff(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const active = await getCurrentlyActiveStaff();
    sendSuccess(res, 200, { message: 'Active staff retrieved successfully', data: active });
  } catch (error) {
    next(error);
  }
}