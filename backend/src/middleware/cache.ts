import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  const cacheKey = `${req.originalUrl}${JSON.stringify(req.query)}`;
  const ttl = parseInt(process.env.CACHE_TTL || '900') * 1000; // 15 minutes default
  const now = Date.now();
  
  // Clean expired entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
      }
    });
  }
  
  // Check if we have cached data
  const cachedEntry = cache.get(cacheKey);
  if (cachedEntry && (now - cachedEntry.timestamp) < cachedEntry.ttl) {
    console.log(`💾 Cache HIT: ${req.originalUrl}`);
    res.set({
      'X-Cache': 'HIT',
      'X-Cache-Timestamp': new Date(cachedEntry.timestamp).toISOString(),
    });
    res.json(cachedEntry.data);
    return;
  }
  
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to cache the response
  res.json = function(data: any) {
    // Only cache successful responses
    if (res.statusCode === 200) {
      cache.set(cacheKey, {
        data,
        timestamp: now,
        ttl,
      });
      console.log(`💾 Cache MISS: ${req.originalUrl} - Cached for ${ttl/1000}s`);
      res.set({
        'X-Cache': 'MISS',
        'X-Cache-TTL': (ttl/1000).toString(),
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

export const clearCache = (pattern?: string): number => {
  if (pattern) {
    let cleared = 0;
    cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        cache.delete(key);
        cleared++;
      }
    });
    console.log(`🗑️ Cleared ${cleared} cache entries matching: ${pattern}`);
    return cleared;
  } else {
    const size = cache.size;
    cache.clear();
    console.log(`🗑️ Cleared all ${size} cache entries`);
    return size;
  }
};

export const getCacheStats = () => {
  const now = Date.now();
  const entries = Array.from(cache.entries());
  const total = entries.length;
  const expired = entries.filter(([_, entry]) => now - entry.timestamp > entry.ttl).length;
  
  return {
    total,
    active: total - expired,
    expired,
    memoryUsage: JSON.stringify(Object.fromEntries(cache)).length,
  };
};