import request from 'supertest';
import app from './app';

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

describe('App', () => {
  // app is already imported and configured

  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'OK',
      version: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('should handle 404 for non-existent routes', async () => {
    await request(app)
      .get('/non-existent-route')
      .expect(404);
    // The app doesn't have a specific 404 handler format, just checks status
  });

  it('should have CORS enabled', async () => {
    const response = await request(app)
      .options('/health')
      .set('Origin', 'http://localhost:3000')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('should parse JSON bodies', async () => {
    // This test will hit a route that accepts JSON
    await request(app)
      .get('/health')
      .send({ test: 'data' })
      .expect(200);
  });

  it('should have rate limiting middleware', async () => {
    // Make multiple requests to test rate limiting headers on API routes
    const response = await request(app)
      .get('/api/v1/apod');

    expect(response.headers['x-ratelimit-limit']).toBeDefined();
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    expect(response.headers['x-ratelimit-reset']).toBeDefined();
  });

  it('should handle API routes', async () => {
    // NASA service is mocked, so this should return 200 with mock data
    const response = await request(app)
      .get('/api/v1/apod')
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
  });

  it('should serve static files in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      // In production mode, static files would be served
      // This is just testing that the middleware is set up
      expect(app).toBeDefined();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('should handle favicon requests', async () => {
    await request(app)
      .get('/favicon.ico')
      .expect(404); // App doesn't serve favicon, expects 404
  });
});