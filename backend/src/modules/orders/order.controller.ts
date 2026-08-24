import { Response, NextFunction } from 'express';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
} from './order.validation';
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  getOrderHistory,
} from './order.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AppError } from '../../middlewares/errorHandler';

export async function postOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const input = createOrderSchema.parse(req.body);
    const order = await createOrder(input, req.user.userId);

    sendSuccess(res, 201, { message: 'Order created successfully', data: order });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = listOrdersQuerySchema.parse(req.query);
    const result = await listOrders(query);
    sendSuccess(res, 200, {
      message: 'Orders retrieved successfully',
      data: result.orders,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const order = await getOrderById(req.params.id);
    sendSuccess(res, 200, { message: 'Order retrieved successfully', data: order });
  } catch (error) {
    next(error);
  }
}

export async function patchOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Authentication required', 401);

    const input = updateOrderStatusSchema.parse(req.body);
    const order = await updateOrderStatus(req.params.id, input, req.user.userId);

    sendSuccess(res, 200, { message: 'Order status updated successfully', data: order });
  } catch (error) {
    next(error);
  }
}

export async function getOrdersHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const query = listOrdersQuerySchema.parse(req.query);
    const result = await getOrderHistory(query);
    sendSuccess(res, 200, {
      message: 'Order history retrieved successfully',
      data: result.orders,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}