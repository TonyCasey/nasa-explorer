import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { getVersionString } from './utils/version';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
// import { requestLogger } from './middleware/requestLogger';
import { cacheMiddleware } from './middleware/cache';
import simpleRoutes from './routes/simple';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - allow multiple origins for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://frontend.vercel.app',
  'https://nasa-space-explorer-frontend.vercel.app'
];

// Add Vercel preview URLs pattern
const vercelPreviewPattern = /^https:\/\/frontend-[a-z0-9]+-tonys-projects-[a-z0-9]+\.vercel\.app$/;

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins or Vercel preview pattern
    if (allowedOrigins.indexOf(origin) !== -1 || vercelPreviewPattern.test(origin)) {
      callback(null, origin); // Return the actual origin
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      // In production, be more permissive for now to avoid blocking
      if (NODE_ENV === 'production') {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
// app.use(requestLogger);

// Temporarily disable middleware for debugging
// app.use('/api', rateLimiter);
// app.use('/api', cacheMiddleware);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'NASA Space Explorer Backend',
    version: getVersionString(),
    status: 'Running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api/v1',
      apod: '/api/v1/apod',
      marsRovers: '/api/v1/mars-rovers',
      neo: '/api/v1/neo',
      epic: '/api/v1/epic'
    },
    documentation: 'https://github.com/yourusername/nasa-space-explorer'
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    version: getVersionString(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    memory: process.memoryUsage(),
  });
});

// Simple test route first
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// API routes - using simple routes for now
console.log('About to mount simple API routes');
app.use('/api/v1', simpleRoutes);
console.log('Simple API routes mounted successfully');

// 404 handler - removed wildcard pattern to fix path-to-regexp error
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 NASA Space Explorer Backend ${getVersionString()}`);
  console.log(`🌍 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🔗 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;