import { Router } from 'express';
import { getVersionString } from '../utils/version';
import { getCacheStats, clearCache } from '../middleware/cache';
import apodRoutes from './apod';
import marsRoutes from './mars-rovers';
import neoRoutes from './neo';
import epicRoutes from './epic';

const router = Router();

// API information endpoint
router.get('/', (_req, res) => {
  res.json({
    name: 'NASA Space Explorer API',
    version: getVersionString(),
    description: 'Backend API for NASA Space Explorer application',
    timestamp: new Date().toISOString(),
    endpoints: {
      apod: '/apod - Astronomy Picture of the Day',
      marsRovers: '/mars-rovers - Mars Rover photos and data',
      neo: '/neo - Near Earth Objects tracking',
      epic: '/epic - Earth imagery from space',
      health: '/health - API health check',
      cache: '/cache - Cache management',
    },
    documentation: 'https://api.nasa.gov/',
  });
});

// Cache management endpoint
router.get('/cache/stats', (_req, res) => {
  res.json({
    cache: getCacheStats(),
    timestamp: new Date().toISOString(),
  });
});

router.delete('/cache', (req, res) => {
  const pattern = req.query.pattern as string;
  const cleared = clearCache(pattern);
  res.json({
    message: pattern 
      ? `Cleared ${cleared} cache entries matching: ${pattern}`
      : `Cleared all ${cleared} cache entries`,
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
router.use('/apod', apodRoutes);
router.use('/mars-rovers', marsRoutes);
router.use('/neo', neoRoutes);
router.use('/epic', epicRoutes);

export default router;