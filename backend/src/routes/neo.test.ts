import request from 'supertest';
import express from 'express';
import neoRouter from './neo';
import { nasaService } from '../services/nasa.service';
import { errorHandler } from '../middleware/errorHandler';

// Mock the NASA service
jest.mock('../services/nasa.service');
const mockedNasaService = nasaService as jest.Mocked<typeof nasaService>;

describe('NEO Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/neo', neoRouter);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/neo/feed', () => {
    it('should return NEO feed data successfully', async () => {
      const mockNEOFeed = {
        links: {},
        element_count: 10,
        near_earth_objects: {
          '2025-08-15': [
            {
              id: '54016849',
              name: '(2020 BZ12)',
              estimated_diameter: {},
              is_potentially_hazardous_asteroid: false,
            },
          ],
        },
      };

      mockedNasaService.getNEOFeed.mockResolvedValue(mockNEOFeed);

      const response = await request(app)
        .get('/api/v1/neo/feed')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockNEOFeed,
        timestamp: expect.any(String)
      });
      expect(mockedNasaService.getNEOFeed).toHaveBeenCalled();
    });

    it('should handle custom date range', async () => {
      const mockNEOFeed = { near_earth_objects: {} };
      mockedNasaService.getNEOFeed.mockResolvedValue(mockNEOFeed);

      await request(app)
        .get('/api/v1/neo/feed?start_date=2025-08-15&end_date=2025-08-16')
        .expect(200);

      expect(mockedNasaService.getNEOFeed).toHaveBeenCalledWith('2025-08-15', '2025-08-16');
    });

    it('should handle NASA service errors', async () => {
      mockedNasaService.getNEOFeed.mockRejectedValue(new Error('NASA API Error'));

      const response = await request(app)
        .get('/api/v1/neo/feed')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/neo/:id', () => {
    it('should return specific NEO data', async () => {
      const mockNEO = {
        id: '54016849',
        name: '(2020 BZ12)',
        designation: '2020 BZ12',
        absolute_magnitude_h: 20.3,
        estimated_diameter: {},
        is_potentially_hazardous_asteroid: false,
      };

      mockedNasaService.getNEOById.mockResolvedValue(mockNEO);

      const response = await request(app)
        .get('/api/v1/neo/54016849')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockNEO,
        timestamp: expect.any(String)
      });
      expect(mockedNasaService.getNEOById).toHaveBeenCalledWith('54016849');
    });

    it('should handle invalid NEO ID', async () => {
      const response = await request(app)
        .get('/api/v1/neo/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid NEO ID format');
    });
  });
});