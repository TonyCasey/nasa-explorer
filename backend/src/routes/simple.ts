import { Router, Request, Response } from 'express';

const router = Router();

// Simple APOD route with real-looking NASA data
router.get('/apod', (req: Request, res: Response) => {
  const apodImages = [
    {
      date: "2025-08-16",
      title: "Pillars of Creation (Test Data)",
      explanation: "This is test data showing the famous Pillars of Creation from the Eagle Nebula, captured by the Hubble Space Telescope. These elephant trunks of interstellar gas and dust are incubators for new stars.",
      url: "https://apod.nasa.gov/apod/image/2408/PillarsOfCreation_HubblePohl_1895.jpg",
      hdurl: "https://apod.nasa.gov/apod/image/2408/PillarsOfCreation_HubblePohl_1895.jpg",
      media_type: "image",
      service_version: "v1"
    },
    {
      date: "2025-08-15", 
      title: "Saturn's Hexagon (Test Data)",
      explanation: "Test data showing Saturn's remarkable hexagonal cloud pattern at its north pole, one of the most mysterious features in our solar system.",
      url: "https://apod.nasa.gov/apod/image/2408/SaturnHexagon_Cassini_960.jpg",
      hdurl: "https://apod.nasa.gov/apod/image/2408/SaturnHexagon_Cassini_960.jpg",
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