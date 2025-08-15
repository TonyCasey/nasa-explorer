import {
  APODResponse,
  MarsRoverPhoto,
  NEOObject,
  EPICImage,
  Camera,
  Rover,
  CloseApproachData,
  EstimatedDiameter,
  MediaType,
  RoverStatus,
} from './nasa.types';

describe('NASA Types', () => {
  describe('MediaType', () => {
    test('accepts valid media types', () => {
      const imageType: MediaType = 'image';
      const videoType: MediaType = 'video';
      
      expect(imageType).toBe('image');
      expect(videoType).toBe('video');
    });
  });

  describe('RoverStatus', () => {
    test('accepts valid rover statuses', () => {
      const activeStatus: RoverStatus = 'active';
      const completeStatus: RoverStatus = 'complete';
      
      expect(activeStatus).toBe('active');
      expect(completeStatus).toBe('complete');
    });
  });

  describe('APODResponse', () => {
    test('creates valid APOD response object', () => {
      const apod: APODResponse = {
        title: 'Test Space Image',
        date: '2025-08-15',
        url: 'https://example.com/image.jpg',
        explanation: 'A beautiful space image',
        media_type: 'image',
        hdurl: 'https://example.com/image-hd.jpg',
        copyright: 'NASA',
        service_version: 'v1',
      };

      expect(apod.title).toBe('Test Space Image');
      expect(apod.media_type).toBe('image');
      expect(apod.date).toBe('2025-08-15');
    });

    test('creates APOD with minimal required fields', () => {
      const apod: APODResponse = {
        title: 'Minimal APOD',
        date: '2025-08-15',
        url: 'https://example.com/image.jpg',
        explanation: 'Minimal explanation',
        media_type: 'image',
      };

      expect(apod.title).toBe('Minimal APOD');
      expect(apod.hdurl).toBeUndefined();
      expect(apod.copyright).toBeUndefined();
    });

    test('creates video APOD', () => {
      const videoApod: APODResponse = {
        title: 'Video APOD',
        date: '2025-08-15',
        url: 'https://example.com/video.mp4',
        explanation: 'A space video',
        media_type: 'video',
        thumbnail_url: 'https://example.com/thumbnail.jpg',
      };

      expect(videoApod.media_type).toBe('video');
      expect(videoApod.thumbnail_url).toBe('https://example.com/thumbnail.jpg');
    });
  });

  describe('Camera', () => {
    test('creates valid camera object', () => {
      const camera: Camera = {
        id: 1,
        name: 'FHAZ',
        rover_id: 5,
        full_name: 'Front Hazard Avoidance Camera',
      };

      expect(camera.name).toBe('FHAZ');
      expect(camera.full_name).toBe('Front Hazard Avoidance Camera');
      expect(camera.id).toBe(1);
    });
  });

  describe('Rover', () => {
    test('creates valid rover object', () => {
      const rover: Rover = {
        id: 5,
        name: 'Curiosity',
        landing_date: '2012-08-06',
        launch_date: '2011-11-26',
        status: 'active',
        max_sol: 3000,
        max_date: '2025-08-15',
        total_photos: 500000,
      };

      expect(rover.name).toBe('Curiosity');
      expect(rover.status).toBe('active');
      expect(rover.total_photos).toBe(500000);
    });

    test('creates rover with minimal fields', () => {
      const rover: Rover = {
        id: 1,
        name: 'Test Rover',
        landing_date: '2012-08-06',
        launch_date: '2011-11-26',
        status: 'complete',
      };

      expect(rover.name).toBe('Test Rover');
      expect(rover.max_sol).toBeUndefined();
      expect(rover.total_photos).toBeUndefined();
    });
  });

  describe('MarsRoverPhoto', () => {
    test('creates valid Mars rover photo object', () => {
      const photo: MarsRoverPhoto = {
        id: 102693,
        sol: 1000,
        camera: {
          id: 20,
          name: 'FHAZ',
          rover_id: 5,
          full_name: 'Front Hazard Avoidance Camera',
        },
        img_src: 'https://mars.nasa.gov/rover-photo.jpg',
        earth_date: '2015-05-30',
        rover: {
          id: 5,
          name: 'Curiosity',
          landing_date: '2012-08-06',
          launch_date: '2011-11-26',
          status: 'active',
        },
      };

      expect(photo.id).toBe(102693);
      expect(photo.sol).toBe(1000);
      expect(photo.camera.name).toBe('FHAZ');
      expect(photo.rover.name).toBe('Curiosity');
      expect(photo.img_src).toMatch(/mars\.nasa\.gov/);
    });
  });

  describe('EstimatedDiameter', () => {
    test('creates valid estimated diameter object', () => {
      const diameter: EstimatedDiameter = {
        kilometers: {
          estimated_diameter_min: 0.1,
          estimated_diameter_max: 0.3,
        },
        meters: {
          estimated_diameter_min: 100,
          estimated_diameter_max: 300,
        },
        miles: {
          estimated_diameter_min: 0.06,
          estimated_diameter_max: 0.19,
        },
        feet: {
          estimated_diameter_min: 328,
          estimated_diameter_max: 984,
        },
      };

      expect(diameter.kilometers.estimated_diameter_min).toBe(0.1);
      expect(diameter.meters.estimated_diameter_max).toBe(300);
    });

    test('creates diameter with only kilometers', () => {
      const diameter: EstimatedDiameter = {
        kilometers: {
          estimated_diameter_min: 0.5,
          estimated_diameter_max: 1.2,
        },
      };

      expect(diameter.kilometers.estimated_diameter_min).toBe(0.5);
      expect(diameter.meters).toBeUndefined();
    });
  });

  describe('CloseApproachData', () => {
    test('creates valid close approach data', () => {
      const approach: CloseApproachData = {
        close_approach_date: '2025-08-15',
        close_approach_date_full: '2025-Aug-15 14:30',
        epoch_date_close_approach: 1723728600000,
        relative_velocity: {
          kilometers_per_second: '13.97',
          kilometers_per_hour: '50292.42',
          miles_per_hour: '31238.26',
        },
        miss_distance: {
          astronomical: '0.1234567890',
          lunar: '47.9839875510',
          kilometers: '18467173.123456789',
          miles: '11472895.987654321',
        },
        orbiting_body: 'Earth',
      };

      expect(approach.close_approach_date).toBe('2025-08-15');
      expect(approach.relative_velocity.kilometers_per_hour).toBe('50292.42');
      expect(approach.miss_distance.lunar).toBe('47.9839875510');
      expect(approach.orbiting_body).toBe('Earth');
    });

    test('creates approach with minimal fields', () => {
      const approach: CloseApproachData = {
        close_approach_date: '2025-08-15',
        relative_velocity: {
          kilometers_per_hour: '50000',
        },
        miss_distance: {
          kilometers: '1000000',
        },
      };

      expect(approach.close_approach_date).toBe('2025-08-15');
      expect(approach.orbiting_body).toBeUndefined();
    });
  });

  describe('NEOObject', () => {
    test('creates valid NEO object', () => {
      const neo: NEOObject = {
        id: '54016',
        neo_reference_id: '54016',
        name: '(2020 BZ12)',
        nasa_jpl_url: 'http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=54016',
        absolute_magnitude_h: 22.1,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.1020318156,
            estimated_diameter_max: 0.2282262240,
          },
        },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [
          {
            close_approach_date: '2025-08-15',
            relative_velocity: {
              kilometers_per_hour: '50292.42',
            },
            miss_distance: {
              kilometers: '18467173.123456789',
            },
          },
        ],
        is_sentry_object: false,
      };

      expect(neo.name).toBe('(2020 BZ12)');
      expect(neo.is_potentially_hazardous_asteroid).toBe(false);
      expect(neo.close_approach_data).toHaveLength(1);
      expect(neo.absolute_magnitude_h).toBe(22.1);
    });

    test('creates hazardous NEO', () => {
      const hazardousNeo: NEOObject = {
        id: '12345',
        neo_reference_id: '12345',
        name: 'Dangerous Asteroid',
        absolute_magnitude_h: 18.5,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: 0.5,
            estimated_diameter_max: 1.2,
          },
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [],
        is_sentry_object: true,
      };

      expect(hazardousNeo.is_potentially_hazardous_asteroid).toBe(true);
      expect(hazardousNeo.is_sentry_object).toBe(true);
    });
  });

  describe('EPICImage', () => {
    test('creates valid EPIC image object', () => {
      const epic: EPICImage = {
        identifier: 'epic_1b_20190630003633',
        caption: 'This image was taken by the EPIC camera aboard the NOAA DSCOVR spacecraft',
        image: 'epic_1b_20190630003633',
        version: '03',
        centroid_coordinates: {
          lat: 8.251907,
          lon: -157.019287,
        },
        dscovr_j2000_position: {
          x: -1283061.714257,
          y: -669893.681297,
          z: -130240.992469,
        },
        lunar_j2000_position: {
          x: 55505.410149,
          y: -347922.463937,
          z: -183751.111038,
        },
        sun_j2000_position: {
          x: -26452361.6617146,
          y: 132808592.7113895,
          z: 57569101.74108145,
        },
        attitude_quaternions: {
          q0: -0.208736,
          q1: -0.039044,
          q2: 0.653618,
          q3: 0.725362,
        },
        date: '2019-06-30 00:36:33',
        coords: {
          centroid_coordinates: {
            lat: 8.251907,
            lon: -157.019287,
          },
          dscovr_j2000_position: {
            x: -1283061.714257,
            y: -669893.681297,
            z: -130240.992469,
          },
        },
      };

      expect(epic.identifier).toBe('epic_1b_20190630003633');
      expect(epic.version).toBe('03');
      expect(epic.centroid_coordinates.lat).toBe(8.251907);
      expect(epic.date).toBe('2019-06-30 00:36:33');
    });

    test('creates EPIC with minimal fields', () => {
      const epic: EPICImage = {
        identifier: 'epic_minimal',
        caption: 'Minimal EPIC image',
        image: 'epic_minimal',
        version: '01',
        date: '2025-08-15 12:00:00',
      };

      expect(epic.identifier).toBe('epic_minimal');
      expect(epic.centroid_coordinates).toBeUndefined();
      expect(epic.attitude_quaternions).toBeUndefined();
    });
  });

  describe('Type guards and utility functions', () => {
    test('differentiates between image and video APOD', () => {
      const imageApod: APODResponse = {
        title: 'Image APOD',
        date: '2025-08-15',
        url: 'https://example.com/image.jpg',
        explanation: 'Image explanation',
        media_type: 'image',
      };

      const videoApod: APODResponse = {
        title: 'Video APOD',
        date: '2025-08-15',
        url: 'https://example.com/video.mp4',
        explanation: 'Video explanation',
        media_type: 'video',
      };

      expect(imageApod.media_type).toBe('image');
      expect(videoApod.media_type).toBe('video');
    });

    test('identifies hazardous vs safe asteroids', () => {
      const safeAsteroid: NEOObject = {
        id: '1',
        neo_reference_id: '1',
        name: 'Safe Asteroid',
        absolute_magnitude_h: 22,
        estimated_diameter: { kilometers: { estimated_diameter_min: 0.1, estimated_diameter_max: 0.2 } },
        is_potentially_hazardous_asteroid: false,
        close_approach_data: [],
      };

      const hazardousAsteroid: NEOObject = {
        id: '2',
        neo_reference_id: '2',
        name: 'Hazardous Asteroid',
        absolute_magnitude_h: 18,
        estimated_diameter: { kilometers: { estimated_diameter_min: 0.5, estimated_diameter_max: 1.0 } },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [],
      };

      expect(safeAsteroid.is_potentially_hazardous_asteroid).toBe(false);
      expect(hazardousAsteroid.is_potentially_hazardous_asteroid).toBe(true);
    });
  });
});