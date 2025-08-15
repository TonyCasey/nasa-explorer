# NASA Space Explorer Backend API

A Node.js Express API server that provides endpoints for accessing NASA's space data and serves as the backend for the NASA Space Explorer web application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- NASA API key from [NASA API Portal](https://api.nasa.gov/)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your NASA API key
```

### Development
```bash
# Start development server with hot reload
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Format code
npm run format
```

### Production
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

### Core Endpoints
- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/apod` - Astronomy Picture of the Day
- `GET /api/v1/mars-rovers` - Mars rover photos and data
- `GET /api/v1/neo` - Near Earth Objects tracking
- `GET /api/v1/epic` - Earth imagery from space

### Query Parameters
Most endpoints support filtering and pagination parameters. See individual route documentation for specific options.

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **HTTP Client**: Axios for NASA API requests
- **Logging**: Winston with daily log rotation
- **Security**: Helmet.js, CORS middleware
- **Performance**: Compression, request caching
- **Development**: Nodemon, ts-node for hot reload

## 📁 Project Structure

```
src/
├── app.ts              # Express application setup
├── server.ts           # Server entry point
├── index.ts            # Production entry point
├── middleware/         # Custom middleware
│   ├── cache.ts        # Response caching
│   ├── errorHandler.ts # Global error handling
│   ├── rateLimiter.ts  # Rate limiting
│   └── requestLogger.ts # Request logging
├── routes/             # API route handlers
│   ├── index.ts        # Route registration
│   ├── apod.ts         # APOD endpoints
│   ├── epic.ts         # EPIC endpoints
│   ├── mars-rovers.ts  # Mars rover endpoints
│   └── neo.ts          # NEO endpoints
├── services/           # Business logic
│   └── nasa.service.ts # NASA API integration
└── utils/              # Utility functions
    ├── logger.ts       # Winston logger setup
    └── version.ts      # Version utilities
```

## 🔧 Configuration

### Environment Variables
```env
NASA_API_KEY=your_nasa_api_key_here
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
```

### Caching Strategy
- NASA API responses cached for 15 minutes
- Automatic cache invalidation on errors
- Request deduplication for concurrent calls

## 📊 Logging

The application uses structured logging with Winston:
- **Development**: Console output with colors
- **Production**: JSON format with daily log rotation
- **Log Levels**: error, warn, info, debug
- **Log Files**: Stored in `logs/` directory

## 🔒 Security Features

- CORS protection with configurable origins
- Helmet.js security headers
- Rate limiting on API endpoints
- Request sanitization and validation
- Environment-based configuration

## 🚦 Health Monitoring

Access `/api/v1/health` for:
- Application status
- NASA API connectivity
- System uptime
- Version information

## 🧪 Testing

```bash
# Run unit tests (when implemented)
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Deployment

### Docker (Optional)
```bash
# Build image
docker build -t nasa-explorer-backend .

# Run container
docker run -p 5000:5000 --env-file .env nasa-explorer-backend
```

### Traditional Deployment
1. Set production environment variables
2. Run `npm run build` to compile TypeScript
3. Run `npm start` to start the production server
4. Ensure `dist/index.js` is the entry point

## 🔄 API Rate Limiting

- Default: 100 requests per 15 minutes per IP
- NASA API: Cached responses to respect upstream limits
- Configurable via environment variables

## 📈 Performance

- Response compression enabled
- Request caching with TTL
- Connection pooling for external APIs
- Optimized JSON serialization

## 🤝 Contributing

1. Follow existing code style and patterns
2. Run `npm run lint` and `npm run type-check` before commits
3. Ensure all tests pass
4. Update documentation for new features

## 📄 License

ISC License - See LICENSE file for details