import request from 'supertest';
import express from 'express';
import apodRouter from './apod';
import * as nasaService from '../services/nasa.service';

// Mock the NASA service
jest.mock('../services/nasa.service');
const mockedNasaService = nasaService as jest.Mocked<typeof nasaService>;

describe('APOD Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/apod', apodRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/apod', () => {
    it('should return APOD data successfully', async () => {
      const mockAPOD = {
        date: '2025-08-15',
        title: 'Test APOD',
        url: 'https://apod.nasa.gov/apod/image/test.jpg',
        explanation: 'Test explanation',
        media_type: 'image',
      };

      mockedNasaService.getAPOD.mockResolvedValue(mockAPOD);

      const response = await request(app)
        .get('/api/v1/apod')
        .expect(200);

      expect(response.body).toEqual(mockAPOD);
      expect(mockedNasaService.getAPOD).toHaveBeenCalledWith(undefined);
    });

    it('should return APOD data for specific date', async () => {
      const mockAPOD = {
        date: '2025-08-14',
        title: 'Test APOD for Date',
        url: 'https://apod.nasa.gov/apod/image/test2.jpg',
        explanation: 'Test explanation',
        media_type: 'image',
      };

      mockedNasaService.getAPOD.mockResolvedValue(mockAPOD);

      const response = await request(app)
        .get('/api/v1/apod?date=2025-08-14')
        .expect(200);

      expect(response.body).toEqual(mockAPOD);
      expect(mockedNasaService.getAPOD).toHaveBeenCalledWith('2025-08-14');
    });

    it('should handle NASA service errors', async () => {
      mockedNasaService.getAPOD.mockRejectedValue(new Error('NASA API Error'));

      const response = await request(app)
        .get('/api/v1/apod')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Failed to fetch APOD');
    });

    it('should validate date parameter format', async () => {
      const response = await request(app)
        .get('/api/v1/apod?date=invalid-date')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid date format');
    });

    it('should handle dates in the future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/apod?date=${futureDateString}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Date cannot be in the future');
    });

    it('should include cache headers', async () => {
      const mockAPOD = {
        date: '2025-08-15',
        title: 'Test APOD',
        url: 'https://apod.nasa.gov/apod/image/test.jpg',
        explanation: 'Test explanation',
        media_type: 'image',
      };

      mockedNasaService.getAPOD.mockResolvedValue(mockAPOD);

      const response = await request(app)
        .get('/api/v1/apod')
        .expect(200);

      expect(response.headers['cache-control']).toBeDefined();
    });
  });
});