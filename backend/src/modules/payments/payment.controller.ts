import { Response, NextFunction } from 'express';
import { createPaymentSchema, refundPaymentSchema } from './payment.validation';
import { createPayment, getPaymentByOrderId, refundPayment, getDailyPaymentSummary } from './payment.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AppError } from '../../middlewares/errorHandler';
import { streamReceiptPdf } from '../../utils/pdfGenerator';

export async function postPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const input = createPaymentSchema.parse(req.body);
    const payment = await createPayment(input, req.user.userId);

    sendSuccess(res, 201, { message: 'Payment recorded successfully', data: payment });
  } catch (error) {
    next(error);
  }
}

export async function getPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const payment = await getPaymentByOrderId(req.params.orderId);
    sendSuccess(res, 200, { message: 'Payment retrieved successfully', data: payment });
  } catch (error) {
    next(error);
  }
}

export async function postRefund(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const input = refundPaymentSchema.parse(req.body);
    const payment = await refundPayment(req.params.orderId, input, req.user.userId);

    sendSuccess(res, 200, { message: 'Payment refunded successfully', data: payment });
  } catch (error) {
    next(error);
  }
}

export async function getReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const payment = await getPaymentByOrderId(req.params.orderId);

    streamReceiptPdf(res, {
      orderNumber: payment.order.orderNumber,
      createdAt: payment.createdAt,
      orderType: payment.order.orderType,
      tableOrToken: payment.order.tableOrToken,
      items: payment.order.items.map((i) => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice.toNumber(),
      })),
      subtotal: payment.order.subtotal.toNumber(),
      total: payment.order.total.toNumber(),
      paymentMethod: payment.method,
      processedByName: payment.processedBy.fullName,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDailySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const summary = await getDailyPaymentSummary(date);
    sendSuccess(res, 200, { message: 'Daily payment summary retrieved successfully', data: summary });
  } catch (error) {
    next(error);
  }
}