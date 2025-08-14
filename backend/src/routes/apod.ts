import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { nasaService } from '../services/nasa.service';
import logger from '../utils/logger';

const router = Router();

// Get single APOD (today or specific date)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query;
  logger.info('APOD request received', { date });
  
  // Validate date format if provided
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
    logger.warn('Invalid date format in APOD request', { date });
    throw createError('Invalid date format. Use YYYY-MM-DD.', 400);
  }
  
  // Check if date is not in the future
  if (date) {
    const providedDate = new Date(date as string);
    const today = new Date();
    if (providedDate > today) {
      logger.warn('Future date requested in APOD', { date, today: today.toISOString() });
      throw createError('Date cannot be in the future.', 400);
    }
  }
  
  logger.debug('Fetching APOD data', { date });
  const data = await nasaService.getAPOD(date as string);
  logger.info('APOD data fetched successfully', { date, hasData: !!data });
  
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}));

// Get APOD range
router.get('/range', asyncHandler(async (req: Request, res: Response) => {
  const { start_date, end_date } = req.query;
  logger.info('APOD range request received', { start_date, end_date });
  
  if (!start_date || !end_date) {
    logger.warn('Missing date parameters in APOD range request');
    throw createError('Both start_date and end_date are required.', 400);
  }
  
  // Validate date formats
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date as string) || 
      !/^\d{4}-\d{2}-\d{2}$/.test(end_date as string)) {
    logger.warn('Invalid date format in APOD range request', { start_date, end_date });
    throw createError('Invalid date format. Use YYYY-MM-DD.', 400);
  }
  
  const startDate = new Date(start_date as string);
  const endDate = new Date(end_date as string);
  const today = new Date();
  
  // Validate date range
  if (startDate > endDate) {
    logger.warn('Invalid date range in APOD request', { start_date, end_date });
    throw createError('start_date must be before end_date.', 400);
  }
  
  if (endDate > today) {
    logger.warn('Future end date in APOD range request', { end_date, today: today.toISOString() });
    throw createError('end_date cannot be in the future.', 400);
  }
  
  // Limit range to 30 days to prevent abuse
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 30) {
    logger.warn('Date range exceeds 30 days limit', { start_date, end_date, daysDiff });
    throw createError('Date range cannot exceed 30 days.', 400);
  }
  
  logger.debug('Fetching APOD range data', { start_date, end_date, daysDiff });
  const data = await nasaService.getAPODRange(start_date as string, end_date as string);
  const count = Array.isArray(data) ? data.length : 1;
  logger.info('APOD range data fetched successfully', { start_date, end_date, count });
  
  res.json({
    success: true,
    data,
    count,
    range: {
      start_date,
      end_date,
      days: daysDiff + 1,
    },
    timestamp: new Date().toISOString(),
  });
}));

// Get random APOD from the past year
router.get('/random', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Random APOD request received');
  
  const today = new Date();
  const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  // Generate random date between one year ago and today
  const randomTime = oneYearAgo.getTime() + Math.random() * (today.getTime() - oneYearAgo.getTime());
  const randomDate = new Date(randomTime).toISOString().split('T')[0];
  
  logger.debug('Generated random date for APOD', { randomDate });
  const data = await nasaService.getAPOD(randomDate);
  logger.info('Random APOD data fetched successfully', { randomDate, hasData: !!data });
  
  res.json({
    success: true,
    data,
    randomDate,
    timestamp: new Date().toISOString(),
  });
}));

export default router;