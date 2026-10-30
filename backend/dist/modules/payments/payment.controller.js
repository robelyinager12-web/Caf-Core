"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postPayment = postPayment;
exports.getPayment = getPayment;
exports.postRefund = postRefund;
exports.getReceipt = getReceipt;
exports.getDailySummary = getDailySummary;
const payment_validation_1 = require("./payment.validation");
const payment_service_1 = require("./payment.service");
const apiResponse_1 = require("../../utils/apiResponse");
const errorHandler_1 = require("../../middlewares/errorHandler");
const pdfGenerator_1 = require("../../utils/pdfGenerator");
async function postPayment(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const input = payment_validation_1.createPaymentSchema.parse(req.body);
        const payment = await (0, payment_service_1.createPayment)(input, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 201, { message: 'Payment recorded successfully', data: payment });
    }
    catch (error) {
        next(error);
    }
}
async function getPayment(req, res, next) {
    try {
        const payment = await (0, payment_service_1.getPaymentByOrderId)(req.params.orderId);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Payment retrieved successfully', data: payment });
    }
    catch (error) {
        next(error);
    }
}
async function postRefund(req, res, next) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError('Authentication required', 401);
        const input = payment_validation_1.refundPaymentSchema.parse(req.body);
        const payment = await (0, payment_service_1.refundPayment)(req.params.orderId, input, req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Payment refunded successfully', data: payment });
    }
    catch (error) {
        next(error);
    }
}
async function getReceipt(req, res, next) {
    try {
        const payment = await (0, payment_service_1.getPaymentByOrderId)(req.params.orderId);
        (0, pdfGenerator_1.streamReceiptPdf)(res, {
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
    }
    catch (error) {
        next(error);
    }
}
async function getDailySummary(req, res, next) {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const summary = await (0, payment_service_1.getDailyPaymentSummary)(date);
        (0, apiResponse_1.sendSuccess)(res, 200, { message: 'Daily payment summary retrieved successfully', data: summary });
    }
    catch (error) {
        next(error);
    }
}
