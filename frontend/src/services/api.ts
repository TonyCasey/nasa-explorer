import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import logger, {
  logApiRequest,
  logApiResponse,
  logApiError,
} from '../utils/logger';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };

    logApiRequest(config.method?.toUpperCase() || 'GET', config.url || '');
    return config;
  },
  (error: AxiosError) => {
    logger.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    logApiResponse(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.status,
      response.data
    );
    return response;
  },
  (error: AxiosError) => {
    const message =
      error.response?.data || error.message || 'An error occurred';

    logApiError(
      error.config?.method?.toUpperCase() || 'GET',
      error.config?.url || '',
      error
    );

    // Handle specific error cases
    if (error.response?.status === 429) {
      logger.warn('⚠️ Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 500) {
      logger.error('🔥 Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      logger.error('⏱️ Request timeout. Please check your connection.');
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      originalError: error,
    });
  }
);

export default api;
