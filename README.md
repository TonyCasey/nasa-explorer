# NASA Space Explorer

A full-stack web application that showcases NASA's space data through modern web technologies. This interactive platform provides access to stunning space imagery, Mars rover photos, Near Earth Object tracking, and more.

## Features

### Core Features
- **Space Mission Control Dashboard** - Clean, space-themed interface with real-time data widgets
- **Astronomy Picture of the Day (APOD)** - Daily featured space images with calendar navigation
- **Mars Rover Photo Gallery** - Explore photos from Curiosity, Opportunity, Spirit, and Perseverance
- **Near Earth Objects (NEO) Tracker** - Real-time asteroid tracking with risk visualization

### Technical Highlights
- Modern React 18+ with TypeScript
- Express.js backend with NASA API integration
- Responsive design with Tailwind CSS
- Real-time data caching and optimization
- Performance-focused architecture

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- React Query for data fetching and caching
- Framer Motion for animations
- React Router v6 for navigation

### Backend
- Node.js with Express
- TypeScript
- NASA Open APIs integration
- Helmet.js for security
- Compression and caching strategies

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- NASA API Key (get one free at https://api.nasa.gov/)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nasa-space-explorer
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install shared types
cd ../shared
npm install
npm run build
```

3. Set up environment variables:
```bash
# Backend (.env in backend folder)
cp backend/.env.example backend/.env
# Edit backend/.env and add your NASA API key

# Frontend (.env in frontend folder)
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed
```

4. Start the development servers:
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
nasa-space-explorer/
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── hooks/        # Custom React hooks
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
├── backend/              # Express API server
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic and NASA API integration
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Helper functions
│   └── dist/            # Compiled JavaScript
├── shared/              # Shared types and utilities
│   └── src/
│       └── types/       # Shared TypeScript interfaces
└── docs/                # Project documentation
```

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Endpoints

#### Astronomy Picture of the Day
```
GET /api/v1/apod
GET /api/v1/apod?date=YYYY-MM-DD
```

#### Mars Rover Photos
```
GET /api/v1/mars-rovers/photos
Query params:
  - rover: curiosity | opportunity | spirit | perseverance
  - sol: Mars day (integer)
  - camera: FHAZ | RHAZ | MAST | CHEMCAM | etc.
```

#### Near Earth Objects
```
GET /api/v1/neo/feed
Query params:
  - start_date: YYYY-MM-DD
  - end_date: YYYY-MM-DD
```

## Development

### Available Scripts

#### Frontend
```bash
npm start       # Start development server
npm run build   # Build for production
npm test        # Run tests
npm run lint    # Run ESLint
```

#### Backend
```bash
npm run dev     # Start development server with hot reload
npm run build   # Compile TypeScript
npm start       # Start production server
npm run lint    # Run ESLint
```

## Performance Targets

- Lighthouse Score: > 90
- Core Web Vitals:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is built for educational purposes as part of the Bounce Insights coding challenge.

## Acknowledgments

- NASA Open APIs for providing amazing space data
- Bounce Insights for the opportunity
- The open-source community for the amazing tools and libraries

---

Built with passion for space exploration and modern web technologies.