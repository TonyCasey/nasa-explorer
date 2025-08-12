# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NASA Space Explorer - A full-stack web application showcasing NASA's space data through modern web technologies. This is a coding challenge submission for Bounce Insights with a 2-week development timeline.

## Project Structure

```
nasa-space-explorer/
├── frontend/          # React 18+ TypeScript application
├── backend/           # Node.js Express API server
├── shared/            # Shared TypeScript types and utilities
└── docs/              # Project documentation including PRD
```

## Development Commands

### Initial Setup (if not already done)
```bash
# Initialize project structure
mkdir frontend backend shared
cd frontend && npx create-react-app . --template typescript
cd ../backend && npm init -y
```

### Frontend Development
```bash
cd frontend
npm install              # Install dependencies
npm start               # Start dev server (port 3000)
npm run build           # Production build
npm test                # Run tests
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

### Backend Development
```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start dev server with nodemon (port 5000)
npm run build           # Build TypeScript
npm start               # Start production server
npm test                # Run tests
npm run lint            # Run ESLint
```

### Testing
```bash
# Frontend unit tests
cd frontend && npm test -- --coverage

# Backend API tests
cd backend && npm test

# E2E tests (once configured with Playwright)
npm run test:e2e
```

## Architecture Overview

### Frontend Architecture
- **Component Pattern**: Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)
- **State Management**: React Query for server state, Context API for UI state
- **Routing**: React Router v6 with lazy loading for code splitting
- **Data Fetching**: Axios with interceptors, React Query for caching
- **Styling**: Tailwind CSS with custom space-themed design system
- **Animations**: Framer Motion for smooth transitions

### Backend Architecture
- **API Structure**: RESTful endpoints under `/api/v1/`
- **Middleware Stack**: CORS, rate limiting, caching, compression, security (Helmet.js)
- **Caching Strategy**: 15-minute cache for NASA API responses
- **Error Handling**: Centralized error middleware with structured responses
- **NASA API Integration**: Environment-based API key management with retry logic

### Key API Endpoints
- `/api/v1/apod` - Astronomy Picture of the Day
- `/api/v1/mars-rovers` - Mars rover photos and data
- `/api/v1/neo` - Near Earth Objects tracking
- `/api/v1/epic` - Earth imagery from space
- `/api/v1/health` - Health check endpoint

## NASA API Integration

### API Key Management
- Store NASA API key in `.env` files (never commit)
- Frontend: `REACT_APP_NASA_API_KEY`
- Backend: `NASA_API_KEY`
- Get key from: https://api.nasa.gov/

### Rate Limiting Strategy
- Backend caches NASA API responses for 15 minutes
- React Query caches with 5-minute stale time
- Request deduplication for concurrent calls
- Implement exponential backoff for retries

## Core Features Implementation Priority

### MVP Features (Week 1)
1. **Space Mission Control Dashboard** - Main interface with data widgets
2. **APOD Gallery** - Daily space images with calendar navigation
3. **Mars Rover Photos** - Filter by rover, camera, and sol date
4. **NEO Tracker** - Real-time asteroid approach data with risk visualization

### Enhanced Features (Week 2)
5. **Earth Imagery (EPIC)** - Daily Earth photos from space
6. **Space Weather Dashboard** - Solar activity and aurora forecasts
7. **AI Features** - Image analysis, natural language search, recommendations

## Design System

### Color Palette
- Primary: Deep space blue (#0B1426)
- Secondary: Cosmic purple (#6366F1)
- Accent: Solar orange (#F59E0B)
- Success: Aurora green (#10B981)
- Warning: Stellar yellow (#EAB308)
- Error: Mars red (#EF4444)

### Typography
- Headings: Inter
- Body: Source Sans Pro
- Monospace: Fira Code

## Performance Targets

### Core Web Vitals
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Optimization Checklist
- [ ] Code splitting by route
- [ ] Image optimization with WebP
- [ ] Service worker for offline capability
- [ ] Lazy loading for images
- [ ] Bundle size monitoring

## Deployment

### Frontend (Vercel)
```bash
# Build and deploy
npm run build
vercel deploy --prod
```

### Backend (Render/Heroku)
```bash
# Ensure Procfile exists with: web: node dist/index.js
git push heroku main
```

## Testing Strategy

- Unit Tests: Jest + React Testing Library (target >80% coverage)
- Integration Tests: Supertest for API endpoints
- E2E Tests: Playwright for critical user journeys
- Performance: Lighthouse CI integration

## Environment Variables

### Frontend (.env)
```
REACT_APP_NASA_API_KEY=your_nasa_api_key
REACT_APP_API_URL=http://localhost:5000/api/v1
```

### Backend (.env)
```
NASA_API_KEY=your_nasa_api_key
PORT=5000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

## Common Issues & Solutions

1. **CORS Issues**: Ensure backend has proper CORS middleware configured
2. **NASA API Rate Limits**: Implement caching layer and request queuing
3. **Large Image Loading**: Use progressive loading and lazy loading
4. **TypeScript Errors**: Run `npm run type-check` before commits

## Code Quality Standards

- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- Pre-commit hooks with Husky
- Minimum 80% test coverage for new code
- Atomic commits with clear messages