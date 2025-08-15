import app from './app';
import { getVersionString } from './utils/version';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 NASA Space Explorer Backend ${getVersionString()}`);
  logger.info(`🌍 Server running on port ${PORT}`);
  logger.info(`📡 Environment: ${NODE_ENV}`);
  logger.info(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.warn('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.warn('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });
});

export default server;