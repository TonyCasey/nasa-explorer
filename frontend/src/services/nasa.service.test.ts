import NASAService from './nasa.service';
import api from './api';
import logger from '../utils/logger';

// Mock the api module and logger
jest.mock('./api');
jest.mock('../utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('NASAService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAPOD', () => {
    it('fetches APOD without date', async () => {
      const mockAPOD = {
        date: '2025-08-15',
        title: 'Test APOD',
        url: 'https://test.com/image.jpg',
        explanation: 'Test explanation',
        media_type: 'image',
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockAPOD },
      });

      const result = await NASAService.getAPOD();

      expect(mockedApi.get).toHaveBeenCalledWith('/apod', {
        params: {},
      });
      expect(result).toEqual(mockAPOD);
    });

    it('fetches APOD with specific date', async () => {
      const mockAPOD = {
        date: '2025-08-14',
        title: 'Test APOD for Date',
        url: 'https://test.com/image2.jpg',
        explanation: 'Test explanation',
        media_type: 'image',
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockAPOD },
      });

      const result = await NASAService.getAPOD('2025-08-14');

      expect(mockedApi.get).toHaveBeenCalledWith('/apod', {
        params: { date: '2025-08-14' },
      });
      expect(result).toEqual(mockAPOD);
    });

    it('handles API errors', async () => {
      mockedApi.get.mockRejectedValue(new Error('API Error'));

      await expect(NASAService.getAPOD()).rejects.toThrow('API Error');
    });
  });

  describe('getMarsRoverPhotos', () => {
    it('fetches Mars rover photos with default params', async () => {
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
            rover: { name: 'Curiosity', status: 'active' },
          },
        ],
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockPhotos },
      });

      const result = await NASAService.getMarsRoverPhotos({
        rover: 'curiosity',
      });

      expect(mockedApi.get).toHaveBeenCalledWith('/mars-rovers/photos', {
        params: {
          rover: 'curiosity',
          sol: undefined,
          earth_date: undefined,
          camera: undefined,
          page: 1,
        },
      });
      expect(result).toEqual(mockPhotos);
    });

    it('fetches Mars rover photos with custom params', async () => {
      const mockPhotos = { photos: [] };
      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockPhotos },
      });

      const params = {
        rover: 'perseverance',
        sol: 500,
        camera: 'NAVCAM',
        page: 2,
      };

      await NASAService.getMarsRoverPhotos(params);

      expect(mockedApi.get).toHaveBeenCalledWith('/mars-rovers/photos', {
        params: {
          rover: 'perseverance',
          sol: 500,
          earth_date: undefined,
          camera: 'NAVCAM',
          page: 2,
        },
      });
    });
  });

  describe('getNEOFeed', () => {
    it('fetches NEO feed with default date range', async () => {
      const mockNEOs = {
        element_count: 5,
        near_earth_objects: {
          '2025-08-15': [
            {
              id: '1',
              name: 'Test NEO',
              is_potentially_hazardous_asteroid: false,
              close_approach_data: [],
            },
          ],
        },
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockNEOs },
      });

      const result = await NASAService.getNEOFeed();

      expect(mockedApi.get).toHaveBeenCalledWith('/neo/feed', {
        params: {
          start_date: undefined,
          end_date: undefined,
        },
      });
      expect(result).toEqual(mockNEOs);
    });

    it('fetches NEO feed with custom date range', async () => {
      const mockNEOs = {
        element_count: 3,
        near_earth_objects: {},
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockNEOs },
      });

      const result = await NASAService.getNEOFeed({
        startDate: '2025-08-10',
        endDate: '2025-08-15',
      });

      expect(mockedApi.get).toHaveBeenCalledWith('/neo/feed', {
        params: {
          start_date: '2025-08-10',
          end_date: '2025-08-15',
        },
      });
      expect(result).toEqual(mockNEOs);
    });
  });

  describe('getAPODRange', () => {
    it('fetches multiple APOD images for date range', async () => {
      const mockAPODRange = [
        {
          date: '2025-08-14',
          title: 'Test APOD 1',
          url: 'https://test.com/image1.jpg',
          explanation: 'Test explanation 1',
          media_type: 'image',
        },
        {
          date: '2025-08-15',
          title: 'Test APOD 2',
          url: 'https://test.com/image2.jpg',
          explanation: 'Test explanation 2',
          media_type: 'image',
        },
      ];

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockAPODRange },
      });

      const result = await NASAService.getAPODRange('2025-08-14', '2025-08-15');

      expect(mockedApi.get).toHaveBeenCalledWith('/apod/range', {
        params: { start_date: '2025-08-14', end_date: '2025-08-15' },
      });
      expect(result).toEqual(mockAPODRange);
      expect(logger.debug).toHaveBeenCalledWith('Fetching APOD range data', {
        startDate: '2025-08-14',
        endDate: '2025-08-15',
      });
    });

    it('handles empty APOD range response', async () => {
      mockedApi.get.mockResolvedValue({ data: { success: true, data: [] } });

      const result = await NASAService.getAPODRange('2025-08-14', '2025-08-15');

      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        'APOD range data fetched successfully',
        {
          startDate: '2025-08-14',
          endDate: '2025-08-15',
          count: 0,
        }
      );
    });
  });

  describe('getNEOById', () => {
    it('fetches NEO by ID', async () => {
      const mockNEO = {
        id: '54016',
        name: '(2020 BZ12)',
        is_potentially_hazardous_asteroid: false,
        absolute_magnitude_h: 22.1,
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockNEO },
      });

      const result = await NASAService.getNEOById('54016');

      expect(mockedApi.get).toHaveBeenCalledWith('/neo/54016');
      expect(result).toEqual(mockNEO);
    });
  });

  describe('getEPICImages', () => {
    it('fetches EPIC images for today', async () => {
      const mockEPIC = [
        {
          identifier: 'epic_1b_20250815001234',
          caption: 'Earth from space',
          image: 'epic_1b_20250815001234',
          version: '03',
          date: '2025-08-15',
        },
      ];

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockEPIC },
      });

      const result = await NASAService.getEPICImages();

      expect(mockedApi.get).toHaveBeenCalledWith('/epic', { params: {} });
      expect(result).toEqual(mockEPIC);
    });

    it('fetches EPIC images for specific date', async () => {
      const mockEPIC = [];
      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockEPIC },
      });

      const result = await NASAService.getEPICImages('2025-08-15');

      expect(mockedApi.get).toHaveBeenCalledWith('/epic', {
        params: { date: '2025-08-15' },
      });
      expect(result).toEqual(mockEPIC);
    });
  });

  describe('getRoverInfo', () => {
    it('fetches rover information', async () => {
      const mockRoverInfo = {
        name: 'Curiosity',
        status: 'active',
        landing_date: '2012-08-06',
        max_sol: 3000,
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockRoverInfo },
      });

      const result = await NASAService.getRoverInfo('curiosity');

      expect(mockedApi.get).toHaveBeenCalledWith('/mars-rovers/curiosity');
      expect(result).toEqual(mockRoverInfo);
    });
  });

  describe('healthCheck', () => {
    it('fetches health check status', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2025-08-15T12:00:00Z',
      };

      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockHealth },
      });

      const result = await NASAService.healthCheck();

      expect(mockedApi.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockHealth);
    });
  });

  describe('Error handling', () => {
    it('propagates API errors for APOD', async () => {
      const apiError = new Error('Network timeout');
      mockedApi.get.mockRejectedValue(apiError);

      await expect(NASAService.getAPOD()).rejects.toThrow('Network timeout');
    });

    it('propagates API errors for Mars rover photos', async () => {
      const apiError = new Error('Server error');
      mockedApi.get.mockRejectedValue(apiError);

      await expect(
        NASAService.getMarsRoverPhotos({ rover: 'curiosity' })
      ).rejects.toThrow('Server error');
    });

    it('propagates API errors for NEO feed', async () => {
      const apiError = new Error('Rate limit exceeded');
      mockedApi.get.mockRejectedValue(apiError);

      await expect(NASAService.getNEOFeed()).rejects.toThrow(
        'Rate limit exceeded'
      );
    });
  });

  describe('Logging behavior', () => {
    it('logs successful APOD requests', async () => {
      const mockAPOD = { title: 'Test', date: '2025-08-15' };
      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockAPOD },
      });

      await NASAService.getAPOD('2025-08-15');

      expect(logger.debug).toHaveBeenCalledWith('Fetching APOD data', {
        date: '2025-08-15',
      });
      expect(logger.info).toHaveBeenCalledWith(
        'APOD data fetched successfully',
        {
          date: '2025-08-15',
          hasData: true,
        }
      );
    });

    it('logs successful Mars rover requests', async () => {
      const mockPhotos = { photos: [] };
      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockPhotos },
      });

      const params = { rover: 'curiosity', sol: 1000 };
      await NASAService.getMarsRoverPhotos(params);

      expect(logger.debug).toHaveBeenCalledWith(
        'Fetching Mars rover photos',
        params
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Mars rover photos fetched successfully',
        {
          rover: 'curiosity',
          photoCount: 0,
        }
      );
    });

    it('logs successful NEO feed requests', async () => {
      const mockNEOs = { element_count: 5, near_earth_objects: {} };
      mockedApi.get.mockResolvedValue({
        data: { success: true, data: mockNEOs },
      });

      await NASAService.getNEOFeed({
        startDate: '2025-08-15',
        endDate: '2025-08-15',
      });

      expect(logger.debug).toHaveBeenCalledWith('Fetching NEO feed data', {
        startDate: '2025-08-15',
        endDate: '2025-08-15',
      });
      expect(logger.info).toHaveBeenCalledWith(
        'NEO feed data fetched successfully',
        {
          startDate: '2025-08-15',
          endDate: '2025-08-15',
          objectCount: 5,
        }
      );
    });
  });
});
