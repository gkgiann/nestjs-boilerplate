import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './setup';
import { resetDatabase } from '../utils/reset-db';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should fail login with invalid credentials', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'wrong@test.com',
      password: '123',
    });

    expect(response.status).toBe(401);
  });
});
