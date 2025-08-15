import { Router, Request, Response } from 'express';

const router = Router();

// Simple APOD route
router.get('/apod', (req: Request, res: Response) => {
  res.json({
    date: new Date().toISOString().split('T')[0],
    title: "Test APOD",
    explanation: "This is a test response while we debug the backend routes.",
    url: "https://apod.nasa.gov/apod/image/test.jpg",
    media_type: "image",
    service_version: "v1"
  });
});

// Simple Mars rovers route
router.get('/mars-rovers/photos', (req: Request, res: Response) => {
  res.json({
    photos: [{
      id: 1,
      img_src: "https://mars.nasa.gov/test.jpg",
      earth_date: new Date().toISOString().split('T')[0],
      rover: {
        id: 1,
        name: "Test Rover",
        status: "active"
      },
      camera: {
        id: 1,
        name: "Test Camera",
        full_name: "Test Camera"
      }
    }]
  });
});

// Simple NEO route
router.get('/neo/feed', (req: Request, res: Response) => {
  res.json({
    near_earth_objects: {},
    element_count: 0,
    links: {
      next: "",
      prev: "",
      self: ""
    }
  });
});

export default router;