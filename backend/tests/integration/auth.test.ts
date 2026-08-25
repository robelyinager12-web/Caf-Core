import request from 'supertest';
import { app } from '../helpers/testApp';
import { createTestUser, cleanupTestUser } from '../helpers/testApp';
import { prisma } from '../../src/config/db';

describe('Auth Module', () => {
  let adminUserId: string;

  afterAll(async () => {
    if (adminUserId) await cleanupTestUser(adminUserId);
  });

  describe('POST /api/auth/login', () => {
    it('logs in successfully with correct credentials', async () => {
      const { user, password } = await createTestUser('ADMIN', 'login-success');
      adminUserId = user.id;

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(user.email);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('rejects a wrong password with a generic message', async () => {
      const { user } = await createTestUser('ADMIN', 'login-wrongpass');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'WrongPassword1' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');

      await cleanupTestUser(user.id);
    });

    it('rejects a nonexistent email with the same generic message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@nowhere.local', password: 'Whatever123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('rejects a deactivated user even with correct credentials', async () => {
      const { user, password } = await createTestUser('CASHIER', 'login-inactive');
      await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password });

      expect(res.status).toBe(401);

      await cleanupTestUser(user.id);
    });
  });

  describe('POST /api/auth/register', () => {
    it('rejects registration without an auth token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        fullName: 'New Person',
        email: 'new@test.local',
        password: 'Password123',
        role: 'CASHIER',
      });

      expect(res.status).toBe(401);
    });

    it('rejects registration from a Cashier token (not Admin/Manager)', async () => {
      const { user, password } = await createTestUser('CASHIER', 'register-forbidden');
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password });

      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`)
        .send({
          fullName: 'New Person',
          email: 'new2@test.local',
          password: 'Password123',
          role: 'CASHIER',
        });

      expect(res.status).toBe(403);

      await cleanupTestUser(user.id);
    });

    it('allows an Admin to register a new staff member', async () => {
      const { user, password } = await createTestUser('ADMIN', 'register-allowed');
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password });

      const newEmail = `new-staff-${Date.now()}@test.local`;
      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`)
        .send({
          fullName: 'New Staff',
          email: newEmail,
          password: 'Password123',
          role: 'KITCHEN',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(newEmail);

      await cleanupTestUser(res.body.data.id);
      await cleanupTestUser(user.id);
    });
  });
});