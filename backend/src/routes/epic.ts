import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { nasaService } from '../services/nasa.service';

const router = Router();

// Get EPIC images for a specific date or most recent
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query;
  
  // Validate date format if provided
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
    throw createError('Invalid date format. Use YYYY-MM-DD.', 400);
  }
  
  // Check if date is not in the future
  if (date) {
    const providedDate = new Date(date as string);
    const today = new Date();
    if (providedDate > today) {
      throw createError('Date cannot be in the future.', 400);
    }
  }
  
  const data = await nasaService.getEPICImages(date as string);
  
  // Enhance the images with full URLs
  const enhancedImages = enhanceEPICImages(data, date as string);
  
  res.json({
    success: true,
    data: enhancedImages,
    count: Array.isArray(data) ? data.length : 0,
    date: date || 'latest',
    timestamp: new Date().toISOString(),
  });
}));

// Get available dates archive
router.get('/archive', asyncHandler(async (req: Request, res: Response) => {
  const data = await nasaService.getEPICImageArchive();
  
  // Process the dates and group them
  const processedArchive = processArchiveDates(data);
  
  res.json({
    success: true,
    data: processedArchive,
    timestamp: new Date().toISOString(),
  });
}));

// Get enhanced image with metadata
router.get('/enhanced/:date/:image', asyncHandler(async (req: Request, res: Response) => {
  const { date, image } = req.params;
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError('Invalid date format. Use YYYY-MM-DD.', 400);
  }
  
  // Validate image name format
  if (!/^epic_\d+_\d{8}\d{6}$/.test(image)) {
    throw createError('Invalid image name format.', 400);
  }
  
  // Get the images for that date
  const images = await nasaService.getEPICImages(date);
  
  // Find the specific image
  const targetImage = images.find((img: any) => img.image === image);
  
  if (!targetImage) {
    throw createError('Image not found for the specified date.', 404);
  }
  
  // Enhance with full metadata and URLs
  const enhancedImage = enhanceEPICImage(targetImage, date);
  
  res.json({
    success: true,
    data: enhancedImage,
    timestamp: new Date().toISOString(),
  });
}));

// Get Earth position data for visualization
router.get('/position/:date', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.params;
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError('Invalid date format. Use YYYY-MM-DD.', 400);
  }
  
  const images = await nasaService.getEPICImages(date);
  
  if (!images || images.length === 0) {
    throw createError('No images available for the specified date.', 404);
  }
  
  // Extract position data from all images for the day
  const positionData = images.map((image: any) => ({
    time: image.date,
    centroid: image.centroid_coordinates,
    dscovr_position: image.dscovr_j2000_position,
    lunar_position: image.lunar_j2000_position,
    sun_position: image.sun_j2000_position,
    attitude: image.attitude_quaternions,
  }));
  
  res.json({
    success: true,
    data: {
      date,
      positions: positionData,
      summary: generatePositionSummary(positionData),
    },
    timestamp: new Date().toISOString(),
  });
}));

// Get latest Earth image
router.get('/latest', asyncHandler(async (req: Request, res: Response) => {
  // Get latest images (without date parameter)
  const data = await nasaService.getEPICImages();
  
  if (!data || data.length === 0) {
    throw createError('No recent images available.', 404);
  }
  
  // Get the most recent image
  const latestImage = data[data.length - 1];
  const imageDate = latestImage.date ? latestImage.date.split(' ')[0] : null;
  
  // Enhance the latest image
  const enhancedImage = enhanceEPICImage(latestImage, imageDate);
  
  res.json({
    success: true,
    data: enhancedImage,
    total_images_today: data.length,
    timestamp: new Date().toISOString(),
  });
}));

// Helper function to enhance EPIC images with full URLs
function enhanceEPICImages(images: any[], date?: string): any[] {
  if (!Array.isArray(images)) return [];
  
  return images.map(image => enhanceEPICImage(image, date));
}

// Helper function to enhance individual EPIC image
function enhanceEPICImage(image: any, date?: string): any {
  const enhanced = { ...image };
  
  // Extract date from image date if not provided
  if (!date && image.date) {
    date = image.date.split(' ')[0];
  }
  
  if (date && image.image) {
    // Construct full image URLs
    const dateForUrl = date.replace(/-/g, '/');
    enhanced.image_urls = {
      natural: `https://epic.gsfc.nasa.gov/archive/natural/${dateForUrl}/png/${image.image}.png`,
      enhanced: `https://epic.gsfc.nasa.gov/archive/enhanced/${dateForUrl}/png/${image.image}.png`,
      thumbnail: `https://epic.gsfc.nasa.gov/archive/natural/${dateForUrl}/thumbs/${image.image}.jpg`,
    };
  }
  
  // Add calculated fields
  if (image.centroid_coordinates) {
    enhanced.earth_view = {
      latitude: image.centroid_coordinates.lat,
      longitude: image.centroid_coordinates.lon,
      hemisphere: image.centroid_coordinates.lat >= 0 ? 'Northern' : 'Southern',
      region: getRegionFromCoordinates(image.centroid_coordinates.lat, image.centroid_coordinates.lon),
    };
  }
  
  // Add distance calculations if position data available
  if (image.dscovr_j2000_position) {
    const distance = calculateDistance(image.dscovr_j2000_position);
    enhanced.dscovr_distance_km = Math.round(distance);
  }
  
  if (image.lunar_j2000_position) {
    const lunarDistance = calculateDistance(image.lunar_j2000_position);
    enhanced.lunar_distance_km = Math.round(lunarDistance);
  }
  
  return enhanced;
}

// Helper function to process archive dates
function processArchiveDates(dates: any[]): any {
  if (!Array.isArray(dates)) return { available_dates: [], stats: {} };
  
  // Filter and convert dates to strings, handle different data types
  const dateStrings = dates
    .map(date => {
      if (typeof date === 'string') return date;
      if (typeof date === 'object' && date?.date) return date.date;
      if (typeof date === 'object' && date?.identifier) return date.identifier;
      return null;
    })
    .filter(date => date !== null && typeof date === 'string')
    .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)); // Validate date format
  
  const sortedDates = dateStrings.sort();
  const years = new Set<string>();
  const months = new Set<string>();
  
  sortedDates.forEach(date => {
    const [year, month] = date.split('-');
    years.add(year);
    months.add(`${year}-${month}`);
  });
  
  return {
    available_dates: sortedDates,
    total_dates: sortedDates.length,
    date_range: {
      first: sortedDates[0],
      last: sortedDates[sortedDates.length - 1],
    },
    years_available: Array.from(years).sort(),
    months_available: Array.from(months).sort(),
  };
}

// Helper function to get region from coordinates
function getRegionFromCoordinates(lat: number, lon: number): string {
  // Simplified region mapping
  if (lat > 60) return 'Arctic';
  if (lat < -60) return 'Antarctic';
  if (lat > 23.5) return 'Northern Temperate';
  if (lat < -23.5) return 'Southern Temperate';
  return 'Tropical';
}

// Helper function to calculate distance from origin
function calculateDistance(position: { x: number; y: number; z: number }): number {
  return Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
}

// Helper function to generate position summary
function generatePositionSummary(positions: any[]): any {
  if (positions.length === 0) return {};
  
  const latitudes = positions.map(p => p.centroid.lat);
  const longitudes = positions.map(p => p.centroid.lon);
  
  return {
    observation_count: positions.length,
    time_span: {
      first: positions[0].time,
      last: positions[positions.length - 1].time,
    },
    coverage: {
      latitude_range: {
        min: Math.min(...latitudes),
        max: Math.max(...latitudes),
      },
      longitude_range: {
        min: Math.min(...longitudes),
        max: Math.max(...longitudes),
      },
    },
  };
}

export default router;