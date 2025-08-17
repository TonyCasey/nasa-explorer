// Configuration file to centralize environment variables
export const config = {
  // Use local backend in development, production URL in production
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://nasa-server.tonycasey.dev/api/v1'
    : 'http://localhost:5000/api/v1',
  nasaApiKey: process.env.REACT_APP_NASA_API_KEY || '',
  nasaApiBaseUrl: process.env.REACT_APP_NASA_API_BASE_URL || 'https://api.nasa.gov',
  environment: process.env.NODE_ENV || 'development',
};

// Debug logging in development
if (config.environment === 'development') {
  console.log('🔧 Config loaded:', {
    apiUrl: config.apiUrl,
    nasaApiKey: config.nasaApiKey ? `${config.nasaApiKey.slice(0, 8)}...` : 'not set',
    nasaApiBaseUrl: config.nasaApiBaseUrl,
    environment: config.environment
  });
}

export default config;