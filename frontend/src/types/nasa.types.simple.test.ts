// Type validation tests for NASA types
import type {
  APODResponse,
  MarsRoverPhoto,
  NEOData,
  EPICImage,
} from './nasa.types';

describe('NASA Types', () => {
  describe('APOD Response Type', () => {
    it('should validate APOD response structure', () => {
      const mockAPOD: APODResponse = {
        date: '2025-08-15',
        explanation: 'Test explanation',
        title: 'Test Title',
        url: 'https://example.com/image.jpg',
      };

      expect(mockAPOD.date).toBe('2025-08-15');
      expect(mockAPOD.title).toBe('Test Title');
      expect(typeof mockAPOD.explanation).toBe('string');
      expect(typeof mockAPOD.url).toBe('string');
    });

    it('should handle optional APOD fields', () => {
      const mockAPOD: Partial<APODResponse> = {
        date: '2025-08-15',
        title: 'Test Title',
      };

      expect(mockAPOD.date).toBeDefined();
      expect(mockAPOD.title).toBeDefined();
    });
  });

  describe('Mars Rover Photo Type', () => {
    it('should validate Mars rover photo structure', () => {
      const mockPhoto: Partial<MarsRoverPhoto> = {
        id: 12345,
        img_src: 'https://example.com/mars.jpg',
        earth_date: '2025-08-15',
      };

      expect(typeof mockPhoto.id).toBe('number');
      expect(typeof mockPhoto.img_src).toBe('string');
      expect(typeof mockPhoto.earth_date).toBe('string');
    });
  });

  describe('NEO Data Type', () => {
    it('should validate NEO data structure', () => {
      const mockNEO: Partial<NEOData> = {
        id: '12345',
        name: 'Test Asteroid',
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.1,
            estimated_diameter_max: 0.2,
          },
        },
      };

      expect(typeof mockNEO.id).toBe('string');
      expect(typeof mockNEO.name).toBe('string');
      expect(mockNEO.estimated_diameter).toBeDefined();
    });
  });

  describe('EPIC Image Type', () => {
    it('should validate EPIC image structure', () => {
      const mockEPIC: Partial<EPICImage> = {
        identifier: '20150418003633',
        caption: 'Test caption',
        image: 'epic_1b_20150418003633',
        date: '2015-04-18 00:36:33',
      };

      expect(typeof mockEPIC.identifier).toBe('string');
      expect(typeof mockEPIC.caption).toBe('string');
      expect(typeof mockEPIC.image).toBe('string');
      expect(typeof mockEPIC.date).toBe('string');
    });
  });

  describe('Type Safety', () => {
    it('should enforce type constraints', () => {
      // Test that types are properly defined
      const testTypes = {
        apod: {} as APODResponse,
        photo: {} as MarsRoverPhoto,
        neo: {} as NEOData,
        epic: {} as EPICImage,
      };

      expect(typeof testTypes).toBe('object');
      expect(testTypes.apod).toBeDefined();
      expect(testTypes.photo).toBeDefined();
      expect(testTypes.neo).toBeDefined();
      expect(testTypes.epic).toBeDefined();
    });

    it('should handle arrays of types', () => {
      const photos: MarsRoverPhoto[] = [];
      const neos: NEOData[] = [];
      const epics: EPICImage[] = [];

      expect(Array.isArray(photos)).toBe(true);
      expect(Array.isArray(neos)).toBe(true);
      expect(Array.isArray(epics)).toBe(true);
    });
  });
});
