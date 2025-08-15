import NASAService from './nasa.service';
import api from './api';

// Mock the api module
jest.mock('./api');
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

      mockedApi.get.mockResolvedValue({ data: { success: true, data: mockAPOD } });

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

      mockedApi.get.mockResolvedValue({ data: { success: true, data: mockAPOD } });

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
            camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
            img_src: 'https://mars.nasa.gov/test.jpg',
            earth_date: '2025-08-15',
            rover: { name: 'Curiosity', status: 'active' },
          },
        ],
      };

      mockedApi.get.mockResolvedValue({ data: { success: true, data: mockPhotos } });

      const result = await NASAService.getMarsRoverPhotos({ rover: 'curiosity' });
      
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
      mockedApi.get.mockResolvedValue({ data: { success: true, data: mockPhotos } });

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

      mockedApi.get.mockResolvedValue({ data: { success: true, data: mockNEOs } });

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

      mockedApi.get.mockResolvedValue({ data: { success: true, data: mockNEOs } });

      const result = await NASAService.getNEOFeed({ startDate: '2025-08-10', endDate: '2025-08-15' });
      
      expect(mockedApi.get).toHaveBeenCalledWith('/neo/feed', {
        params: {
          start_date: '2025-08-10',
          end_date: '2025-08-15',
        },
      });
      expect(result).toEqual(mockNEOs);
    });
  });

  // Note: getEPIC method not yet implemented in service
  // describe('getEPIC', () => {
  //   it('fetches EPIC imagery', async () => {
  //     const mockEPIC = [
  //       {
  //         identifier: '20250815001234',
  //         caption: 'Earth from space',
  //         image: 'epic_1b_20250815001234',
  //         date: '2025-08-15 00:12:34',
  //       },
  //     ];

  //     mockedApi.get.mockResolvedValue({ data: mockEPIC });

  //     const result = await NASAService.getEPIC();
      
  //     expect(mockedApi.get).toHaveBeenCalledWith('/epic');
  //     expect(result).toEqual(mockEPIC);
  //   });
  // });
});