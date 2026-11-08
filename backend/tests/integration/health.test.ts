import request from 'supertest';
import { app } from '../helpers/testApp';

describe('API status endpoints', () => {
  it('returns an API status at the root URL', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Caf-Core API is running',
      health: '/health',
    });
  });

  it('keeps the health check endpoint available', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
