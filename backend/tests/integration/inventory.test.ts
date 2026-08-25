import request from 'supertest';
import { app } from '../helpers/testApp';
import { createTestUser, cleanupTestUser } from '../helpers/testApp';
import { prisma } from '../../src/config/db';

describe('Inventory Module', () => {
  let managerToken: string;
  let managerId: string;
  let ingredientId: string;

  beforeAll(async () => {
    const { user, password } = await createTestUser('MANAGER', 'inventory-manager');
    managerId = user.id;
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password });
    managerToken = loginRes.body.data.accessToken;

    const ingredient = await prisma.ingredient.create({
      data: {
        name: `Adjust Test ${Date.now()}`,
        unit: 'ml',
        inventory: { create: { quantityInStock: 500, lowStockThreshold: 100 } },
      },
    });
    ingredientId = ingredient.id;
  });

  afterAll(async () => {
    await prisma.inventory.delete({ where: { ingredientId } });
    await prisma.ingredient.delete({ where: { id: ingredientId } });
    await cleanupTestUser(managerId);
  });

  it('adjusts stock upward with a reason', async () => {
    const res = await request(app)
      .post(`/api/inventory/${ingredientId}/adjust`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ quantityChange: 200, reason: 'Delivery received' });

    expect(res.status).toBe(200);
    expect(res.body.data.quantityInStock).toBe(700);
  });

  it('rejects an adjustment that would go negative', async () => {
    const res = await request(app)
      .post(`/api/inventory/${ingredientId}/adjust`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ quantityChange: -99999, reason: 'Testing negative guard' });

    expect(res.status).toBe(400);
  });

  it('rejects an adjustment without a reason', async () => {
    const res = await request(app)
      .post(`/api/inventory/${ingredientId}/adjust`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ quantityChange: 10 });

    expect(res.status).toBe(422);
  });

  it('writes an audit log entry for every adjustment', async () => {
    await request(app)
      .post(`/api/inventory/${ingredientId}/adjust`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ quantityChange: 5, reason: 'Audit trail check' });

    const logs = await prisma.auditLog.findMany({
      where: { action: 'STOCK_ADJUSTED', userId: managerId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    expect(logs.length).toBe(1);
    expect((logs[0].metadata as any).reason).toBe('Audit trail check');
  });
});