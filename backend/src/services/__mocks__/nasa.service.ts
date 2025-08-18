// Mock NASA Service for testing
export const nasaService = {
  // APOD methods
  getAPOD: jest.fn(),
  getAPODRandom: jest.fn(),
  
  // Mars Rover methods  
  getMarsRoverPhotos: jest.fn(),
  getMarsRoverManifest: jest.fn(),
  getRoverInfo: jest.fn(),
  getAllRovers: jest.fn(),
  
  // NEO methods
  getNEOFeed: jest.fn(),
  getNEOById: jest.fn(),
  getNEOBrowse: jest.fn(),
  getNEOStats: jest.fn(),
  
  // EPIC methods
  getEPICImages: jest.fn(),
  getEPICImageMetadata: jest.fn(),
  getEPICAvailableDates: jest.fn(),
  
  // Utility methods
  healthCheck: jest.fn(),
  validateApiKey: jest.fn()
};

// Mock data for consistent testing
export const mockData = {
  apod: {
    date: '2025-08-18',
    title: 'Test Astronomy Picture',
    explanation: 'A test image for testing purposes',
    url: 'https://example.com/test-image.jpg',
    media_type: 'image'
  },
  
  neoFeed: {
    links: {},
    element_count: 2,
    near_earth_objects: {
      '2025-08-18': [
        {
          id: '54016849',
          name: '(2020 BZ12)',
          estimated_diameter: {
            kilometers: {
              estimated_diameter_min: 0.1,
              estimated_diameter_max: 0.3
            }
          },
          is_potentially_hazardous_asteroid: false,
          close_approach_data: [
            {
              close_approach_date: '2025-08-18',
              relative_velocity: {
                kilometers_per_hour: '25000'
              },
              miss_distance: {
                kilometers: '1000000'
              }
            }
          ]
        }
      ]
    }
  },
  
  marsRoverPhotos: {
    photos: [
      {
        id: 12345,
        sol: 1000,
        camera: {
          id: 20,
          name: 'FHAZ',
          rover_id: 5,
          full_name: 'Front Hazard Avoidance Camera'
        },
        img_src: 'https://example.com/test-rover-photo.jpg',
        earth_date: '2025-08-18',
        rover: {
          id: 5,
          name: 'Curiosity',
          landing_date: '2012-08-06',
          launch_date: '2011-11-26',
          status: 'active'
        }
      }
    ]
  },
  
  epicImages: {
    images: [
      {
        identifier: 'test_epic_image_001',
        caption: 'Test EPIC image',
        image: 'epic_1b_20250818000000',
        date: '2025-08-18 00:00:00'
      }
    ]
  }
};

// Setup default mock implementations
nasaService.getAPOD.mockResolvedValue(mockData.apod);
nasaService.getNEOFeed.mockResolvedValue(mockData.neoFeed);
nasaService.getMarsRoverPhotos.mockResolvedValue(mockData.marsRoverPhotos);
nasaService.getEPICImages.mockResolvedValue(mockData.epicImages);
nasaService.healthCheck.mockResolvedValue(true);
nasaService.validateApiKey.mockResolvedValue(true);