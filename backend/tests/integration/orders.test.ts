import request from 'supertest';
import { app } from '../helpers/testApp';
import { createTestUser, cleanupTestUser } from '../helpers/testApp';
import { prisma } from '../../src/config/db';

describe('Orders Module — Inventory Deduction Integration', () => {
  let cashierToken: string;
  let cashierId: string;
  let categoryId: string;
  let ingredientId: string;
  let menuItemId: string;

  beforeAll(async () => {
    const { user, password } = await createTestUser('CASHIER', 'orders-cashier');
    cashierId = user.id;
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password });
    cashierToken = loginRes.body.data.accessToken;

    const category = await prisma.category.create({
      data: { name: `Test Category ${Date.now()}` },
    });
    categoryId = category.id;

    const ingredient = await prisma.ingredient.create({
      data: {
        name: `Test Ingredient ${Date.now()}`,
        unit: 'g',
        inventory: { create: { quantityInStock: 1000, lowStockThreshold: 100 } },
      },
    });
    ingredientId = ingredient.id;

    const menuItem = await prisma.menuItem.create({
      data: {
        categoryId,
        name: 'Test Item',
        price: 5.0,
        isAvailable: true,
        recipes: { create: { ingredientId, quantityRequired: 20 } },
      },
    });
    menuItemId = menuItem.id;
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany({ where: { menuItemId } });
    await prisma.recipe.deleteMany({ where: { menuItemId } });
    await prisma.menuItem.delete({ where: { id: menuItemId } });
    await prisma.inventory.delete({ where: { ingredientId } });
    await prisma.ingredient.delete({ where: { id: ingredientId } });
    await prisma.category.delete({ where: { id: categoryId } });
    await cleanupTestUser(cashierId);
  });

  it('creates an order and only deducts inventory once COMPLETED', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({
        orderType: 'TAKEAWAY',
        items: [{ menuItemId, quantity: 3 }],
      });

    expect(createRes.status).toBe(201);
    const orderId = createRes.body.data.id;

    // Inventory should be untouched immediately after creation
    const inventoryBeforeCompletion = await prisma.inventory.findUnique({
      where: { ingredientId },
    });
    expect(inventoryBeforeCompletion?.quantityInStock.toNumber()).toBe(1000);

    // Walk through the required lifecycle: PENDING -> PREPARING -> READY -> COMPLETED
    for (const status of ['PREPARING', 'READY', 'COMPLETED']) {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ status });
      expect(res.status).toBe(200);
    }

    // 3 units * 20g required per unit = 60g should now be deducted
    const inventoryAfterCompletion = await prisma.inventory.findUnique({
      where: { ingredientId },
    });
    expect(inventoryAfterCompletion?.quantityInStock.toNumber()).toBe(940);
  });

  it('rejects an invalid status transition (PENDING -> READY directly)', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ orderType: 'TAKEAWAY', items: [{ menuItemId, quantity: 1 }] });

    const orderId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ status: 'READY' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Cannot transition');
  });

  it('rejects an order exceeding the 50-item quantity cap', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ orderType: 'TAKEAWAY', items: [{ menuItemId, quantity: 51 }] });

    expect(res.status).toBe(422);
  });

  it('rejects creating an order for an unavailable menu item', async () => {
    await prisma.menuItem.update({ where: { id: menuItemId }, data: { isAvailable: false } });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${cashierToken}`)
      .send({ orderType: 'TAKEAWAY', items: [{ menuItemId, quantity: 1 }] });

    expect(res.status).toBe(409);

    await prisma.menuItem.update({ where: { id: menuItemId }, data: { isAvailable: true } });
  });
});