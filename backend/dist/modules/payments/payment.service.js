"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = createPayment;
exports.getPaymentByOrderId = getPaymentByOrderId;
exports.refundPayment = refundPayment;
exports.getDailyPaymentSummary = getDailyPaymentSummary;
const db_1 = require("../../config/db");
const errorHandler_1 = require("../../middlewares/errorHandler");
async function createPayment(input, processedById) {
    const order = await db_1.prisma.order.findUnique({
        where: { id: input.orderId },
        include: { payment: true },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    if (order.payment) {
        throw new errorHandler_1.AppError('This order already has a payment recorded', 409);
    }
    if (order.status === 'CANCELLED') {
        throw new errorHandler_1.AppError('Cannot record payment for a cancelled order', 400);
    }
    const orderTotal = order.total.toNumber();
    if (Math.abs(input.amount - orderTotal) > 0.01) {
        throw new errorHandler_1.AppError(`Payment amount (${input.amount}) does not match order total (${orderTotal})`, 400);
    }
    const payment = await db_1.prisma.payment.create({
        data: {
            orderId: input.orderId,
            method: input.method,
            amount: input.amount,
            status: 'PAID',
            processedById,
        },
        include: {
            order: {
                include: { items: { include: { menuItem: { select: { name: true } } } } },
            },
            processedBy: { select: { id: true, fullName: true } },
        },
    });
    return payment;
}
async function getPaymentByOrderId(orderId) {
    const payment = await db_1.prisma.payment.findUnique({
        where: { orderId },
        include: {
            order: {
                include: { items: { include: { menuItem: { select: { name: true } } } } },
            },
            processedBy: { select: { id: true, fullName: true } },
        },
    });
    if (!payment) {
        throw new errorHandler_1.AppError('No payment found for this order', 404);
    }
    return payment;
}
async function refundPayment(orderId, input, userId) {
    const payment = await db_1.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) {
        throw new errorHandler_1.AppError('No payment found for this order', 404);
    }
    if (payment.status === 'REFUNDED') {
        throw new errorHandler_1.AppError('This payment has already been refunded', 409);
    }
    const updated = await db_1.prisma.payment.update({
        where: { orderId },
        data: { status: 'REFUNDED' },
    });
    await db_1.prisma.auditLog.create({
        data: {
            userId,
            action: 'PAYMENT_REFUNDED',
            entityType: 'Payment',
            entityId: updated.id,
            metadata: { orderId, reason: input.reason, amount: payment.amount },
        },
    });
    return updated;
}
async function getDailyPaymentSummary(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const payments = await db_1.prisma.payment.findMany({
        where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
            status: 'PAID',
        },
    });
    const byMethod = payments.reduce((acc, p) => {
        acc[p.method] = (acc[p.method] ?? 0) + p.amount.toNumber();
        return acc;
    }, {});
    const total = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
    return { date: startOfDay.toISOString().slice(0, 10), total, byMethod, transactionCount: payments.length };
}
