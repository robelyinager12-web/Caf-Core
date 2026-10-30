"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.listOrders = listOrders;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.getOrderHistory = getOrderHistory;
const db_1 = require("../../config/db");
const errorHandler_1 = require("../../middlewares/errorHandler");
const inventory_service_1 = require("../inventory/inventory.service");
const notification_service_1 = require("../notifications/notification.service");
const socket_1 = require("../../config/socket");
const VALID_TRANSITIONS = {
    PENDING: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
};
async function generateOrderNumber(tx) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const countToday = await tx.order.count({
        where: { createdAt: { gte: todayStart } },
    });
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = String(countToday + 1).padStart(4, '0');
    return `ORD-${datePart}-${sequence}`;
}
function emitOrderEvent(event, payload) {
    try {
        const io = (0, socket_1.getIO)();
        io.to('role:KITCHEN').to('role:MANAGER').to('role:ADMIN').emit(event, payload);
    }
    catch {
        // Socket server not initialized (e.g., tests) — order is still persisted.
    }
}
async function createOrder(input, userId) {
    const menuItems = await db_1.prisma.menuItem.findMany({
        where: { id: { in: input.items.map((i) => i.menuItemId) } },
    });
    if (menuItems.length !== input.items.length) {
        throw new errorHandler_1.AppError('One or more menu items do not exist', 404);
    }
    const unavailable = menuItems.filter((m) => !m.isAvailable);
    if (unavailable.length > 0) {
        throw new errorHandler_1.AppError(`The following items are currently unavailable: ${unavailable.map((m) => m.name).join(', ')}`, 409);
    }
    const itemsWithPrices = input.items.map((orderItem) => {
        const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId);
        return {
            menuItemId: orderItem.menuItemId,
            quantity: orderItem.quantity,
            unitPrice: menuItem.price,
        };
    });
    const subtotal = itemsWithPrices.reduce((sum, item) => sum + item.unitPrice.toNumber() * item.quantity, 0);
    const order = await db_1.prisma.$transaction(async (tx) => {
        const orderNumber = await generateOrderNumber(tx);
        return tx.order.create({
            data: {
                orderNumber,
                createdById: userId,
                orderType: input.orderType,
                tableOrToken: input.tableOrToken,
                subtotal,
                total: subtotal, // tax/discount logic can extend this later
                items: { create: itemsWithPrices },
            },
            include: {
                items: { include: { menuItem: { select: { id: true, name: true } } } },
                createdBy: { select: { id: true, fullName: true } },
            },
        });
    });
    // Broadcast to everyone (targetRole omitted = null = all roles) rather
    // than Kitchen only — Cashiers and Admins/Managers placing or nearby
    // also benefit from seeing order activity in their own notification
    // bell, not just kitchen staff preparing it.
    await (0, notification_service_1.createNotification)({
        type: 'NEW_ORDER',
        message: `New order ${order.orderNumber} received`,
    });
    emitOrderEvent('order:created', order);
    return order;
}
async function listOrders(query) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.orderType ? { orderType: query.orderType } : {}),
        ...(query.dateFrom || query.dateTo
            ? {
                createdAt: {
                    ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
                    ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
                },
            }
            : {}),
    };
    const [orders, total] = await Promise.all([
        db_1.prisma.order.findMany({
            where,
            include: {
                items: { include: { menuItem: { select: { id: true, name: true } } } },
                createdBy: { select: { id: true, fullName: true } },
                payment: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        db_1.prisma.order.count({ where }),
    ]);
    return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function getOrderById(id) {
    const order = await db_1.prisma.order.findUnique({
        where: { id },
        include: {
            items: { include: { menuItem: { select: { id: true, name: true, imageUrl: true } } } },
            createdBy: { select: { id: true, fullName: true } },
            payment: true,
        },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    return order;
}
async function updateOrderStatus(id, input, userId) {
    const order = await db_1.prisma.order.findUnique({
        where: { id },
        include: { items: true },
    });
    if (!order) {
        throw new errorHandler_1.AppError('Order not found', 404);
    }
    const allowedNextStatuses = VALID_TRANSITIONS[order.status];
    if (!allowedNextStatuses.includes(input.status)) {
        throw new errorHandler_1.AppError(`Cannot transition order from ${order.status} to ${input.status}`, 400);
    }
    const updatedOrder = await db_1.prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
            where: { id },
            data: { status: input.status },
            include: {
                items: { include: { menuItem: { select: { id: true, name: true } } } },
            },
        });
        // Inventory is only deducted at the moment an order is actually completed —
        // not at creation — so cancelled/in-progress orders never touch stock levels.
        if (input.status === 'COMPLETED') {
            await (0, inventory_service_1.deductInventoryForOrder)(tx, order.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })));
        }
        await tx.auditLog.create({
            data: {
                userId,
                action: 'ORDER_STATUS_CHANGED',
                entityType: 'Order',
                entityId: id,
                metadata: { from: order.status, to: input.status },
            },
        });
        return updated;
    });
    emitOrderEvent('order:statusChanged', updatedOrder);
    return updatedOrder;
}
async function getOrderHistory(query) {
    return listOrders({ ...query, status: query.status ?? 'COMPLETED' });
}
