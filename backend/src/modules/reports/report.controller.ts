import { Response, NextFunction } from 'express';
import { dateRangeSchema, topItemsQuerySchema } from './report.validation';
import {
  getSalesSummary,
  getTopSellingItems,
  getInventoryUsageReport,
  getStockAdjustmentAuditReport,
} from './report.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export async function getSalesSummaryReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = dateRangeSchema.parse(req.query);
    const report = await getSalesSummary(input);
    sendSuccess(res, 200, { message: 'Sales summary retrieved successfully', data: report });
  } catch (error) {
    next(error);
  }
}

export async function getTopItemsReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = topItemsQuerySchema.parse(req.query);
    const report = await getTopSellingItems(query);
    sendSuccess(res, 200, { message: 'Top selling items retrieved successfully', data: report });
  } catch (error) {
    next(error);
  }
}

export async function getInventoryUsage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = dateRangeSchema.parse(req.query);
    const report = await getInventoryUsageReport(input);
    sendSuccess(res, 200, { message: 'Inventory usage report retrieved successfully', data: report });
  } catch (error) {
    next(error);
  }
}

export async function getStockAdjustmentAudit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const input = dateRangeSchema.parse(req.query);
    const report = await getStockAdjustmentAuditReport(input);
    sendSuccess(res, 200, { message: 'Stock adjustment report retrieved successfully', data: report });
  } catch (error) {
    next(error);
  }
}