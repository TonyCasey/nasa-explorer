import api from './api';
import { APODResponse, MarsRoverPhoto, NEOObject } from '../types/nasa.types';
import logger from '../utils/logger';

export class NASAService {
  // Astronomy Picture of the Day
  static async getAPOD(date?: string): Promise<APODResponse> {
    logger.debug('Fetching APOD data', { date });
    const params = date ? { date } : {};
    const response = await api.get<{ success: boolean; data: APODResponse }>(
      '/apod',
      { params }
    );
    logger.info('APOD data fetched successfully', {
      date,
      hasData: !!response.data.data,
    });
    return response.data.data;
  }

  static async getAPODRange(
    startDate: string,
    endDate: string
  ): Promise<APODResponse[]> {
    logger.debug('Fetching APOD range data', { startDate, endDate });
    const response = await api.get<{ success: boolean; data: APODResponse[] }>(
      '/apod/range',
      {
        params: { start_date: startDate, end_date: endDate },
      }
    );
    logger.info('APOD range data fetched successfully', {
      startDate,
      endDate,
      count: response.data.data?.length || 0,
    });
    return response.data.data;
  }

  // Mars Rover Photos
  static async getMarsRoverPhotos(params: {
    rover: string;
    sol?: number;
    earth_date?: string;
    camera?: string;
    page?: number;
  }): Promise<{ photos: MarsRoverPhoto[] }> {
    logger.debug('Fetching Mars rover photos', params);
    const response = await api.get<{
      success: boolean;
      data: { photos: MarsRoverPhoto[] };
    }>('/mars-rovers/photos', {
      params: {
        rover: params.rover,
        sol: params.sol,
        earth_date: params.earth_date,
        camera: params.camera,
        page: params.page || 1,
      },
    });
    logger.info('Mars rover photos fetched successfully', {
      rover: params.rover,
      photoCount: response.data.data?.photos?.length || 0,
    });
    return response.data.data;
  }

  // eslint-disable-next-line prettier/prettier
  static async getRoverInfo(
    roverName: string
  ): Promise<Record<string, unknown>> {
    logger.debug('Fetching rover info', { roverName });
    // eslint-disable-next-line prettier/prettier
    const response = await api.get<{
      success: boolean;
      data: Record<string, unknown>;
    }>(`/mars-rovers/${roverName}`);
    logger.info('Rover info fetched successfully', {
      roverName,
      hasData: !!response.data.data,
    });
    return response.data.data;
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
    logger.debug('Fetching NEO feed data', {
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const response = await api.get<{
      success: boolean;
      data: {
        near_earth_objects: Record<string, NEOObject[]>;
        element_count: number;
      };
    }>('/neo/feed', {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
      },
    });
    logger.info('NEO feed data fetched successfully', {
      startDate: params.startDate,
      endDate: params.endDate,
      objectCount: response.data.data?.element_count || 0,
    });
    return response.data.data;
  }

  static async getNEOById(neoId: string): Promise<NEOObject> {
    const response = await api.get<{ success: boolean; data: NEOObject }>(
      `/neo/${neoId}`
    );
    return response.data.data;
  }

  // Earth Imagery (EPIC)
  // eslint-disable-next-line prettier/prettier
  static async getEPICImages(
    date?: string
  ): Promise<Record<string, unknown>[]> {
    const params = date ? { date } : {};
    // eslint-disable-next-line prettier/prettier
    const response = await api.get<{
      success: boolean;
      data: Record<string, unknown>[];
    }>('/epic', {
      params,
    });
    return response.data.data;
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get<{
      success: boolean;
      data: { status: string; timestamp: string };
    }>('/health');
    return response.data.data;
  }
}

export default NASAService;
