import { prisma } from '../../config/db';
import { AppError } from '../../middlewares/errorHandler';
import { DateRangeInput, TopItemsQuery } from './report.validation';

function parseAndValidateRange(dateFrom: string, dateTo: string) {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  if (from > to) {
    throw new AppError('dateFrom must be before dateTo', 400);
  }

  const maxRangeMs = 366 * 24 * 60 * 60 * 1000;
  if (to.getTime() - from.getTime() > maxRangeMs) {
    throw new AppError('Date range cannot exceed 366 days', 400);
  }

  return { from, to };
}

export async function getSalesSummary(input: DateRangeInput) {
  const { from, to } = parseAndValidateRange(input.dateFrom, input.dateTo);

  const orders = await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: { gte: from, lte: to },
    },
    include: { payment: true },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total.toNumber(), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const byDay = orders.reduce<Record<string, { revenue: number; orders: number }>>((acc, o) => {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (!acc[day]) acc[day] = { revenue: 0, orders: 0 };
    acc[day].revenue += o.total.toNumber();
    acc[day].orders += 1;
    return acc;
  }, {});

  const dailyBreakdown = Object.entries(byDay)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    dateFrom: from.toISOString(),
    dateTo: to.toISOString(),
    totalRevenue,
    totalOrders,
    averageOrderValue,
    dailyBreakdown,
  };
}

export async function getTopSellingItems(query: TopItemsQuery) {
  const { from, to } = parseAndValidateRange(query.dateFrom, query.dateTo);
  const limit = query.limit ?? 10;

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: 'COMPLETED',
        createdAt: { gte: from, lte: to },
      },
    },
    include: { menuItem: { select: { id: true, name: true, price: true } } },
  });

  const aggregated = orderItems.reduce
    Record<string, { menuItemId: string; name: string; quantitySold: number; revenue: number }>
  >((acc, item) => {
    const key = item.menuItemId;
    if (!acc[key]) {
      acc[key] = { menuItemId: key, name: item.menuItem.name, quantitySold: 0, revenue: 0 };
    }
    acc[key].quantitySold += item.quantity;
    acc[key].revenue += item.unitPrice.toNumber() * item.quantity;
    return acc;
  }, {});

  return Object.values(aggregated)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
}

export async function getInventoryUsageReport(input: DateRangeInput) {
  const { from, to } = parseAndValidateRange(input.dateFrom, input.dateTo);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: 'COMPLETED',
        createdAt: { gte: from, lte: to },
      },
    },
    include: {
      menuItem: {
        include: {
          recipes: { include: { ingredient: { select: { id: true, name: true, unit: true } } } },
        },
      },
    },
  });

  const usage = new Map<string, { ingredientId: string; name: string; unit: string; quantityUsed: number }>();

  for (const orderItem of orderItems) {
    for (const recipe of orderItem.menuItem.recipes) {
      const totalUsed = recipe.quantityRequired.toNumber() * orderItem.quantity;
      const existing = usage.get(recipe.ingredientId);

      if (existing) {
        existing.quantityUsed += totalUsed;
      } else {
        usage.set(recipe.ingredientId, {
          ingredientId: recipe.ingredientId,
          name: recipe.ingredient.name,
          unit: recipe.ingredient.unit,
          quantityUsed: totalUsed,
        });
      }
    }
  }

  return Array.from(usage.values()).sort((a, b) => b.quantityUsed - a.quantityUsed);
}

export async function getStockAdjustmentAuditReport(input: DateRangeInput) {
  const { from, to } = parseAndValidateRange(input.dateFrom, input.dateTo);

  const adjustments = await prisma.auditLog.findMany({
    where: {
      action: 'STOCK_ADJUSTED',
      createdAt: { gte: from, lte: to },
    },
    include: { user: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return adjustments.map((log) => ({
    id: log.id,
    performedBy: log.user?.fullName ?? 'Unknown',
    metadata: log.metadata,
    createdAt: log.createdAt,
  }));
}