import axios from 'axios';
import * as nasaService from './nasa.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NASA Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default axios mock
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  describe('getAPOD', () => {
    it('should fetch APOD data successfully', async () => {
      const mockResponse = {
        data: {
          date: '2025-08-15',
          title: 'Test APOD',
          url: 'https://apod.nasa.gov/apod/image/test.jpg',
          explanation: 'Test explanation',
          media_type: 'image',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getAPOD();

      expect(mockedAxios.get).toHaveBeenCalledWith('/planetary/apod', {
        params: { api_key: 'test_api_key' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch APOD data for specific date', async () => {
      const mockResponse = {
        data: {
          date: '2025-08-14',
          title: 'Test APOD for Date',
          url: 'https://apod.nasa.gov/apod/image/test2.jpg',
          explanation: 'Test explanation',
          media_type: 'image',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getAPOD('2025-08-14');

      expect(mockedAxios.get).toHaveBeenCalledWith('/planetary/apod', {
        params: {
          api_key: 'test_api_key',
          date: '2025-08-14',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle axios errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(nasaService.getAPOD()).rejects.toThrow('Network Error');
    });

    it('should handle NASA API errors', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: { message: 'Date out of range' } },
        },
      });

      await expect(nasaService.getAPOD('1990-01-01')).rejects.toThrow();
    });
  });

  describe('getMarsRoverPhotos', () => {
    it('should fetch Mars rover photos with default parameters', async () => {
      const mockResponse = {
        data: {
          photos: [
            {
              id: 1,
              sol: 1000,
              camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
              img_src: 'https://mars.nasa.gov/test.jpg',
              earth_date: '2025-08-15',
              rover: { name: 'Curiosity', status: 'active' },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getMarsRoverPhotos();

      expect(mockedAxios.get).toHaveBeenCalledWith('/mars-photos/api/v1/rovers/curiosity/photos', {
        params: {
          api_key: 'test_api_key',
          sol: 1000,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should accept custom parameters', async () => {
      const mockResponse = { data: { photos: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const params = {
        rover: 'perseverance',
        sol: 500,
        camera: 'NAVCAM',
        page: 2,
      };

      await nasaService.getMarsRoverPhotos(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/mars-photos/api/v1/rovers/perseverance/photos', {
        params: {
          api_key: 'test_api_key',
          sol: 500,
          camera: 'NAVCAM',
          page: 2,
        },
      });
    });

    it('should handle earth_date parameter', async () => {
      const mockResponse = { data: { photos: [] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const params = {
        rover: 'curiosity',
        earth_date: '2025-08-15',
      };

      await nasaService.getMarsRoverPhotos(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/mars-photos/api/v1/rovers/curiosity/photos', {
        params: {
          api_key: 'test_api_key',
          earth_date: '2025-08-15',
        },
      });
    });
  });

  describe('getNEOFeed', () => {
    it('should fetch NEO feed with date range', async () => {
      const mockResponse = {
        data: {
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
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getNEOFeed('2025-08-15', '2025-08-16');

      expect(mockedAxios.get).toHaveBeenCalledWith('/neo/rest/v1/feed', {
        params: {
          api_key: 'test_api_key',
          start_date: '2025-08-15',
          end_date: '2025-08-16',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getEPIC', () => {
    it('should fetch EPIC imagery', async () => {
      const mockResponse = {
        data: [
          {
            identifier: '20250815001234',
            caption: 'Earth from space',
            image: 'epic_1b_20250815001234',
            date: '2025-08-15 00:12:34',
          },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getEPIC();

      expect(mockedAxios.get).toHaveBeenCalledWith('/EPIC/api/natural', {
        params: { api_key: 'test_api_key' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});