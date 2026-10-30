"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesSummary = getSalesSummary;
exports.getTopSellingItems = getTopSellingItems;
exports.getInventoryUsageReport = getInventoryUsageReport;
exports.getStockAdjustmentAuditReport = getStockAdjustmentAuditReport;
const db_1 = require("../../config/db");
const errorHandler_1 = require("../../middlewares/errorHandler");
function parseAndValidateRange(dateFrom, dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    if (from > to) {
        throw new errorHandler_1.AppError('dateFrom must be before dateTo', 400);
    }
    const maxRangeMs = 366 * 24 * 60 * 60 * 1000;
    if (to.getTime() - from.getTime() > maxRangeMs) {
        throw new errorHandler_1.AppError('Date range cannot exceed 366 days', 400);
    }
    return { from, to };
}
async function getSalesSummary(input) {
    const { from, to } = parseAndValidateRange(input.dateFrom, input.dateTo);
    // Cast after the call rather than using $queryRaw<T>`...` — a multi-line
    // generic type argument directly before a tagged template literal is
    // parsed unreliably by some TypeScript/ts-node configurations.
    const rawResult = await db_1.prisma.$queryRaw `
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
    const dailyBreakdown = rawResult;
    const totals = await db_1.prisma.order.aggregate({
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
async function getTopSellingItems(query) {
    const { from, to } = parseAndValidateRange(query.dateFrom, query.dateTo);
    const limit = query.limit ?? 10;
    const grouped = await db_1.prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: { order: { status: 'COMPLETED', createdAt: { gte: from, lte: to } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: limit,
    });
    const menuItemIds = grouped.map((g) => g.menuItemId);
    const menuItems = await db_1.prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
        select: { id: true, name: true, price: true },
    });
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));
    return grouped.map((g) => {
        const menuItem = menuItemMap.get(g.menuItemId);
        const quantitySold = g._sum.quantity ?? 0;
        return {
            menuItemId: g.menuItemId,
            name: menuItem.name,
            quantitySold,
            revenue: quantitySold * menuItem.price.toNumber(),
        };
    });
}
async function getInventoryUsageReport(input) {
    const { from, to } = parseAndValidateRange(input.dateFrom, input.dateTo);
    const orderItems = await db_1.prisma.orderItem.findMany({
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
    const usage = new Map();
    for (const orderItem of orderItems) {
        for (const recipe of orderItem.menuItem.recipes) {
            const totalUsed = recipe.quantityRequired.toNumber() * orderItem.quantity;
            const existing = usage.get(recipe.ingredientId);
            if (existing) {
                existing.quantityUsed += totalUsed;
            }
            else {
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
async function getStockAdjustmentAuditReport(input) {
    const { from, to } = parseAndValidateRange(input.dateFrom, input.dateTo);
    const adjustments = await db_1.prisma.auditLog.findMany({
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
