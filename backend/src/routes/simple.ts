import { Router, Request, Response } from 'express';

const router = Router();

// Simple APOD route with real-looking NASA data
router.get('/apod', (req: Request, res: Response) => {
  const apodImages = [
    {
      date: "2025-08-16",
      title: "Earth from Space (Test Data)",
      explanation: "This test image shows our beautiful planet Earth as seen from the International Space Station. The blue marble continues to inspire astronauts and space enthusiasts alike.",
      url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop",
      hdurl: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&h=900&fit=crop",
      media_type: "image",
      service_version: "v1"
    },
    {
      date: "2025-08-15", 
      title: "Galaxy Spiral (Test Data)",
      explanation: "Test data showing a beautiful spiral galaxy with its characteristic arms stretching across the cosmos. This type of galaxy hosts billions of stars.",
      url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=600&fit=crop",
      hdurl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&h=900&fit=crop",
      media_type: "image", 
      service_version: "v1"
    }
  ];
  
  const today = new Date().toISOString().split('T')[0];
  const requestedDate = req.query.date as string || today;
  
  // Return appropriate image based on date
  const apod = requestedDate === "2025-08-15" ? apodImages[1] : apodImages[0];
  apod.date = requestedDate;
  
  res.json(apod);
});

// Simple Mars rovers route with real-looking data
router.get('/mars-rovers/photos', (req: Request, res: Response) => {
  const marsPhotos = [
    {
      id: 424905,
      img_src: "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG",
      earth_date: "2015-05-30",
      rover: {
        id: 5,
        name: "Curiosity",
        status: "active"
      },
      camera: {
        id: 20,
        name: "FHAZ",
        full_name: "Front Hazard Avoidance Camera"
      }
    },
    {
      id: 424906,
      img_src: "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/ccam/CR0_486265306EDR_F0481570CCAM01000M_.JPG",
      earth_date: "2015-05-30",
      rover: {
        id: 5,
        name: "Curiosity", 
        status: "active"
      },
      camera: {
        id: 22,
        name: "CHEMCAM",
        full_name: "Chemistry and Camera Complex"
      }
    }
  ];
  
  res.json({ photos: marsPhotos });
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