import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './setup';
import { resetDatabase } from '@test/utils/reset-db';

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

  it('should register a user', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register').send({
      name: 'John Doe',
      email: 'john@test.com',
      password: '123456',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });
});
