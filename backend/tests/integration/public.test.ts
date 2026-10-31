import request from 'supertest';
import { app } from '../helpers/testApp';
import { prisma } from '../../src/config/db';

describe('Public café storefront', () => {
  let categoryId: string;
  let availableMenuItemId: string;
  let unavailableMenuItemId: string;
  let createdOrderId: string | undefined;
  let orderNumber: string | undefined;

  beforeAll(async () => {
    const category = await prisma.category.create({
      data: { name: `Public storefront ${Date.now()}` },
    });
    categoryId = category.id;

    const availableItem = await prisma.menuItem.create({
      data: {
        categoryId,
        name: 'Public pickup item',
        price: 8.5,
        isAvailable: true,
      },
    });
    availableMenuItemId = availableItem.id;

    const unavailableItem = await prisma.menuItem.create({
      data: {
        categoryId,
        name: 'Hidden pickup item',
        price: 4,
        isAvailable: false,
      },
    });
    unavailableMenuItemId = unavailableItem.id;
  });

  afterAll(async () => {
    if (createdOrderId) {
      if (orderNumber) {
        await prisma.notification.deleteMany({
          where: { message: { contains: orderNumber } },
        });
      }
      await prisma.order.delete({ where: { id: createdOrderId } });
    }
    if (availableMenuItemId) {
      await prisma.menuItem.delete({ where: { id: availableMenuItemId } });
    }
    if (unavailableMenuItemId) {
      await prisma.menuItem.delete({ where: { id: unavailableMenuItemId } });
    }
    if (categoryId) {
      await prisma.category.delete({ where: { id: categoryId } });
    }
  });

  it('lists available menu items publicly but hides unavailable items', async () => {
    const response = await request(app).get('/api/public/menu?limit=100');

    expect(response.status).toBe(200);
    expect(response.body.data.some((item: { id: string }) => item.id === availableMenuItemId)).toBe(
      true
    );
    expect(
      response.body.data.some((item: { id: string }) => item.id === unavailableMenuItemId)
    ).toBe(false);
  });

  it('creates a guest pickup order with server-calculated prices for staff processing', async () => {
    const response = await request(app)
      .post('/api/public/orders')
      .send({
        guestName: 'Pickup Customer',
        guestPhone: '+251 911 123 456',
        items: [{ menuItemId: availableMenuItemId, quantity: 2 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.orderType).toBe('TAKEAWAY');
    expect(response.body.data.createdById).toBeNull();
    expect(response.body.data.createdBy).toBeNull();
    expect(response.body.data.guestName).toBe('Pickup Customer');
    expect(response.body.data.guestPhone).toBe('+251 911 123 456');
    expect(Number(response.body.data.total)).toBe(17);

    createdOrderId = response.body.data.id;
    orderNumber = response.body.data.orderNumber;
  });

  it('validates customer contact details', async () => {
    const response = await request(app)
      .post('/api/public/orders')
      .send({
        guestName: 'Pickup Customer',
        guestPhone: 'invalid phone number',
        items: [{ menuItemId: availableMenuItemId, quantity: 1 }],
      });

    expect(response.status).toBe(422);
  });

  it('keeps staff menu and order endpoints protected', async () => {
    const menuResponse = await request(app).get('/api/menu');
    const orderResponse = await request(app)
      .post('/api/orders')
      .send({
        orderType: 'TAKEAWAY',
        items: [{ menuItemId: availableMenuItemId, quantity: 1 }],
      });

    expect(menuResponse.status).toBe(401);
    expect(orderResponse.status).toBe(401);
  });
});
