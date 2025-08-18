import request from 'supertest';
import express from 'express';
import epicRouter from './epic';
import { nasaService } from '../services/nasa.service';
import { errorHandler } from '../middleware/errorHandler';

// Mock the NASA service
jest.mock('../services/nasa.service', () => ({
  nasaService: {
    getEPICImages: jest.fn(),
    getEPICImageMetadata: jest.fn(),
    getEPICAvailableDates: jest.fn(),
    getEPICImageArchive: jest.fn(),
    healthCheck: jest.fn(),
    validateApiKey: jest.fn()
  }
}));

describe('EPIC Routes', () => {
  let app: express.Application;
  let mockNasaService: jest.Mocked<typeof nasaService>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/epic', epicRouter);
    app.use(errorHandler);
    
    mockNasaService = nasaService as jest.Mocked<typeof nasaService>;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/epic/images', () => {
    it('should return EPIC images successfully', async () => {
      const mockEPICImages = [
        {
          identifier: '20150418003633',
          caption: 'This image was taken by NASA\'s EPIC camera onboard the NOAA DSCOVR spacecraft',
          image: 'epic_1b_20150418003633',
          version: '02',
          date: '2015-04-18 00:36:33',
        }
      ];

      mockNasaService.getEPICImages.mockResolvedValue(mockEPICImages);

      const response = await request(app)
        .get('/api/v1/epic/')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockEPICImages,
        timestamp: expect.any(String)
      });
      expect(mockNasaService.getEPICImages).toHaveBeenCalled();
    });

    it('should handle custom date parameter', async () => {
      const mockEPICImages: any[] = [];
      mockNasaService.getEPICImages.mockResolvedValue(mockEPICImages);

      await request(app)
        .get('/api/v1/epic/?date=2025-08-15')
        .expect(200);

      expect(mockNasaService.getEPICImages).toHaveBeenCalledWith('2025-08-15');
    });

    it('should handle NASA service errors', async () => {
      mockNasaService.getEPICImages.mockRejectedValue(new Error('NASA API Error'));

      const response = await request(app)
        .get('/api/v1/epic/')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/epic/archive', () => {
    it('should return EPIC archive data', async () => {
      const mockArchive = [
        {
          date: '2025-08-15'
        }
      ];

      mockNasaService.getEPICImageArchive.mockResolvedValue(mockArchive);

      const response = await request(app)
        .get('/api/v1/epic/archive')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          available_dates: ['2025-08-15'],
          total_dates: 1,
          date_range: {
            first: '2025-08-15',
            last: '2025-08-15'
          },
          years_available: ['2025'],
          months_available: ['2025-08']
        },
        timestamp: expect.any(String)
      });
      expect(mockNasaService.getEPICImageArchive).toHaveBeenCalled();
    });

    it('should handle NASA service errors', async () => {
      mockNasaService.getEPICImageArchive.mockRejectedValue(new Error('NASA API Error'));

      const response = await request(app)
        .get('/api/v1/epic/archive')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});