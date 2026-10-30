"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postOrder = postOrder;
exports.getOrders = getOrders;
exports.getOrder = getOrder;
exports.patchOrderStatus = patchOrderStatus;
exports.getOrdersHistory = getOrdersHistory;
const order_validation_1 = require("./order.validation");
const order_service_1 = require("./order.service");
const apiResponse_1 = require("../../utils/apiResponse");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function postOrder(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const input = order_validation_1.createOrderSchema.parse(req.body);
        const order = await (0, order_service_1.createOrder)(input, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 201, { message: 'Order created successfully', data: order });
    }
    catch (error) {
        next(error);
    }
}
async function getOrders(req, res, next) {
    try {
        const query = order_validation_1.listOrdersQuerySchema.parse(req.query);
        const result = await (0, order_service_1.listOrders)(query);
        (0, apiResponse_1.sendSuccess)(res, 200, {
            message: 'Orders retrieved successfully',
            data: result.orders,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getOrder(req, res, next) {
    try {
        const order = await (0, order_service_1.getOrderById)(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Order retrieved successfully', data: order });
    }
    catch (error) {
        next(error);
    }
}
async function patchOrderStatus(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const input = order_validation_1.updateOrderStatusSchema.parse(req.body);
        const order = await (0, order_service_1.updateOrderStatus)(req.params.id, input, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Order status updated successfully', data: order });
    }
    catch (error) {
        next(error);
    }
}
async function getOrdersHistory(req, res, next) {
    try {
        const query = order_validation_1.listOrdersQuerySchema.parse(req.query);
        const result = await (0, order_service_1.getOrderHistory)(query);
        (0, apiResponse_1.sendSuccess)(res, 200, {
            message: 'Order history retrieved successfully',
            data: result.orders,
            meta: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
}
