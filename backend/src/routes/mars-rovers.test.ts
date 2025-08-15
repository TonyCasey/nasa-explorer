import request from 'supertest';
import express from 'express';
import marsRoversRouter from './mars-rovers';
import * as nasaService from '../services/nasa.service';

// Mock the NASA service
jest.mock('../services/nasa.service');
const mockedNasaService = nasaService as jest.Mocked<typeof nasaService>;

describe('Mars Rovers Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/mars-rovers', marsRoversRouter);
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

      mockedNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      const response = await request(app)
        .get('/api/v1/mars-rovers/photos')
        .expect(200);

      expect(response.body).toEqual(mockPhotos);
      expect(mockedNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        sol: 1000,
      });
    });

    it('should accept custom rover parameter', async () => {
      const mockPhotos = { photos: [] };
      mockedNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?rover=perseverance')
        .expect(200);

      expect(mockedNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'perseverance',
        sol: 1000,
      });
    });

    it('should accept sol parameter', async () => {
      const mockPhotos = { photos: [] };
      mockedNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?sol=500')
        .expect(200);

      expect(mockedNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        sol: 500,
      });
    });

    it('should accept earth_date parameter', async () => {
      const mockPhotos = { photos: [] };
      mockedNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?earth_date=2025-08-15')
        .expect(200);

      expect(mockedNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        earth_date: '2025-08-15',
      });
    });

    it('should accept camera parameter', async () => {
      const mockPhotos = { photos: [] };
      mockedNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?camera=NAVCAM')
        .expect(200);

      expect(mockedNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        sol: 1000,
        camera: 'NAVCAM',
      });
    });

    it('should accept page parameter', async () => {
      const mockPhotos = { photos: [] };
      mockedNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      await request(app)
        .get('/api/v1/mars-rovers/photos?page=2')
        .expect(200);

      expect(mockedNasaService.getMarsRoverPhotos).toHaveBeenCalledWith({
        rover: 'curiosity',
        sol: 1000,
        page: 2,
      });
    });

    it('should validate rover parameter', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/photos?rover=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid rover');
    });

    it('should validate sol parameter', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/photos?sol=-1')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Sol must be a positive number');
    });

    it('should validate earth_date format', async () => {
      const response = await request(app)
        .get('/api/v1/mars-rovers/photos?earth_date=invalid-date')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid earth_date format');
    });

    it('should handle NASA service errors', async () => {
      mockedNasaService.getMarsRoverPhotos.mockRejectedValue(
        new Error('NASA API Error')
      );

      const response = await request(app)
        .get('/api/v1/mars-rovers/photos')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Failed to fetch Mars rover photos');
    });

    it('should include cache headers', async () => {
      const mockPhotos = { photos: [] };
      mockedNasaService.getMarsRoverPhotos.mockResolvedValue(mockPhotos);

      const response = await request(app)
        .get('/api/v1/mars-rovers/photos')
        .expect(200);

      expect(response.headers['cache-control']).toBeDefined();
    });
  });
});