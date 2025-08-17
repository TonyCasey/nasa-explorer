import { nasaService } from './nasa.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock logger
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('NASA Service - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: {} });
  });

  it('should make API request to APOD endpoint', async () => {
    const mockResponse = {
      data: {
        title: 'Test Image',
        explanation: 'Test explanation',
        url: 'https://example.com/image.jpg',
        date: '2025-08-15',
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await nasaService.getAPOD('2025-08-15');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/planetary/apod'),
      expect.objectContaining({
        params: expect.objectContaining({
          date: '2025-08-15',
        }),
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle APOD API errors', async () => {
    const error = new Error('API Error');
    mockedAxios.get.mockRejectedValue(error);

    await expect(nasaService.getAPOD()).rejects.toThrow('API Error');
  });

  it('should make request to Mars Rover Photos endpoint', async () => {
    const mockResponse = {
      data: {
        photos: [
          {
            id: 1,
            img_src: 'https://example.com/mars1.jpg',
            earth_date: '2025-08-15',
          },
        ],
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await nasaService.getMarsRoverPhotos('curiosity', 1000);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/mars-photos/api/v1/rovers/curiosity'),
      expect.objectContaining({
        params: expect.objectContaining({
          sol: 1000,
        }),
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should make request to NEO Feed endpoint', async () => {
    const mockResponse = {
      data: {
        near_earth_objects: {
          '2025-08-15': [],
        },
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await nasaService.getNEOFeed('2025-08-15', '2025-08-16');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/neo/rest/v1/feed'),
      expect.objectContaining({
        params: expect.objectContaining({
          start_date: '2025-08-15',
          end_date: '2025-08-16',
        }),
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should make request to EPIC endpoint', async () => {
    const mockResponse = {
      data: [
        {
          identifier: '20150418003633',
          caption: 'Test caption',
          image: 'epic_1b_20150418003633',
          date: '2015-04-18 00:36:33',
        },
      ],
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await nasaService.getEPICImages('2025-08-15');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/EPIC/api/natural/date/2025-08-15')
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle network errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(nasaService.getAPOD()).rejects.toThrow('Network Error');
    await expect(nasaService.getMarsRoverPhotos('curiosity')).rejects.toThrow(
      'Network Error'
    );
    await expect(nasaService.getNEOFeed()).rejects.toThrow('Network Error');
    await expect(nasaService.getEPICImages()).rejects.toThrow('Network Error');
  });

  it('should use correct base URLs', async () => {
    await nasaService.getAPOD();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('api.nasa.gov'),
      expect.any(Object)
    );
  });

  it('should include API key in requests', async () => {
    await nasaService.getAPOD();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          api_key: expect.any(String),
        }),
      })
    );
  });
});
