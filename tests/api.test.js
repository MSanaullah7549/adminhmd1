const request = require('supertest');
const express = require('express');

describe('Health Check', () => {
  let app;

  beforeAll(() => {
    app = require('../src/app');
  });

  test('GET /api/health should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api should return API info', async () => {
    const response = await request(app)
      .get('/api')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('adminHMD');
  });

  test('GET / should redirect to the login page', async () => {
    const response = await request(app)
      .get('/')
      .expect('Location', '/html/login-api.html');

    expect(response.status).toBe(302);
  });

  test('GET /assets/css/bootstrap.min.css should serve Bootstrap CSS', async () => {
    const response = await request(app)
      .get('/assets/css/bootstrap.min.css')
      .expect('Content-Type', /css/);

    expect(response.status).toBe(200);
    expect(response.text).toContain('.container');
  });
});
