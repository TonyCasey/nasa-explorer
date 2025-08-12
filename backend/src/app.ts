import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { getVersionString } from './utils/version';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    version: getVersionString(),
    timestamp: new Date().toISOString(),
  });
});

// Simple API info
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'NASA Space Explorer API',
    version: getVersionString(),
    status: 'running',
  });
});

export default app;