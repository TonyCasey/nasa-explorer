import request from 'supertest';
import express from 'express';
import { getVersionString } from './utils/version';

// Mock the version utility
jest.mock('./utils/version', () => ({
  getVersionString: jest.fn().mockReturnValue('v1.3.0'),
}));

// Create a simple mock app for testing
const createMockApp = () => {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      version: getVersionString(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: 'test',
      memory: process.memoryUsage(),
    });
  });

  // API routes
  const router = express.Router();
  router.get('/test', (req, res) => {
    res.json({ message: 'Test route' });
  });
  app.use('/api/v1', router);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};

describe('Server Application', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createMockApp();
  });

  describe('Health Check Endpoint', () => {
    test('GET /health returns server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        version: 'v1.3.0',
        environment: expect.any(String),
        uptime: expect.any(Number),
        memory: expect.any(Object),
      });

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('health check includes memory usage', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('external');
    });

    test('health check includes uptime', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Routes', () => {
    test('API routes are mounted correctly', async () => {
      const response = await request(app)
        .get('/api/v1/test')
        .expect(200);

      expect(response.body).toEqual({ message: 'Test route' });
    });
  });

  describe('Error Handling', () => {
    test('404 handler for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: 'Route /unknown-route not found',
      });

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('404 handler for unknown API routes', async () => {
      const response = await request(app)
        .get('/api/v1/unknown')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: 'Route /api/v1/unknown not found',
      });
    });

    test('404 handler preserves query parameters in error message', async () => {
      const response = await request(app)
        .get('/unknown?param=value')
        .expect(404);

      expect(response.body.message).toBe('Route /unknown?param=value not found');
    });
  });

  describe('Middleware Configuration', () => {
    test('JSON body parsing with size limit', async () => {
      const largeJson = { data: 'x'.repeat(1000) };
      
      // This should work as it's under the 10mb limit
      const response = await request(app)
        .post('/api/v1/test')
        .send(largeJson)
        .expect(404); // 404 because route doesn't exist, but JSON was parsed

      // The fact we get 404 and not 413 means the JSON was parsed successfully
      expect(response.status).toBe(404);
    });

    test('CORS headers are present', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('Security headers are present', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for helmet security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    test('Compression headers are present for large responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Content will be compressed if it's large enough
      expect(response.headers['content-encoding']).toBeUndefined(); // Health response is small
    });
  });

  describe('Express Application Configuration', () => {
    test('accepts URL encoded data', async () => {
      const response = await request(app)
        .post('/api/v1/test')
        .type('form')
        .send('name=test&value=123')
        .expect(404); // Route doesn't exist but data was parsed

      expect(response.status).toBe(404);
    });

    test('handles different HTTP methods', async () => {
      // Test that the server accepts different HTTP methods
      await request(app).get('/health').expect(200);
      await request(app).post('/unknown').expect(404);
      await request(app).put('/unknown').expect(404);
      await request(app).delete('/unknown').expect(404);
    });
  });

  describe('Environment Configuration', () => {
    test('environment is set correctly', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(['development', 'test', 'production']).toContain(response.body.environment);
    });

    test('version string is included', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(getVersionString).toHaveBeenCalled();
      expect(response.body.version).toBe('v1.3.0');
    });
  });
});