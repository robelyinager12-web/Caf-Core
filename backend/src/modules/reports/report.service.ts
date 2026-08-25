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

  // Moved from in-memory JS reduce (Phase 6 Step 10) to a database-level
  // GROUP BY — the previous version pulled every completed order row into
  // Node and aggregated in JS, which doesn't scale past a few thousand rows.
  const dailyBreakdown = await prisma.$queryRaw
    { date: string; revenue: number; orders: bigint }[]
  >`
    SELECT
      TO_CHAR("created_at", 'YYYY-MM-DD') AS date,
      SUM("total")::float AS revenue,
      COUNT(*) AS orders
    FROM "orders"
    WHERE "status" = 'COMPLETED'
      AND "created_at" BETWEEN ${from} AND ${to}
    GROUP BY date
    ORDER BY date ASC
  `;

  const totals = await prisma.order.aggregate({
    where: { status: 'COMPLETED', createdAt: { gte: from, lte: to } },
    _sum: { total: true },
    _count: { id: true },
  });

  const totalRevenue = totals._sum.total?.toNumber() ?? 0;
  const totalOrders = totals._count.id;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    dateFrom: from.toISOString(),
    dateTo: to.toISOString(),
    totalRevenue,
    totalOrders,
    averageOrderValue,
    dailyBreakdown: dailyBreakdown.map((d) => ({
      date: d.date,
      revenue: d.revenue,
      orders: Number(d.orders),
    })),
  };
}

export async function getTopSellingItems(query: TopItemsQuery) {
  const { from, to } = parseAndValidateRange(query.dateFrom, query.dateTo);
  const limit = query.limit ?? 10;

  // Grouped at the database level via Prisma's groupBy instead of fetching
  // every order_item row and reducing in memory.
  const grouped = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: { order: { status: 'COMPLETED', createdAt: { gte: from, lte: to } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: limit,
  });

  const menuItemIds = grouped.map((g) => g.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true, price: true },
  });
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  return grouped.map((g) => {
    const menuItem = menuItemMap.get(g.menuItemId)!;
    const quantitySold = g._sum.quantity ?? 0;
    return {
      menuItemId: g.menuItemId,
      name: menuItem.name,
      quantitySold,
      revenue: quantitySold * menuItem.price.toNumber(),
    };
  });
}

// getInventoryUsageReport and getStockAdjustmentAuditReport remain
// unchanged from Phase 6 Step 10 — their result sets are inherently bounded
// by ingredient count and manual-adjustment frequency respectively, which
// stay small even at scale, so in-memory aggregation there is not a
// performance concern worth the added complexity of a raw SQL rewrite.