import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { nasaService } from '../services/nasa.service';

const router = Router();

// Get NEO feed for date range
router.get('/feed', asyncHandler(async (req: Request, res: Response) => {
  const { start_date, end_date } = req.query;
  
  // Validate date formats if provided
  if (start_date && !/^\d{4}-\d{2}-\d{2}$/.test(start_date as string)) {
    throw createError('Invalid start_date format. Use YYYY-MM-DD.', 400);
  }
  
  if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date as string)) {
    throw createError('Invalid end_date format. Use YYYY-MM-DD.', 400);
  }
  
  // Validate date range if both provided
  if (start_date && end_date) {
    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (startDate > endDate) {
      throw createError('start_date must be before end_date.', 400);
    }
    
    if (endDate > today) {
      throw createError(`end_date cannot be in the future. Maximum allowed date: ${today.toISOString().split('T')[0]}`, 400);
    }
    
    // NASA NEO API has a 7-day limit
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      throw createError('Date range cannot exceed 7 days for NEO feed.', 400);
    }
  }
  
  const data = await nasaService.getNEOFeed(start_date as string, end_date as string);
  
  // Process and enhance the data
  const processedData = processNEOFeedData(data);
  
  res.json({
    success: true,
    data: processedData,
    summary: generateNEOSummary(processedData),
    timestamp: new Date().toISOString(),
  });
}));

// Get specific NEO by ID
router.get('/:neoId', asyncHandler(async (req: Request, res: Response) => {
  const { neoId } = req.params;
  
  if (!neoId) {
    throw createError('NEO ID is required.', 400);
  }
  
  // Validate NEO ID format (should be numeric)
  if (!/^\d+$/.test(neoId)) {
    throw createError('Invalid NEO ID format. Must be numeric.', 400);
  }
  
  const data = await nasaService.getNEOById(neoId);
  
  // Enhance the data with additional calculations
  const enhancedData = enhanceNEOData(data);
  
  res.json({
    success: true,
    data: enhancedData,
    timestamp: new Date().toISOString(),
  });
}));

// Get today's potentially hazardous asteroids
router.get('/hazardous/today', asyncHandler(async (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  
  const data = await nasaService.getNEOFeed(today, today);
  const processedData = processNEOFeedData(data);
  
  // Filter for potentially hazardous asteroids
  const hazardousAsteroids: any[] = [];
  
  Object.values(processedData.near_earth_objects).forEach((asteroids: any) => {
    asteroids.forEach((asteroid: any) => {
      if (asteroid.is_potentially_hazardous_asteroid) {
        hazardousAsteroids.push(asteroid);
      }
    });
  });
  
  // Sort by closest approach distance
  hazardousAsteroids.sort((a, b) => {
    const aDistance = parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || '0');
    const bDistance = parseFloat(b.close_approach_data[0]?.miss_distance?.kilometers || '0');
    return aDistance - bDistance;
  });
  
  res.json({
    success: true,
    data: {
      date: today,
      hazardous_count: hazardousAsteroids.length,
      asteroids: hazardousAsteroids,
    },
    timestamp: new Date().toISOString(),
  });
}));

// Get NEO statistics
router.get('/stats/overview', asyncHandler(async (req: Request, res: Response) => {
  const { days = '7' } = req.query;
  
  // Validate days parameter
  if (isNaN(Number(days)) || Number(days) < 1 || Number(days) > 7) {
    throw createError('Days must be between 1 and 7.', 400);
  }
  
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (Number(days) - 1) * 24 * 60 * 60 * 1000);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  const data = await nasaService.getNEOFeed(startDateStr, endDateStr);
  const processedData = processNEOFeedData(data);
  
  // Calculate statistics
  const stats = calculateNEOStatistics(processedData);
  
  res.json({
    success: true,
    data: {
      period: {
        start_date: startDateStr,
        end_date: endDateStr,
        days: Number(days),
      },
      statistics: stats,
    },
    timestamp: new Date().toISOString(),
  });
}));

// Helper function to process NEO feed data
function processNEOFeedData(data: any) {
  if (!data.near_earth_objects) return data;
  
  // Enhance each asteroid with additional computed fields
  Object.keys(data.near_earth_objects).forEach(date => {
    data.near_earth_objects[date] = data.near_earth_objects[date].map((asteroid: any) => 
      enhanceNEOData(asteroid)
    );
  });
  
  return data;
}

// Helper function to enhance individual NEO data
function enhanceNEOData(asteroid: any) {
  const enhanced = { ...asteroid };
  
  if (enhanced.close_approach_data && enhanced.close_approach_data.length > 0) {
    const approach = enhanced.close_approach_data[0];
    
    // Add risk level based on distance and size
    enhanced.risk_level = calculateRiskLevel(
      parseFloat(approach.miss_distance?.kilometers || '0'),
      parseFloat(enhanced.estimated_diameter?.kilometers?.estimated_diameter_max || '0'),
      enhanced.is_potentially_hazardous_asteroid
    );
    
    // Add relative speed in more readable format
    if (approach.relative_velocity?.kilometers_per_hour) {
      const kmh = parseFloat(approach.relative_velocity.kilometers_per_hour);
      enhanced.relative_speed_mach = (kmh / 1234.8).toFixed(2); // Mach 1 ≈ 1234.8 km/h
    }
    
    // Add distance in lunar distances
    if (approach.miss_distance?.kilometers) {
      const km = parseFloat(approach.miss_distance.kilometers);
      enhanced.lunar_distance = (km / 384400).toFixed(2); // 1 lunar distance ≈ 384,400 km
    }
  }
  
  return enhanced;
}

// Helper function to calculate risk level
function calculateRiskLevel(distance: number, diameter: number, isPHA: boolean): string {
  if (isPHA) {
    if (distance < 7500000) return 'HIGH'; // < 7.5M km
    return 'MEDIUM';
  }
  
  if (distance < 1000000) return 'MEDIUM'; // < 1M km
  if (diameter > 1) return 'MEDIUM'; // > 1km diameter
  
  return 'LOW';
}

// Helper function to generate NEO summary
function generateNEOSummary(data: any) {
  const summary = {
    total_objects: 0,
    potentially_hazardous: 0,
    largest_object: null as any,
    closest_object: null as any,
    dates_covered: Object.keys(data.near_earth_objects || {}),
  };
  
  let largestDiameter = 0;
  let closestDistance = Infinity;
  
  Object.values(data.near_earth_objects || {}).forEach((asteroids: any) => {
    summary.total_objects += asteroids.length;
    
    asteroids.forEach((asteroid: any) => {
      if (asteroid.is_potentially_hazardous_asteroid) {
        summary.potentially_hazardous++;
      }
      
      const diameter = parseFloat(asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || '0');
      if (diameter > largestDiameter) {
        largestDiameter = diameter;
        summary.largest_object = {
          name: asteroid.name,
          diameter_km: diameter.toFixed(3),
          id: asteroid.id,
        };
      }
      
      if (asteroid.close_approach_data?.[0]) {
        const distance = parseFloat(asteroid.close_approach_data[0].miss_distance?.kilometers || '0');
        if (distance < closestDistance) {
          closestDistance = distance;
          summary.closest_object = {
            name: asteroid.name,
            distance_km: distance.toFixed(0),
            date: asteroid.close_approach_data[0].close_approach_date,
            id: asteroid.id,
          };
        }
      }
    });
  });
  
  return summary;
}

// Helper function to calculate NEO statistics
function calculateNEOStatistics(data: any) {
  const stats = {
    total_objects: 0,
    potentially_hazardous: 0,
    risk_levels: { HIGH: 0, MEDIUM: 0, LOW: 0 },
    size_distribution: {
      small: 0,    // < 100m
      medium: 0,   // 100m - 1km
      large: 0,    // > 1km
    },
    average_speed: 0,
    speed_range: { min: Infinity, max: 0 },
  };
  
  let totalSpeed = 0;
  let speedCount = 0;
  
  Object.values(data.near_earth_objects || {}).forEach((asteroids: any) => {
    stats.total_objects += asteroids.length;
    
    asteroids.forEach((asteroid: any) => {
      if (asteroid.is_potentially_hazardous_asteroid) {
        stats.potentially_hazardous++;
      }
      
      // Risk level distribution
      if (asteroid.risk_level) {
        stats.risk_levels[asteroid.risk_level as keyof typeof stats.risk_levels]++;
      }
      
      // Size distribution
      const diameter = parseFloat(asteroid.estimated_diameter?.meters?.estimated_diameter_max || '0');
      if (diameter < 100) {
        stats.size_distribution.small++;
      } else if (diameter < 1000) {
        stats.size_distribution.medium++;
      } else {
        stats.size_distribution.large++;
      }
      
      // Speed statistics
      if (asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour) {
        const speed = parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour);
        totalSpeed += speed;
        speedCount++;
        
        if (speed < stats.speed_range.min) stats.speed_range.min = speed;
        if (speed > stats.speed_range.max) stats.speed_range.max = speed;
      }
    });
  });
  
  if (speedCount > 0) {
    stats.average_speed = Math.round(totalSpeed / speedCount);
  }
  
  if (stats.speed_range.min === Infinity) {
    stats.speed_range.min = 0;
  }
  
  return stats;
}

export default router;