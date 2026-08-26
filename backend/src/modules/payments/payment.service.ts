import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { CreatePaymentInput, RefundPaymentInput } from './payment.validation';

export async function createPayment(input: CreatePaymentInput, processedById: string) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { payment: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.payment) {
    throw new AppError('This order already has a payment recorded', 409);
  }

  if (order.status === 'CANCELLED') {
    throw new AppError('Cannot record payment for a cancelled order', 400);
  }

  const orderTotal = order.total.toNumber();
  if (Math.abs(input.amount - orderTotal) > 0.01) {
    throw new AppError(
      `Payment amount (${input.amount}) does not match order total (${orderTotal})`,
      400
    );
  }

  const payment = await prisma.payment.create({
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

export async function getPaymentByOrderId(orderId: string) {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: {
        include: { items: { include: { menuItem: { select: { name: true } } } } },
      },
      processedBy: { select: { id: true, fullName: true } },
    },
  });

  if (!payment) {
    throw new AppError('No payment found for this order', 404);
  }

  return payment;
}

export async function refundPayment(orderId: string, input: RefundPaymentInput, userId: string) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });

  if (!payment) {
    throw new AppError('No payment found for this order', 404);
  }

  if (payment.status === 'REFUNDED') {
    throw new AppError('This payment has already been refunded', 409);
  }

  const updated = await prisma.payment.update({
    where: { orderId },
    data: { status: 'REFUNDED' },
  });

  await prisma.auditLog.create({
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

export async function getDailyPaymentSummary(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const payments = await prisma.payment.findMany({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay },
      status: 'PAID',
    },
  });

  const byMethod = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + p.amount.toNumber();
    return acc;
  }, {});

  const total = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);

  return { date: startOfDay.toISOString().slice(0, 10), total, byMethod, transactionCount: payments.length };
}