import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class NASAService {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    
    if (this.apiKey === 'DEMO_KEY') {
      logger.warn('⚠️ Using NASA DEMO_KEY - limited to 30 requests per hour');
    } else {
      logger.info(`🔑 NASA API key configured (${this.apiKey.slice(0, 8)}...)`);
    }

    this.client = axios.create({
      baseURL: process.env.NASA_API_BASE_URL || 'https://api.nasa.gov',
      timeout: 10000, // Reduced timeout to 10 seconds
      params: {
        api_key: this.apiKey,
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`🚀 NASA API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('❌ NASA API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.debug(`✅ NASA API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error(`❌ NASA API Error: ${error.response?.status || 'Unknown'} ${error.config?.url}`);
        
        // Transform NASA API errors
        if (error.response?.status === 429) {
          throw createError('NASA API rate limit exceeded. Please try again later.', 429);
        } else if (error.response?.status === 403) {
          throw createError('Invalid NASA API key or unauthorized access.', 403);
        } else if (error.response?.status === 404) {
          throw createError('NASA API endpoint not found.', 404);
        } else if (error.response?.status >= 500) {
          throw createError('NASA API server error. Please try again later.', 502);
        } else if (error.code === 'ECONNABORTED') {
          throw createError('NASA API request timeout. Please try again.', 408);
        }
        
        throw createError(
          error.response?.data?.error_message || 
          error.message || 
          'NASA API request failed',
          error.response?.status || 500
        );
      }
    );
  }

  // Cache helper methods
  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.debug(`📦 Cache hit: ${key}`);
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(key); // Remove expired entry
      logger.debug(`🗑️ Cache expired: ${key}`);
    }
    
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    logger.debug(`💾 Cached: ${key}`);
  }

  // Fallback data when NASA API is unavailable
  private getFallbackAPOD(date?: string): any {
    const fallbackImages = [
      {
        date: date || new Date().toISOString().split('T')[0],
        title: "Eagle Nebula (Fallback Data)",
        explanation: "The Eagle Nebula, a stellar nursery located 7,000 light-years away in the constellation Serpens. This fallback data is displayed when the NASA API is unavailable.",
        url: "https://www.nasa.gov/sites/default/files/thumbnails/image/hubble_eagle_nebula.jpg",
        hdurl: "https://www.nasa.gov/sites/default/files/thumbnails/image/hubble_eagle_nebula.jpg",
        media_type: "image",
        service_version: "v1"
      }
    ];
    return fallbackImages[0];
  }

  // Astronomy Picture of the Day
  async getAPOD(date?: string): Promise<any> {
    try {
      const params: any = {};
      if (date) {
        params.date = date;
      }

      // Check cache first
      const cacheKey = this.getCacheKey('/planetary/apod', params);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      logger.info('APOD request received');
      const response = await this.client.get('/planetary/apod', { params });
      
      // Cache the response
      this.setCache(cacheKey, response.data);
      
      return response.data;
    } catch (error: any) {
      logger.error('❌ NASA API Error:', error.code || error.message);
      
      // Return fallback data when NASA API is unavailable
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        logger.warn('⚠️  NASA API unavailable, returning fallback data');
        return this.getFallbackAPOD(date);
      }
      
      throw error;
    }
  }

  async getAPODRange(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await this.client.get('/planetary/apod', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error) {
      logger.error('APOD Range API Error:', error);
      throw error;
    }
  }

  // Mars Rover Photos
  async getMarsRoverPhotos(params: {
    rover: string;
    sol?: number;
    earth_date?: string;
    camera?: string;
    page?: number;
  }): Promise<any> {
    try {
      const { rover, sol, earth_date, camera, page = 1 } = params;
      
      const queryParams: any = { page };
      
      if (sol !== undefined) {
        queryParams.sol = sol;
      } else if (earth_date) {
        queryParams.earth_date = earth_date;
      } else {
        // Default to latest sol if neither provided
        queryParams.sol = 1000;
      }
      
      if (camera) {
        queryParams.camera = camera;
      }

      // Check cache first
      const endpoint = `/mars-photos/api/v1/rovers/${rover}/photos`;
      const cacheKey = this.getCacheKey(endpoint, queryParams);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get(endpoint, {
        params: queryParams,
      });
      
      // Cache the response
      this.setCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      logger.error('Mars Rover Photos API Error:', error);
      throw error;
    }
  }

  async getRoverInfo(roverName: string): Promise<any> {
    try {
      // Check cache first
      const endpoint = `/mars-photos/api/v1/rovers/${roverName}`;
      const cacheKey = this.getCacheKey(endpoint);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get(endpoint);
      
      // Cache the response
      this.setCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      logger.error('Rover Info API Error:', error);
      throw error;
    }
  }

  // Near Earth Objects
  async getNEOFeed(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else {
        // Default to today if no dates provided
        const today = new Date().toISOString().split('T')[0];
        params.start_date = today;
        params.end_date = today;
      }

      // Check cache first
      const endpoint = '/neo/rest/v1/feed';
      const cacheKey = this.getCacheKey(endpoint, params);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get(endpoint, { params });
      
      // Cache the response
      this.setCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      logger.error('NEO Feed API Error:', error);
      throw error;
    }
  }

  async getNEOById(neoId: string): Promise<any> {
    try {
      // Check cache first
      const endpoint = `/neo/rest/v1/neo/${neoId}`;
      const cacheKey = this.getCacheKey(endpoint);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get(endpoint);
      
      // Cache the response
      this.setCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      logger.error('NEO by ID API Error:', error);
      throw error;
    }
  }

  // Earth Imagery (EPIC)
  async getEPICImages(date?: string): Promise<any> {
    try {
      let endpoint = '/EPIC/api/natural';
      if (date) {
        endpoint += `/date/${date}`;
      }

      // Check cache first
      const cacheKey = this.getCacheKey(endpoint);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get(endpoint);
      
      // Cache the response
      this.setCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      logger.error('EPIC API Error:', error);
      throw error;
    }
  }

  async getEPICImageArchive(): Promise<any> {
    try {
      // Check cache first
      const endpoint = '/EPIC/api/natural/available';
      const cacheKey = this.getCacheKey(endpoint);
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await this.client.get(endpoint);
      
      // Cache the response
      this.setCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      logger.error('EPIC Archive API Error:', error);
      throw error;
    }
  }

  // Utility method to check API key validity
  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.get('/planetary/apod');
      return true;
    } catch (error: any) {
      if (error.response?.status === 403) {
        return false;
      }
      return true; // Other errors don't necessarily mean invalid key
    }
  }
}

// Export singleton instance
export const nasaService = new NASAService();