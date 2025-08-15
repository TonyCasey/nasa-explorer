# NASA Space Explorer 🚀

**Version 2.1.0** - Advanced Features Release

A full-stack web application that showcases NASA's space data through modern web technologies. This interactive platform provides access to stunning space imagery, Mars rover photos, Near Earth Object tracking, and more.

## 🌟 Features

### Core Features
- **Space Mission Control Dashboard** - Clean, space-themed interface with real-time data widgets
- **Astronomy Picture of the Day (APOD)** - Daily featured space images with calendar navigation
- **Mars Rover Photo Gallery** - Explore photos from Curiosity, Opportunity, Spirit, and Perseverance with advanced filters
- **Near Earth Objects (NEO) Tracker** - Real-time asteroid tracking with interactive data visualizations

### Advanced Features (v2.1.0)
- **Infinite Scroll** - Seamless browsing experience in Mars Rover gallery
- **Favorites System** - Save and organize your favorite space discoveries with persistent storage
- **Interactive Data Visualizations** - Advanced charts for NEO data using Recharts
  - Hazard classification pie charts
  - Size distribution bar charts
  - Velocity distribution line graphs
  - Size vs Distance scatter plots
- **Smart Navigation** - Favorites counter badge and dedicated favorites page
- **Comprehensive Logging** - Daily rotating log files with configurable levels
- **Version Tracking** - Automatic version management across frontend and backend

### Technical Highlights
- Modern React 18+ with TypeScript
- Express.js backend with NASA API integration
- Responsive design with Tailwind CSS and space-themed UI
- Real-time data caching and optimization
- Performance-focused architecture with lazy loading
- Intersection Observer API for infinite scroll
- Local storage for favorites persistence

## 🛠️ Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- React Query for data fetching and caching
- Recharts for data visualization
- React Router v6 for navigation
- React Intersection Observer for infinite scroll
- Axios with interceptors for API calls

### Backend
- Node.js with Express
- TypeScript
- NASA Open APIs integration
- Winston for logging with daily rotation
- Helmet.js for security
- CORS with proper configuration
- Compression and caching strategies
- Environment-based configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- NASA API Key (get one free at https://api.nasa.gov/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TonyCasey/BounceInsights
cd nasa-space-explorer
```

2. Install all dependencies:
```bash
npm run install:all
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
- Frontend: http://localhost:3001 (or 3000)
- Backend API: http://localhost:5000

## 📁 Project Structure

```
nasa-space-explorer/
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Navigation.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   ├── NEOChart.tsx
│   │   │   ├── FavoriteButton.tsx
│   │   │   └── ...
│   │   ├── pages/        # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── APOD.tsx
│   │   │   ├── MarsRovers.tsx
│   │   │   ├── NEOTracker.tsx
│   │   │   └── Favorites.tsx
│   │   ├── services/     # API service layer
│   │   │   ├── api.ts
│   │   │   ├── nasa.service.ts
│   │   │   └── favorites.service.ts
│   │   ├── hooks/        # Custom React hooks
│   │   │   └── useFavorites.ts
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   │       ├── logger.ts
│   │       └── version.ts
│   └── public/           # Static assets
├── backend/              # Express API server
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic and NASA API integration
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Helper functions
│   │       ├── logger.ts
│   │       └── version.ts
│   └── dist/            # Compiled JavaScript
├── shared/              # Shared types and utilities
├── scripts/             # Build and utility scripts
│   ├── version.js      # Version management
│   └── update-version.js # Version sync script
├── logs/               # Application logs (auto-generated)
└── docs/               # Project documentation
    ├── TODO.md         # Project roadmap and tasks
    └── CLAUDE.md       # AI assistant instructions
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Core Endpoints

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
  - earth_date: YYYY-MM-DD
  - camera: FHAZ | RHAZ | MAST | CHEMCAM | etc.
  - page: Page number for pagination
```

#### Near Earth Objects
```
GET /api/v1/neo/feed
Query params:
  - start_date: YYYY-MM-DD
  - end_date: YYYY-MM-DD
```

#### Health Check
```
GET /api/v1/health
```

## 🧪 Development

### Available Scripts

#### Root Level
```bash
npm run version:sync    # Sync version across all packages
npm run version:bump    # Bump version number
npm run install:all     # Install all dependencies
```

#### Frontend
```bash
npm start               # Start development server
npm run build          # Build for production
npm test               # Run tests
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
```

#### Backend
```bash
npm run dev            # Start development server with hot reload
npm run build          # Compile TypeScript
npm start              # Start production server
npm run lint           # Run ESLint
npm test               # Run tests
```

## 📊 Performance Targets

- Lighthouse Score: > 90
- Core Web Vitals:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1
- Bundle size: < 500KB (gzipped)
- API response time: < 500ms (cached)

## 🎯 Project Status

### Completed ✅
- **Week 1 (Days 1-7)**
  - Project setup and foundation
  - NASA API integration
  - Core UI components
  - Space Mission Control Dashboard
  - APOD Gallery with calendar
  - Mars Rover photo gallery
  - NEO Tracker with basic visualization
  - Comprehensive logging system

- **Week 2 (Days 8-10)**
  - Infinite scroll implementation
  - Favorites/bookmark system
  - Advanced data visualization charts
  - Version management system

### In Progress 🚧
- Search and filter capabilities enhancement
- Social media sharing functionality
- Earth imagery (EPIC) feature
- Space Weather dashboard

### Planned 📋
- Unit tests (>80% coverage)
- E2E tests with Playwright
- PWA configuration
- AI-powered features
- Performance optimizations
- Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is built for educational purposes as part of the Bounce Insights coding challenge.

## 🙏 Acknowledgments

- NASA Open APIs for providing amazing space data
- Bounce Insights for the opportunity
- The open-source community for the amazing tools and libraries
- All contributors and testers

---

**Built with passion for space exploration and modern web technologies** 🌌

**Latest Build**: v2.1.0 - August 15, 2025