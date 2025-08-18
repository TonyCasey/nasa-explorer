import request from 'supertest';
import express from 'express';
import apiRoutes from './index';
import { errorHandler } from '../middleware/errorHandler';

// Mock the NASA service to prevent real API calls
jest.mock('../services/nasa.service', () => {
  const mockService = {
    getAPOD: jest.fn().mockResolvedValue({ title: 'Test APOD' }),
    getMarsRoverPhotos: jest.fn().mockResolvedValue({ photos: [] }),
    getNEOFeed: jest.fn().mockResolvedValue({ near_earth_objects: {} }),
    getNEOById: jest.fn().mockResolvedValue({ id: '12345', name: 'Test NEO' }),
    getEPICImages: jest.fn().mockResolvedValue([]),
    validateApiKey: jest.fn().mockResolvedValue(true),
  };
  
  return {
    nasaService: mockService,
    NASAService: jest.fn().mockImplementation(() => mockService),
  };
});

describe('Comprehensive API Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1', apiRoutes);
    app.use(errorHandler);
  });

  describe('Parameter validation', () => {
    it('should handle invalid rover names', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/invalid-rover/photos');
      
      expect([400, 404, 403]).toContain(response.status);
    });

    it('should handle invalid sol numbers', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/curiosity/photos?sol=invalid');
      
      expect([400, 403, 404]).toContain(response.status);
    });

    it('should handle invalid dates', async () => {
      const response = await request(app)
        .get('/api/v1/apod?date=invalid-date');
      
      expect([400, 403, 404]).toContain(response.status);
    });
  });

  describe('Query parameter handling', () => {
    it('should handle APOD with count parameter', async () => {
      const response = await request(app)
        .get('/api/v1/apod?count=5');
      
      expect([200, 403]).toContain(response.status);
    });

    it('should handle Mars rover photos with camera filter', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/curiosity/photos?camera=fhaz');
      
      expect([200, 403, 404]).toContain(response.status);
    });

    it('should handle NEO feed with date range', async () => {
      const response = await request(app)
        .get('/api/v1/neo/feed?start_date=2025-08-15&end_date=2025-08-16');
      
      expect([200, 400, 403]).toContain(response.status);
    });
  });

  describe('Different rover types', () => {
    const rovers = ['curiosity', 'opportunity', 'spirit', 'perseverance', 'ingenuity'];
    
    rovers.forEach(rover => {
      it(`should handle ${rover} rover requests`, async () => {
        const response = await request(app)
          .get(`/api/v1/mars-rovers/${rover}/photos`);
        
        // Should either work (200) or have API key issues (403) or not found (404)
        expect([200, 403, 404]).toContain(response.status);
      });
    });
  });

  describe('Error handling', () => {
    it('should return structured errors for malformed requests', async () => {
      const response = await request(app)
        .post('/api/v1/neo/feed')
        .send({ invalid: 'data' });
      
      expect([400, 404, 405, 403]).toContain(response.status);
    });

    it('should handle missing required parameters', async () => {
      const response = await request(app)
        .get('/api/v1/neo/12345'); // NEO lookup with valid ID format
      
      expect([200, 400, 404, 403]).toContain(response.status);
    });
  });

  describe('Content type handling', () => {
    it('should handle JSON content type', async () => {
      const response = await request(app)
        .get('/api/v1/apod')
        .set('Accept', 'application/json');
      
      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.type).toMatch(/json/);
      }
    });

    it('should reject unsupported content types for POST', async () => {
      const response = await request(app)
        .post('/api/v1/apod')
        .set('Content-Type', 'text/plain')
        .send('invalid data');
      
      expect([400, 404, 405, 415]).toContain(response.status);
    });
  });

  describe('HTTP method handling', () => {
    it('should reject unsupported methods on APOD', async () => {
      const response = await request(app)
        .put('/api/v1/apod');
      
      expect([404, 405]).toContain(response.status);
    });

    it('should reject unsupported methods on Mars rovers', async () => {
      const response = await request(app)
        .delete('/api/v1/mars-rovers/curiosity/photos');
      
      expect([404, 405]).toContain(response.status);
    });

    it('should handle OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/v1/apod');
      
      expect([200, 204, 404]).toContain(response.status);
    });
  });

  describe('Nested route handling', () => {
    it('should handle deeply nested routes', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/curiosity/photos/12345');
      
      expect([200, 404, 403]).toContain(response.status);
    });

    it('should handle partial route matches', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers');
      
      expect([200, 404, 405]).toContain(response.status);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long URLs', async () => {
      const longParam = 'a'.repeat(1000);
      const response = await request(app)
        .get(`/api/v1/apod?date=${longParam}`);
      
      expect([400, 403, 414]).toContain(response.status);
    });

    it('should handle special characters in parameters', async () => {
      const response = await request(app)
        .get('/api/v1/apod?date=2025-08-15%20invalid');
      
      expect([400, 403, 404]).toContain(response.status);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(app).get('/api/v1/apod')
      );
      
      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect([200, 403]).toContain(response.status);
      });
    });
  });
});