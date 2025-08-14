import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { nasaService } from '../services/nasa.service';
import logger from '../utils/logger';

const router = Router();

// Valid rover names and cameras
const VALID_ROVERS = ['curiosity', 'opportunity', 'spirit', 'perseverance'];
const VALID_CAMERAS = {
  curiosity: ['FHAZ', 'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI'],
  opportunity: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
  spirit: ['FHAZ', 'RHAZ', 'NAVCAM', 'PANCAM', 'MINITES'],
  perseverance: ['FHAZ', 'RHAZ', 'MAST', 'SUPERCAM'],
};

// Get rover information
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Mars rovers info request received');
  
  res.json({
    success: true,
    data: {
      available_rovers: VALID_ROVERS,
      cameras: VALID_CAMERAS,
      endpoints: {
        rover_info: '/:rover - Get specific rover information',
        photos: '/photos - Get rover photos with filters',
        latest: '/:rover/latest - Get latest photos from rover',
      },
    },
    timestamp: new Date().toISOString(),
  });
}));

// Get specific rover information
router.get('/:rover', asyncHandler(async (req: Request, res: Response) => {
  const { rover } = req.params;
  logger.info('Rover info request received', { rover });
  
  if (!VALID_ROVERS.includes(rover.toLowerCase())) {
    logger.warn('Invalid rover name requested', { rover });
    throw createError(`Invalid rover name. Valid rovers: ${VALID_ROVERS.join(', ')}`, 400);
  }
  
  logger.debug('Fetching rover info', { rover: rover.toLowerCase() });
  const data = await nasaService.getRoverInfo(rover.toLowerCase());
  logger.info('Rover info fetched successfully', { rover: rover.toLowerCase(), hasData: !!data });
  
  res.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}));

// Get rover photos with filters
router.get('/photos', asyncHandler(async (req: Request, res: Response) => {
  const { rover, sol, earth_date, camera, page = '1' } = req.query;
  
  // Validate required rover parameter
  if (!rover) {
    throw createError('Rover parameter is required.', 400);
  }
  
  if (!VALID_ROVERS.includes((rover as string).toLowerCase())) {
    throw createError(`Invalid rover name. Valid rovers: ${VALID_ROVERS.join(', ')}`, 400);
  }
  
  const roverName = (rover as string).toLowerCase();
  
  // Validate camera if provided
  if (camera) {
    const validCameras = VALID_CAMERAS[roverName as keyof typeof VALID_CAMERAS];
    if (!validCameras.includes((camera as string).toUpperCase())) {
      throw createError(
        `Invalid camera for ${roverName}. Valid cameras: ${validCameras.join(', ')}`, 
        400
      );
    }
  }
  
  // Validate sol if provided
  if (sol && (isNaN(Number(sol)) || Number(sol) < 0)) {
    throw createError('Sol must be a non-negative number.', 400);
  }
  
  // Validate earth_date if provided
  if (earth_date && !/^\d{4}-\d{2}-\d{2}$/.test(earth_date as string)) {
    throw createError('Invalid earth_date format. Use YYYY-MM-DD.', 400);
  }
  
  // Validate page
  if (isNaN(Number(page)) || Number(page) < 1) {
    throw createError('Page must be a positive number.', 400);
  }
  
  // Cannot provide both sol and earth_date
  if (sol && earth_date) {
    throw createError('Cannot provide both sol and earth_date. Choose one.', 400);
  }
  
  const params = {
    rover: roverName,
    sol: sol ? Number(sol) : undefined,
    earth_date: earth_date as string,
    camera: camera ? (camera as string).toUpperCase() : undefined,
    page: Number(page),
  };
  
  const data = await nasaService.getMarsRoverPhotos(params);
  
  res.json({
    success: true,
    data,
    filters: {
      rover: roverName,
      sol: params.sol,
      earth_date: params.earth_date,
      camera: params.camera,
      page: params.page,
    },
    pagination: {
      current_page: params.page,
      total_photos: data.photos?.length || 0,
    },
    timestamp: new Date().toISOString(),
  });
}));

// Get latest photos from a specific rover
router.get('/:rover/latest', asyncHandler(async (req: Request, res: Response) => {
  const { rover } = req.params;
  const { camera, limit = '25' } = req.query;
  
  if (!VALID_ROVERS.includes(rover.toLowerCase())) {
    throw createError(`Invalid rover name. Valid rovers: ${VALID_ROVERS.join(', ')}`, 400);
  }
  
  const roverName = rover.toLowerCase();
  
  // Validate camera if provided
  if (camera) {
    const validCameras = VALID_CAMERAS[roverName as keyof typeof VALID_CAMERAS];
    if (!validCameras.includes((camera as string).toUpperCase())) {
      throw createError(
        `Invalid camera for ${roverName}. Valid cameras: ${validCameras.join(', ')}`, 
        400
      );
    }
  }
  
  // Validate limit
  if (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100) {
    throw createError('Limit must be between 1 and 100.', 400);
  }
  
  // First get rover info to find the latest sol
  const roverInfo = await nasaService.getRoverInfo(roverName);
  const latestSol = roverInfo.rover?.max_sol || 1000;
  
  // Get photos from the latest sol
  const params = {
    rover: roverName,
    sol: latestSol,
    camera: camera ? (camera as string).toUpperCase() : undefined,
    page: 1,
  };
  
  const data = await nasaService.getMarsRoverPhotos(params);
  
  // Limit the results
  const limitedPhotos = data.photos?.slice(0, Number(limit)) || [];
  
  res.json({
    success: true,
    data: {
      ...data,
      photos: limitedPhotos,
    },
    rover_info: {
      name: roverName,
      latest_sol: latestSol,
      status: roverInfo.rover?.status,
    },
    filters: {
      camera: params.camera,
      limit: Number(limit),
    },
    timestamp: new Date().toISOString(),
  });
}));

// Get rover cameras
router.get('/:rover/cameras', asyncHandler(async (req: Request, res: Response) => {
  const { rover } = req.params;
  
  if (!VALID_ROVERS.includes(rover.toLowerCase())) {
    throw createError(`Invalid rover name. Valid rovers: ${VALID_ROVERS.join(', ')}`, 400);
  }
  
  const roverName = rover.toLowerCase();
  const cameras = VALID_CAMERAS[roverName as keyof typeof VALID_CAMERAS];
  
  res.json({
    success: true,
    data: {
      rover: roverName,
      cameras: cameras.map(camera => ({
        name: camera,
        full_name: getCameraFullName(camera),
      })),
    },
    timestamp: new Date().toISOString(),
  });
}));

// Helper function to get camera full names
function getCameraFullName(camera: string): string {
  const cameraNames: { [key: string]: string } = {
    FHAZ: 'Front Hazard Avoidance Camera',
    RHAZ: 'Rear Hazard Avoidance Camera',
    MAST: 'Mast Camera',
    CHEMCAM: 'Chemistry and Camera Complex',
    MAHLI: 'Mars Hand Lens Imager',
    MARDI: 'Mars Descent Imager',
    NAVCAM: 'Navigation Camera',
    PANCAM: 'Panoramic Camera',
    MINITES: 'Miniature Thermal Emission Spectrometer',
    SUPERCAM: 'SuperCam',
  };
  
  return cameraNames[camera] || camera;
}

export default router;