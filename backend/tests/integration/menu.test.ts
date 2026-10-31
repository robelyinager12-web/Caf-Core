import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { app } from '../helpers/testApp';
import { cleanupTestUser, createTestUser } from '../helpers/testApp';
import { prisma } from '../../src/config/db';
import { env } from '../../src/config/env';

describe('Menu management permissions', () => {
  let adminId: string;
  let adminToken: string;
  let managerId: string;
  let managerToken: string;
  let categoryId: string;
  let createdMenuItemId: string | undefined;
  let uploadedImagePath: string | undefined;

  beforeAll(async () => {
    const admin = await createTestUser('ADMIN', 'menu-admin');
    adminId = admin.user.id;
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: admin.user.email, password: admin.password });
    adminToken = adminLogin.body.data.accessToken;

    const manager = await createTestUser('MANAGER', 'menu-manager');
    managerId = manager.user.id;
    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: manager.user.email, password: manager.password });
    managerToken = managerLogin.body.data.accessToken;

    const category = await prisma.category.create({
      data: { name: `Menu permission test ${Date.now()}` },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    if (createdMenuItemId) {
      await prisma.menuItem.delete({ where: { id: createdMenuItemId } });
    }
    if (uploadedImagePath) {
      await fs.rm(uploadedImagePath, { force: true });
    }
    if (categoryId) {
      await prisma.category.delete({ where: { id: categoryId } });
    }
    if (adminId) await cleanupTestUser(adminId);
    if (managerId) await cleanupTestUser(managerId);
  });

  it('allows an Admin to add a menu item and serve its uploaded image', async () => {
    const response = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('categoryId', categoryId)
      .field('name', 'Admin Menu Item')
      .field('price', '5.5')
      .attach('image', Buffer.from('menu image test'), {
        filename: 'menu-item.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(201);
    createdMenuItemId = response.body.data.id;
    const imageUrl = response.body.data.imageUrl as string;
    expect(imageUrl).toMatch(/^\/uploads\/menu-images\/menu-item-/);

    uploadedImagePath = path.resolve(process.cwd(), env.upload.dir, path.basename(imageUrl));
    const imageResponse = await request(app).get(imageUrl);
    expect(imageResponse.status).toBe(200);
    expect(imageResponse.headers['content-type']).toContain('image/png');
  });

  it('denies a Manager permission to add a menu item', async () => {
    const response = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ categoryId, name: 'Manager Menu Item', price: 5.5 });

    expect(response.status).toBe(403);
  });
});
