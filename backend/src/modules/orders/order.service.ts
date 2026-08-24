import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { CreateOrderInput, UpdateOrderStatusInput, ListOrdersQuery } from './order.validation';
import { deductInventoryForOrder } from '../inventory/inventory.service';
import { createNotification } from '../notifications/notification.service';
import { getIO } from '../../config/socket';
import { Prisma, OrderStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const countToday = await tx.order.count({
    where: { createdAt: { gte: todayStart } },
  });

  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const sequence = String(countToday + 1).padStart(4, '0');
  return `ORD-${datePart}-${sequence}`;
}

function emitOrderEvent(event: string, payload: unknown) {
  try {
    const io = getIO();
    io.to('role:KITCHEN').to('role:MANAGER').to('role:ADMIN').emit(event, payload);
  } catch {
    // Socket server not initialized (e.g., tests) — order is still persisted.
  }
}

export async function createOrder(input: CreateOrderInput, userId: string) {
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: input.items.map((i) => i.menuItemId) } },
  });

  if (menuItems.length !== input.items.length) {
    throw new AppError('One or more menu items do not exist', 404);
  }

  const unavailable = menuItems.filter((m) => !m.isAvailable);
  if (unavailable.length > 0) {
    throw new AppError(
      `The following items are currently unavailable: ${unavailable.map((m) => m.name).join(', ')}`,
      409
    );
  }

  const itemsWithPrices = input.items.map((orderItem) => {
    const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId)!;
    return {
      menuItemId: orderItem.menuItemId,
      quantity: orderItem.quantity,
      unitPrice: menuItem.price,
    };
  });

  const subtotal = itemsWithPrices.reduce(
    (sum, item) => sum + item.unitPrice.toNumber() * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
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

  await createNotification({
    type: 'NEW_ORDER',
    message: `New order ${order.orderNumber} received`,
    targetRole: 'KITCHEN',
  });

  emitOrderEvent('order:created', order);

  return order;
}

export async function listOrders(query: ListOrdersQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
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
    prisma.order.findMany({
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
    prisma.order.count({ where }),
  ]);

  return { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: { select: { id: true, name: true, imageUrl: true } } } },
      createdBy: { select: { id: true, fullName: true } },
      payment: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return order;
}

export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const allowedNextStatuses = VALID_TRANSITIONS[order.status];
  if (!allowedNextStatuses.includes(input.status)) {
    throw new AppError(
      `Cannot transition order from ${order.status} to ${input.status}`,
      400
    );
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
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
      await deductInventoryForOrder(
        tx,
        order.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity }))
      );
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

export async function getOrderHistory(query: ListOrdersQuery) {
  return listOrders({ ...query, status: query.status ?? 'COMPLETED' });
}