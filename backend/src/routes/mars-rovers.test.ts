import request from 'supertest';
import express from 'express';
import marsRoversRouter from './mars-rovers';
import { nasaService } from '../services/nasa.service';
import { errorHandler } from '../middleware/errorHandler';

// Mock the NASA service
jest.mock('../services/nasa.service', () => ({
  nasaService: {
    getMarsRoverPhotos: jest.fn(),
    getMarsRoverManifest: jest.fn(),
    getRoverInfo: jest.fn(),
    getAllRovers: jest.fn(),
    healthCheck: jest.fn(),
    validateApiKey: jest.fn()
  }
}));

describe('Mars Rovers Routes', () => {
  let app: express.Application;
  let mockNasaService: jest.Mocked<typeof nasaService>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/mars-rovers', marsRoversRouter);
    app.use(errorHandler);
    
    mockNasaService = nasaService as jest.Mocked<typeof nasaService>;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/mars-rovers/photos', () => {
    it('should return Mars rover photos with default parameters', async () => {
      const mockPhotos = {
        photos: [
          {
            id: 1,
            sol: 1000,
            camera: {
              name: 'FHAZ',
              full_name: 'Front Hazard Avoidance Camera',
            },
            img_src: 'https://mars.nasa.gov/test.jpg',
            earth_date: '2025-08-15',
            rover: {
              name: 'Curiosity',
              status: 'active',
            },
          },
        ],
      };

      mockNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      const response = await request(app)
        .get('/api/v1/mars-rovers/photos?rover=curiosity')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockPhotos,
        filters: expect.any(Object),
        timestamp: expect.any(String)
      });
      expect(mockNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        page: 1,
        sol: undefined,
        earth_date: undefined,
        camera: undefined
      });
    });

    it('should accept custom rover parameter', async () => {
      const mockPhotos = { photos: [] };
      mockNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?rover=perseverance')
        .expect(200);

      expect(mockNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'perseverance',
        page: 1,
        sol: undefined,
        earth_date: undefined,
        camera: undefined
      });
    });

    it('should accept sol parameter', async () => {
      const mockPhotos = { photos: [] };
      mockNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?rover=curiosity&sol=500')
        .expect(200);

      expect(mockNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        page: 1,
        sol: 500,
        earth_date: undefined,
        camera: undefined
      });
    });

    it('should accept earth_date parameter', async () => {
      const mockPhotos = { photos: [] };
      mockNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?rover=curiosity&earth_date=2025-08-15')
        .expect(200);

      expect(mockNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        page: 1,
        sol: undefined,
        earth_date: '2025-08-15',
        camera: undefined
      });
    });

    it('should accept camera parameter', async () => {
      const mockPhotos = { photos: [] };
      mockNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?rover=curiosity&camera=FHAZ')
        .expect(200);

      expect(mockNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        page: 1,
        sol: undefined,
        earth_date: undefined,
        camera: 'FHAZ'
      });
    });

    it('should accept page parameter', async () => {
      const mockPhotos = { photos: [] };
      mockNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?rover=curiosity&page=2')
        .expect(200);

      expect(mockNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        page: 2,
        sol: undefined,
        earth_date: undefined,
        camera: undefined
      });
    });

    it('should validate rover parameter', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/photos?rover=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid rover name');
    });

    it('should validate sol parameter', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/photos?rover=curiosity&sol=-1')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Sol must be a non-negative number');
    });

    it('should validate earth_date format', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/photos?rover=curiosity&earth_date=invalid-date')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid earth_date format');
    });

    it('should handle NASA service errors', async () => {
      mockNasaService.getMarsRoverPhotos.mockRejectedValue(
        new Error('NASA API Error')
      );

      const response = await request(app)
        .get('/api/v1/mars-rovers/photos?rover=curiosity')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

  });
});