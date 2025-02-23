# Deployment Guide

## Deployment Platforms

### Frontend (Vercel)
- Platform: Vercel
- Build Command: `npm run build`
- Output Directory: `build`
- Environment Variables:
  - `REACT_APP_API_URL`: Backend API URL

### Backend (Render)
- Platform: Render
- Runtime: Node.js
- Build Command: `npm install`
- Start Command: `npm run start`
- Environment Variables:
  - `MONGODB_URI`: MongoDB connection string
  - `JWT_SECRET`: Secret key for JWT authentication
  - `NODE_ENV`: Set to "production"
  - `EMAIL_USER`: Email service user
  - `EMAIL_PASSWORD`: Email service password

## Database
- Platform: MongoDB Atlas
- Version: Latest
- Connection: Via `MONGODB_URI` environment variable

## Deployment Steps

### Frontend (Vercel)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add environment variables
5. Deploy

### Backend (Render)
1. Push code to GitHub repository
2. Create a new Web Service on Render
3. Connect to GitHub repository
4. Configure build settings:
   - Environment: Node.js
   - Build Command: `npm install`
   - Start Command: `npm run start`
5. Add environment variables
6. Deploy

## Monitoring and Maintenance
- Vercel Dashboard: Monitor frontend deployment and performance
- Render Dashboard: Monitor backend logs and performance
- MongoDB Atlas: Monitor database metrics and performance

## Troubleshooting
Common issues and solutions:
1. Build failures: Check build logs for syntax errors or missing dependencies
2. Runtime errors: Check application logs in Render dashboard
3. Database connection issues: Verify MongoDB URI and network access settings
4. Environment variables: Ensure all required variables are properly set in both platforms
