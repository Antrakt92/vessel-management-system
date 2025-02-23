# Vessel Management System

A modern web application for managing vessel information and service requests.

## Features

- Vessel tracking and management
- Service request generation
- Email integration for service requests
- User authentication
- Real-time vessel updates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
# Start frontend
npm start

# Start backend
npm run server
```

## Environment Variables

Create a `.env` file in the root directory with:

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## Tech Stack

- Frontend: React, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT
