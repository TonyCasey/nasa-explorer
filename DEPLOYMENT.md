# Deployment Guide - NASA Space Explorer

## Prerequisites

1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Railway account (sign up at railway.app) or Render account

## Frontend Deployment (Vercel)

### Step 1: Login to Vercel
```bash
cd frontend
vercel login
```
Choose your preferred login method (GitHub recommended)

### Step 2: Deploy
```bash
vercel --prod --yes
```

### Step 3: Set Environment Variables
In your Vercel dashboard:
- Go to your project settings
- Add environment variables:
  - `REACT_APP_API_URL`: Your backend URL (e.g., https://your-backend.railway.app/api/v1)
  - `REACT_APP_NASA_API_KEY`: EnvhAJZkbcMe9j9W2FW951QoOeb0KpCyuFWdogoa

## Backend Deployment (Heroku)

### Step 1: Login to Heroku
```bash
cd backend
heroku login
```
This will open a browser for authentication.

### Step 2: Create Heroku App
```bash
heroku create your-app-name
```
Replace `your-app-name` with a unique name (e.g., `nasa-space-explorer-backend`)

### Step 3: Set Environment Variables
```bash
heroku config:set NASA_API_KEY=EnvhAJZkbcMe9j9W2FW951QoOeb0KpCyuFWdogoa
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://your-frontend.vercel.app
heroku config:set RATE_LIMIT_WINDOW_MS=900000
heroku config:set RATE_LIMIT_MAX_REQUESTS=100
heroku config:set CACHE_TTL=900
heroku config:set LOG_LEVEL=info
```

### Step 4: Deploy to Heroku
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Step 5: Open Your App
```bash
heroku open
```

## Alternative: Backend Deployment (Render)

### Step 1: Create New Web Service
1. Go to render.com and sign up/login
2. Connect your GitHub repository
3. Create new "Web Service"
4. Select your repository and backend folder

### Step 2: Configure Service
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: Node

### Step 3: Environment Variables
Add these in Render dashboard:
- `NASA_API_KEY`: EnvhAJZkbcMe9j9W2FW951QoOeb0KpCyuFWdogoa
- `NODE_ENV`: production
- `CLIENT_URL`: https://your-frontend.vercel.app
- `RATE_LIMIT_WINDOW_MS`: 900000
- `RATE_LIMIT_MAX_REQUESTS`: 100
- `CACHE_TTL`: 900
- `LOG_LEVEL`: info

## Post-Deployment Steps

1. **Update Frontend API URL**:
   - Update `REACT_APP_API_URL` in Vercel to point to your deployed backend
   - Redeploy frontend: `vercel --prod`

2. **Update Backend CORS**:
   - Set `CLIENT_URL` to your Vercel frontend URL
   - Redeploy backend

3. **Test Endpoints**:
   - Frontend: Check all pages load
   - Backend: Test API endpoints
   - CORS: Verify frontend can communicate with backend

## Quick Deploy Commands

### Frontend (after Vercel login)
```bash
cd frontend
npm run build
vercel --prod --yes
```

### Backend Heroku (after login and app creation)
```bash
cd backend
# Option 1: Manual deployment
npm run build
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Option 2: Use deployment script
./deploy-heroku.sh    # Linux/Mac
deploy-heroku.bat     # Windows
```

## Environment Variables Summary

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend.railway.app/api/v1
REACT_APP_NASA_API_KEY=EnvhAJZkbcMe9j9W2FW951QoOeb0KpCyuFWdogoa
REACT_APP_LOG_LEVEL=info
```

### Backend (Production)
```
NASA_API_KEY=EnvhAJZkbcMe9j9W2FW951QoOeb0KpCyuFWdogoa
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
PORT=5000 (set by Railway/Render)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=900
LOG_LEVEL=info
```

## Troubleshooting

### CORS Issues
- Ensure `CLIENT_URL` matches your frontend URL exactly
- Check that CORS middleware is properly configured

### Build Issues
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Check TypeScript compilation: `npm run build`

### Environment Variables
- Double-check all required variables are set
- Restart services after adding variables

## Health Check URLs

- Frontend: `https://your-frontend.vercel.app`
- Backend Health: `https://your-backend.railway.app/api/v1/health`
- Backend APOD: `https://your-backend.railway.app/api/v1/apod`