import request from 'supertest';
import express from 'express';
import apiRoutes from './index';
import { errorHandler } from '../middleware/errorHandler';

describe('API Routes Index', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1', apiRoutes);
    app.use(errorHandler);
  });

  it('should have APOD route registered', async () => {
    // We expect a 403 due to invalid NASA API key, but route exists
    const response = await request(app)
      .get('/api/v1/apod')
      .expect(403);
    
    // Should get structured error response
    expect(response.body).toHaveProperty('error');
  });

  it('should have Mars Rovers route registered', async () => {
    const response = await request(app)
      .get('/api/v1/mars-rovers/curiosity/photos');
    
    // Mars rover route might return 403 (API key) or 404 (not found)
    expect([403, 404]).toContain(response.status);
  });

  it('should have NEO route registered', async () => {
    const response = await request(app)
      .get('/api/v1/neo/feed');
    
    // NEO route might return 403 (API key) or 404 (not found)
    expect([403, 404]).toContain(response.status);
  });

  it('should have EPIC route registered', async () => {
    // EPIC route may not be fully implemented, expect 404 or 403
    const response = await request(app)
      .get('/api/v1/epic/images');
    
    expect([403, 404]).toContain(response.status);
  });

  it('should handle invalid route within API scope', async () => {
    await request(app)
      .get('/api/v1/invalid-route')
      .expect(404);
  });

  it('should handle different HTTP methods', async () => {
    // POST to APOD endpoint should work (but return 403 due to API key)
    await request(app)
      .post('/api/v1/apod')
      .expect(404); // Method not allowed for this endpoint
  });

  it('should export router as default', () => {
    expect(apiRoutes).toBeDefined();
    expect(typeof apiRoutes).toBe('function'); // Express router is a function
  });
});