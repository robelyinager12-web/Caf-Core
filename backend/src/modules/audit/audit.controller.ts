import { Response, NextFunction } from 'express';
import { listAuditLogsQuerySchema } from './audit.validation';
import { listAuditLogs, getDistinctActions } from './audit.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = listAuditLogsQuerySchema.parse(req.query);
    const result = await listAuditLogs(query);
    sendSuccess(res, 200, {
      message: 'Audit logs retrieved successfully',
      data: result.logs,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditActions(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const actions = await getDistinctActions();
    sendSuccess(res, 200, { message: 'Audit action types retrieved successfully', data: actions });
  } catch (error) {
    next(error);
  }
}