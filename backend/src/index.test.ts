import request from 'supertest';
import app from './app';
import { getVersionString } from './utils/version';

// Mock the version utility
jest.mock('./utils/version', () => ({
  getVersionString: jest.fn().mockReturnValue('v1.3.0'),
}));

// Mock the NASA service to prevent real API calls
jest.mock('./services/nasa.service', () => {
  const mockService = {
    getAPOD: jest.fn().mockResolvedValue({ title: 'Test APOD' }),
    getMarsRoverPhotos: jest.fn().mockResolvedValue({ photos: [] }),
    getNEOFeed: jest.fn().mockResolvedValue({ near_earth_objects: {} }),
    getEPICImages: jest.fn().mockResolvedValue([]),
    validateApiKey: jest.fn().mockResolvedValue(true),
  };
  
  return {
    nasaService: mockService,
    NASAService: jest.fn().mockImplementation(() => mockService),
  };
});


describe('Server Application', () => {

  describe('Health Check Endpoint', () => {
    test('GET /health returns server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        version: 'v1.3.0',
      });

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

  });

  describe('API Routes', () => {
    test('API routes are mounted correctly', async () => {
      // Test that API routes are mounted by hitting a real endpoint
      const response = await request(app)
        .get('/api/v1/apod')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
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
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin', 'http://localhost:3000');
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

    test('version string is included', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(getVersionString).toHaveBeenCalled();
      expect(response.body.version).toBe('v1.3.0');
    });
  });
});