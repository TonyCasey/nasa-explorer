import axios from 'axios';

// Mock axios before importing service
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Set up mock before importing the service
const mockClient = {
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};
mockedAxios.create.mockReturnValue(mockClient as any);

// Now import the service
import { NASAService } from './nasa.service';

describe('NASA Service', () => {
  let nasaService: NASAService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.get.mockClear();
    
    // Create fresh instance for each test
    nasaService = new NASAService();
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

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getAPOD();

      expect(mockClient.get).toHaveBeenCalledWith('/planetary/apod', {
        params: {},
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

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getAPOD('2025-08-14');

      expect(mockClient.get).toHaveBeenCalledWith('/planetary/apod', {
        params: {
          date: '2025-08-14',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle axios errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(nasaService.getAPOD()).rejects.toThrow('Network Error');
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

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getMarsRoverPhotos({ rover: 'curiosity' });

      expect(mockClient.get).toHaveBeenCalledWith('/mars-photos/api/v1/rovers/curiosity/photos', {
        params: {
          page: 1,
          sol: 1000,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should accept custom parameters', async () => {
      const mockResponse = { data: { photos: [] } };
      mockClient.get.mockResolvedValue(mockResponse);

      const params = {
        rover: 'perseverance',
        sol: 500,
        camera: 'NAVCAM',
        page: 2,
      };

      await nasaService.getMarsRoverPhotos(params);

      expect(mockClient.get).toHaveBeenCalledWith('/mars-photos/api/v1/rovers/perseverance/photos', {
        params: {
          page: 2,
          sol: 500,
          camera: 'NAVCAM',
        },
      });
    });
  });

  describe('getNEOFeed', () => {
    it('should fetch NEO feed data', async () => {
      const mockResponse = {
        data: {
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
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getNEOFeed('2025-08-15', '2025-08-16');

      expect(mockClient.get).toHaveBeenCalledWith('/neo/rest/v1/feed', {
        params: {
          start_date: '2025-08-15',
          end_date: '2025-08-16',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getEPICImages', () => {
    it('should fetch EPIC imagery', async () => {
      const mockResponse = {
        data: [
          {
            identifier: '20150418003633',
            caption: 'This image was taken by NASA\'s EPIC camera onboard the NOAA DSCOVR spacecraft',
            image: 'epic_1b_20150418003633',
            version: '02',
            centroid_coordinates: {
              lat: 1.318806,
              lon: -179.516361
            },
            dscovr_j2000_position: {
              x: -1283061.484817,
              y: -669893.844662,
              z: -130240.83624
            },
            lunar_j2000_position: {
              x: -302615.118924,
              y: -243353.507172,
              z: -60801.49173
            },
            sun_j2000_position: {
              x: -147670074.386928,
              y: -28992996.177839,
              z: -12571028.245309
            },
            attitude_quaternions: {
              q0: -0.154852,
              q1: 0.831098,
              q2: -0.015019,
              q3: 0.533603
            },
            date: '2015-04-18 00:36:33',
            coords: {
              centroid_coordinates: {
                lat: 1.318806,
                lon: -179.516361
              },
              dscovr_j2000_position: {
                x: -1283061.484817,
                y: -669893.844662,
                z: -130240.83624
              },
              lunar_j2000_position: {
                x: -302615.118924,
                y: -243353.507172,
                z: -60801.49173
              },
              sun_j2000_position: {
                x: -147670074.386928,
                y: -28992996.177839,
                z: -12571028.245309
              },
              attitude_quaternions: {
                q0: -0.154852,
                q1: 0.831098,
                q2: -0.015019,
                q3: 0.533603
              }
            }
          }
        ]
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await nasaService.getEPICImages();

      expect(mockClient.get).toHaveBeenCalledWith('/EPIC/api/natural');
      expect(result).toEqual(mockResponse.data);
    });
  });
});