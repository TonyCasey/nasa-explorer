import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createError } from '../middleware/errorHandler';

export class NASAService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    
    if (this.apiKey === 'DEMO_KEY') {
      console.warn('⚠️ Using NASA DEMO_KEY - limited to 30 requests per hour');
    }

    this.client = axios.create({
      baseURL: process.env.NASA_API_BASE_URL || 'https://api.nasa.gov',
      timeout: 30000,
      params: {
        api_key: this.apiKey,
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🚀 NASA API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ NASA API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ NASA API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ NASA API Error: ${error.response?.status || 'Unknown'} ${error.config?.url}`);
        
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

  // Astronomy Picture of the Day
  async getAPOD(date?: string): Promise<any> {
    try {
      const params: any = {};
      if (date) {
        params.date = date;
      }

      const response = await this.client.get('/planetary/apod', { params });
      return response.data;
    } catch (error) {
      console.error('APOD API Error:', error);
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
      console.error('APOD Range API Error:', error);
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

      const response = await this.client.get(`/mars-photos/api/v1/rovers/${rover}/photos`, {
        params: queryParams,
      });
      
      return response.data;
    } catch (error) {
      console.error('Mars Rover Photos API Error:', error);
      throw error;
    }
  }

  async getRoverInfo(roverName: string): Promise<any> {
    try {
      const response = await this.client.get(`/mars-photos/api/v1/rovers/${roverName}`);
      return response.data;
    } catch (error) {
      console.error('Rover Info API Error:', error);
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

      const response = await this.client.get('/neo/rest/v1/feed', { params });
      return response.data;
    } catch (error) {
      console.error('NEO Feed API Error:', error);
      throw error;
    }
  }

  async getNEOById(neoId: string): Promise<any> {
    try {
      const response = await this.client.get(`/neo/rest/v1/neo/${neoId}`);
      return response.data;
    } catch (error) {
      console.error('NEO by ID API Error:', error);
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

      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('EPIC API Error:', error);
      throw error;
    }
  }

  async getEPICImageArchive(): Promise<any> {
    try {
      const response = await this.client.get('/EPIC/api/natural/available');
      return response.data;
    } catch (error) {
      console.error('EPIC Archive API Error:', error);
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