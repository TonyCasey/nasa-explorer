import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

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

    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const message =
      error.response?.data || error.message || 'An error occurred';

    console.error(
      `❌ API Error: ${error.response?.status || 'Unknown'} ${error.config?.url}`,
      message
    );

    // Handle specific error cases
    if (error.response?.status === 429) {
      console.warn('⚠️ Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 500) {
      console.error('🔥 Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout. Please check your connection.');
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      originalError: error,
    });
  }
);

export default api;
