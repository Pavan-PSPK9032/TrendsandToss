# Getting Started

<cite>
**Referenced Files in This Document**
- [backend/package.json](file://backend/package.json)
- [frontend/package.json](file://frontend/package.json)
- [backend/server.js](file://backend/server.js)
- [backend/config/db.js](file://backend/config/db.js)
- [frontend/vite.config.js](file://frontend/vite.config.js)
- [backend/Dockerfile](file://backend/Dockerfile)
- [backend/railway.toml](file://backend/railway.toml)
- [vercel-serverless/package.json](file://vercel-serverless/package.json)
- [backend/createAdmin.js](file://backend/createAdmin.js)
- [frontend/src/api/axios.js](file://frontend/src/api/axios.js)
- [backend/config/cloudinary.js](file://backend/config/cloudinary.js)
- [backend/utils/razorpay.js](file://backend/utils/razorpay.js)
- [frontend/src/App.jsx](file://frontend/src/App.jsx)
- [frontend/tailwind.config.js](file://frontend/tailwind.config.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Installation](#installation)
5. [Development Workflow](#development-workflow)
6. [Production Deployment](#production-deployment)
7. [Initial Verification](#initial-verification)
8. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
9. [Development Best Practices](#development-best-practices)
10. [Conclusion](#conclusion)

## Introduction
This guide helps you set up and run the E-commerce App locally, configure it for production, and deploy it using Docker, Railway, or Vercel serverless functions. It covers prerequisites, environment variables, backend and frontend installation, development servers, and deployment options.

## Prerequisites
- Node.js: The project requires a modern Node.js runtime. For local development, use a recent LTS version compatible with the repository’s engines configuration.
- Package manager: npm or yarn. The repository uses npm scripts and package manifests.
- MongoDB: The backend connects to a MongoDB instance via MONGO_URI.
- Optional integrations:
  - Cloudinary account for media storage (for image uploads)
  - Razorpay keys for payments
  - Stripe for payments (already included as a dependency)
- Operating system: Windows, macOS, or Linux.

**Section sources**
- [backend/package.json:1-27](file://backend/package.json#L1-L27)
- [frontend/package.json:1-25](file://frontend/package.json#L1-L25)
- [vercel-serverless/package.json:26-28](file://vercel-serverless/package.json#L26-L28)

## Environment Setup
Create a .env file in the backend directory with the following variables:
- MONGO_URI: MongoDB connection string
- JWT_SECRET: Secret for signing JSON Web Tokens
- FRONTEND_URL: Base URL for the frontend (used in CORS configuration)
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET: Cloudinary credentials for media uploads
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET: Payment provider credentials

Notes:
- CORS allows specific origins including localhost ports used by Vite and the configured FRONTEND_URL.
- The backend serves static images from the uploads directory.

**Section sources**
- [backend/server.js:22-49](file://backend/server.js#L22-L49)
- [backend/server.js:54-55](file://backend/server.js#L54-L55)
- [backend/config/db.js:5-12](file://backend/config/db.js#L5-L12)
- [backend/config/cloudinary.js:6-11](file://backend/config/cloudinary.js#L6-L11)
- [backend/utils/razorpay.js:5-8](file://backend/utils/razorpay.js#L5-L8)

## Installation
### Backend
1. Navigate to the backend directory.
2. Install dependencies:
   - npm install
3. Start the development server:
   - npm run dev
   - The server listens on port 5000 by default.

**Section sources**
- [backend/package.json:4-6](file://backend/package.json#L4-L6)
- [backend/server.js:80-85](file://backend/server.js#L80-L85)

### Frontend
1. Navigate to the frontend directory.
2. Install dependencies:
   - npm install
3. Start the development server:
   - npm run dev
   - The Vite dev server runs on port 5173 and proxies API requests to http://localhost:5000.

**Section sources**
- [frontend/package.json:4-6](file://frontend/package.json#L4-L6)
- [frontend/vite.config.js:6-14](file://frontend/vite.config.js#L6-L14)

### Optional: Create Admin User
Run the admin creation script to seed an admin user:
- node ../backend/createAdmin.js
- The script creates an admin with a default password and prints credentials.

**Section sources**
- [backend/createAdmin.js:8-34](file://backend/createAdmin.js#L8-L34)

## Development Workflow
- Frontend development server: http://localhost:5173
- Backend development server: http://localhost:5000
- API base URL in the frontend is configurable via VITE_API_URL; otherwise defaults to http://localhost:5000/api.
- The frontend uses React Router for navigation and Tailwind CSS for styling.

Recommended steps:
1. Start MongoDB locally or use a hosted service.
2. Set environment variables in the backend .env file.
3. Run backend dev server.
4. Run frontend dev server.
5. Access the app at http://localhost:5173.

**Section sources**
- [frontend/vite.config.js:6-14](file://frontend/vite.config.js#L6-L14)
- [frontend/src/api/axios.js:1-3](file://frontend/src/api/axios.js#L1-L3)
- [frontend/src/App.jsx:19-64](file://frontend/src/App.jsx#L19-L64)
- [frontend/tailwind.config.js:1-6](file://frontend/tailwind.config.js#L1-L6)

## Production Deployment
### Docker Containerization
- Build the image:
  - docker build -t ecommerce-backend .
- Run the container:
  - docker run -p 5000:5000 ecommerce-backend
- The Dockerfile installs production dependencies and exposes port 5000.

**Section sources**
- [backend/Dockerfile:1-18](file://backend/Dockerfile#L1-L18)

### Railway Deployment
- The project uses Nixpacks for building and sets a start command.
- Configure environment variables in Railway:
  - MONGO_URI
  - JWT_SECRET
  - FRONTEND_URL
  - Cloudinary and Razorpay credentials if integrating payments/media.

**Section sources**
- [backend/railway.toml:1-7](file://backend/railway.toml#L1-L7)

### Vercel Serverless Functions
- The vercel-serverless package.json includes scripts to run both backend and frontend concurrently and to start the backend server.
- Recommended approach:
  - Build the frontend (npm run build-frontend) and deploy the frontend to Vercel.
  - Deploy the backend as a serverless function or monorepo using the provided start command.

**Section sources**
- [vercel-serverless/package.json:5-9](file://vercel-serverless/package.json#L5-L9)

## Initial Verification
- Health check endpoint:
  - GET http://localhost:5000/api/health
  - Should return a JSON response indicating the server is running and CORS is enabled.
- CORS configuration:
  - The backend enables CORS for localhost Vite ports and the configured FRONTEND_URL.

**Section sources**
- [backend/server.js:65-72](file://backend/server.js#L65-L72)
- [backend/server.js:22-49](file://backend/server.js#L22-L49)

## Common Issues and Troubleshooting
- MongoDB connection errors:
  - Ensure MONGO_URI is correct and reachable.
  - Confirm the database is running and accessible.
- CORS errors:
  - Verify FRONTEND_URL matches the frontend origin.
  - Confirm allowed origins include http://localhost:5173 and http://localhost:3000.
- API proxy issues:
  - Ensure the frontend dev server is running on port 5173 and the backend is running on port 5000.
  - Check the proxy configuration in vite.config.js.
- Missing environment variables:
  - Add missing variables to the backend .env file (JWT_SECRET, MONGO_URI, optional payment and cloudinary keys).
- Admin user creation:
  - If the admin already exists, the script exits early. Re-run after removing the existing admin or adjust the script logic.

**Section sources**
- [backend/config/db.js:5-12](file://backend/config/db.js#L5-L12)
- [backend/server.js:22-49](file://backend/server.js#L22-L49)
- [frontend/vite.config.js:6-14](file://frontend/vite.config.js#L6-L14)
- [backend/createAdmin.js:13-18](file://backend/createAdmin.js#L13-L18)

## Development Best Practices
- Keep environment variables out of version control.
- Use consistent port usage:
  - Frontend: 5173
  - Backend: 5000
- Centralize API base URL configuration in the frontend via VITE_API_URL.
- Use the provided health check endpoint to verify server status during development and deployment.
- For production, ensure CORS origins are restricted to trusted domains.

**Section sources**
- [frontend/src/api/axios.js:1-3](file://frontend/src/api/axios.js#L1-L3)
- [backend/server.js:65-72](file://backend/server.js#L65-L72)

## Conclusion
You now have the prerequisites, environment configuration, and step-by-step instructions to run the E-commerce App locally, integrate optional services, and deploy it using Docker, Railway, or Vercel serverless functions. Use the health check endpoint and CORS configuration guidance to verify your setup and troubleshoot common issues.