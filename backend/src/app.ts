// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { getVersionString } from './utils/version';
import logger, { logRequest } from './utils/logger';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Request logging middleware
app.use(logRequest);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration - allow both possible frontend ports
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple health check
app.get('/health', (req, res) => {
  logger.debug('Health check requested');
  res.json({
    status: 'OK',
    version: getVersionString(),
    timestamp: new Date().toISOString(),
  });
});

// Register API routes
app.use('/api/v1', apiRoutes);

// Error Handler (must be last)
app.use(errorHandler);

export default app;