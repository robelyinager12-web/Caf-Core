import { getSalesSummary, getTopSellingItems } from '../../src/modules/reports/report.service';
import { prisma } from '../../src/config/db';
import { createTestUser, cleanupTestUser } from '../helpers/testApp';

describe('Report Service — Aggregation Accuracy', () => {
  let categoryId: string;
  let menuItemId: string;
  let cashierId: string;
  const orderIds: string[] = [];

  beforeAll(async () => {
    const { user } = await createTestUser('CASHIER', 'report-test');
    cashierId = user.id;

    const category = await prisma.category.create({ data: { name: `Report Test ${Date.now()}` } });
    categoryId = category.id;

    const menuItem = await prisma.menuItem.create({
      data: { categoryId, name: 'Report Item', price: 10, isAvailable: true },
    });
    menuItemId = menuItem.id;

    // Create 3 completed orders of 2 units each = 6 total units, $60 revenue
    for (let i = 0; i < 3; i++) {
      const order = await prisma.order.create({
        data: {
          orderNumber: `TEST-REPORT-${Date.now()}-${i}`,
          createdById: cashierId,
          status: 'COMPLETED',
          orderType: 'TAKEAWAY',
          subtotal: 20,
          total: 20,
          items: { create: { menuItemId, quantity: 2, unitPrice: 10 } },
        },
      });
      orderIds.push(order.id);
    }
  });

  afterAll(async () => {
    for (const id of orderIds) {
      await prisma.orderItem.deleteMany({ where: { orderId: id } });
      await prisma.order.delete({ where: { id } });
    }
    await prisma.menuItem.delete({ where: { id: menuItemId } });
    await prisma.category.delete({ where: { id: categoryId } });
    await cleanupTestUser(cashierId);
  });

  it('computes correct total revenue and order count', async () => {
    const now = new Date();
    const dateFrom = new Date(now.getTime() - 60000).toISOString();
    const dateTo = new Date(now.getTime() + 60000).toISOString();

    const summary = await getSalesSummary({ dateFrom, dateTo });

    expect(summary.totalRevenue).toBeGreaterThanOrEqual(60);
    expect(summary.totalOrders).toBeGreaterThanOrEqual(3);
    expect(summary.averageOrderValue).toBeCloseTo(summary.totalRevenue / summary.totalOrders, 2);
  });

  it('correctly aggregates quantity sold for top items via groupBy', async () => {
    const now = new Date();
    const dateFrom = new Date(now.getTime() - 60000).toISOString();
    const dateTo = new Date(now.getTime() + 60000).toISOString();

    const topItems = await getTopSellingItems({ dateFrom, dateTo, limit: 10 });
    const testItem = topItems.find((i) => i.menuItemId === menuItemId);

    expect(testItem).toBeDefined();
    expect(testItem?.quantitySold).toBe(6); // 3 orders * 2 units
    expect(testItem?.revenue).toBe(60); // 6 units * $10
  });
});