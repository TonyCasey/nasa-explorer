import api from './api';
import { APODResponse, MarsRoverPhoto, NEOObject } from '../types/nasa.types';

export class NASAService {
  // Astronomy Picture of the Day
  static async getAPOD(date?: string): Promise<APODResponse> {
    const params = date ? { date } : {};
    const response = await api.get<APODResponse>('/apod', { params });
    return response.data;
  }

  static async getAPODRange(
    startDate: string,
    endDate: string
  ): Promise<APODResponse[]> {
    const response = await api.get<APODResponse[]>('/apod', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  // Mars Rover Photos
  static async getMarsRoverPhotos(params: {
    rover: string;
    sol?: number;
    camera?: string;
    page?: number;
  }): Promise<{ photos: MarsRoverPhoto[] }> {
    const response = await api.get<{ photos: MarsRoverPhoto[] }>(
      '/mars-rovers/photos',
      {
        params: {
          rover: params.rover,
          sol: params.sol,
          camera: params.camera,
          page: params.page || 1,
        },
      }
    );
    return response.data;
  }

  static async getRoverInfo(roverName: string): Promise<any> {
    const response = await api.get(`/mars-rovers/${roverName}`);
    return response.data;
  }

  // Near Earth Objects
  static async getNEOFeed(
    params: {
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    near_earth_objects: Record<string, NEOObject[]>;
    element_count: number;
  }> {
    const response = await api.get('/neo/feed', {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
      },
    });
    return response.data;
  }

  static async getNEOById(neoId: string): Promise<NEOObject> {
    const response = await api.get<NEOObject>(`/neo/${neoId}`);
    return response.data;
  }

  // Earth Imagery (EPIC)
  static async getEPICImages(date?: string): Promise<any[]> {
    const params = date ? { date } : {};
    const response = await api.get('/epic', { params });
    return response.data;
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get('/health');
    return response.data;
  }
}

export default NASAService;
