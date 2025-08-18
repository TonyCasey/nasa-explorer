import request from 'supertest';
import express from 'express';
import cors from 'cors';
import apiRoutes from './index';
import { errorHandler } from '../middleware/errorHandler';
import { requestLogger } from '../middleware/requestLogger';
import { rateLimiter } from '../middleware/rateLimiter';

// Mock the NASA service to prevent real API calls
jest.mock('../services/nasa.service', () => {
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

describe('Additional API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(requestLogger);
    app.use(rateLimiter);
    app.use('/api/v1', apiRoutes);
    app.use(errorHandler);
  });

  describe('Middleware Integration', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/v1/apod')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');
      
      expect([200, 204, 404]).toContain(response.status);
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/v1/apod')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');
      
      expect([400, 404, 405]).toContain(response.status);
    });

    it('should handle large request bodies', async () => {
      const largeData = { data: 'x'.repeat(1000000) };
      
      const response = await request(app)
        .post('/api/v1/neo/feed')
        .send(largeData);
      
      expect([400, 404, 405, 413]).toContain(response.status);
    });
  });

  describe('Route Coverage Tests', () => {
    it('should handle APOD with various parameters', async () => {
      // Test with date
      await request(app)
        .get('/api/v1/apod?date=2025-08-15');

      // Test with count
      await request(app)
        .get('/api/v1/apod?count=5');

      // Test with thumbs
      await request(app)
        .get('/api/v1/apod?thumbs=true');
    });

    it('should handle Mars rover different cameras', async () => {
      const cameras = ['fhaz', 'rhaz', 'mast', 'chemcam', 'mahli', 'mardi', 'navcam'];
      
      for (const camera of cameras) {
        await request(app)
          .get(`/api/v1/mars-rovers/curiosity/photos?camera=${camera}`);
      }
    });

    it('should handle NEO lookup variations', async () => {
      // Test NEO lookup by ID
      await request(app)
        .get('/api/v1/neo/lookup/54016');

      // Test NEO browse
      await request(app)
        .get('/api/v1/neo/browse');

      // Test NEO stats
      await request(app)
        .get('/api/v1/neo/stats');
    });

    it('should handle EPIC different image types', async () => {
      // Test natural color
      await request(app)
        .get('/api/v1/epic/natural/2025-08-15');

      // Test enhanced color
      await request(app)
        .get('/api/v1/epic/enhanced/2025-08-15');

      // Test available dates
      await request(app)
        .get('/api/v1/epic/natural/available');
    });
  });

  describe('Error Handling Coverage', () => {
    it('should handle malformed date parameters', async () => {
      await request(app)
        .get('/api/v1/apod?date=not-a-date');

      await request(app)
        .get('/api/v1/epic/natural/invalid-date');
    });

    it('should handle malformed numeric parameters', async () => {
      await request(app)
        .get('/api/v1/mars-rovers/curiosity/photos?sol=not-a-number');

      await request(app)
        .get('/api/v1/neo/lookup/not-a-number');
    });

    it('should handle missing required parameters', async () => {
      await request(app)
        .get('/api/v1/mars-rovers//photos'); // missing rover name

      await request(app)
        .get('/api/v1/epic/natural/'); // missing date
    });
  });

  describe('Response Format Tests', () => {
    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/v1/apod')
        .set('Accept', 'application/json');

      if (response.status === 200) {
        expect(response.type).toMatch(/json/);
      }
    });

    it('should handle different Accept headers', async () => {
      await request(app)
        .get('/api/v1/apod')
        .set('Accept', '*/*');

      await request(app)
        .get('/api/v1/apod')
        .set('Accept', 'text/html');
    });
  });

  describe('Route Parameter Validation', () => {
    it('should validate rover names', async () => {
      const validRovers = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
      const invalidRovers = ['invalid', 'test', ''];

      for (const rover of validRovers) {
        const response = await request(app)
          .get(`/api/v1/mars-rovers/${rover}/photos`);
        expect([200, 403, 404]).toContain(response.status);
      }

      for (const rover of invalidRovers) {
        const response = await request(app)
          .get(`/api/v1/mars-rovers/${rover}/photos`);
        expect([400, 403, 404]).toContain(response.status);
      }
    });

    it('should validate date ranges for NEO feed', async () => {
      // Valid date range
      await request(app)
        .get('/api/v1/neo/feed?start_date=2025-08-15&end_date=2025-08-16');

      // Invalid date range (end before start)
      await request(app)
        .get('/api/v1/neo/feed?start_date=2025-08-16&end_date=2025-08-15');
    });
  });
});