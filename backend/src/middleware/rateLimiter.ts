import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  
  // Clean up expired entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
  
  if (!store[clientId]) {
    store[clientId] = {
      count: 1,
      resetTime: now + windowMs,
    };
  } else if (store[clientId].resetTime < now) {
    store[clientId] = {
      count: 1,
      resetTime: now + windowMs,
    };
  } else {
    store[clientId].count++;
  }
  
  const current = store[clientId];
  
  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - current.count).toString(),
    'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
  });
  
  if (current.count > maxRequests) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((current.resetTime - now) / 1000),
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  next();
};