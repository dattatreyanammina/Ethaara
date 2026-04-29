# Deployment Guide

This guide covers local development and production deployment for Ethaara (Render/Railway).

## Table of Contents
1. [Local Development](#local-development)
2. [Production Deployment](#production-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites
- Node.js 20+ (tested on 22.22.2)
- MongoDB Atlas account with a cluster
- Git

### Setup

#### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd Ethaara

# Root install (optional, mostly for utilities)
npm install

# Client setup
cd client
npm install

# Server setup
cd ../server
npm install
```

#### 2. Configure Environment Variables

**Backend** - Create `server/.env`:
```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your-secret-key-change-for-production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** - Create `client/.env.development`:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

See [Environment Configuration](#environment-configuration) for production values.

#### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm install
node src/server.js
# Output: 🔥 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Output: VITE v8.0.10 ready in X ms
#          ➜  Local:   http://localhost:5173/
```

#### 4. Test the Application

1. Open http://localhost:5173
2. Sign up with a test admin account:
   - Email: `admin@test.com`
   - Password: `password123`
   - Role: `admin`
3. Create a project and add members
4. Switch to member role in browser DevTools (simulate member user)
5. Verify member can view assigned projects

### How Local Dev Works

- **Frontend (Vite)**: Runs on `http://localhost:5173`
- **Backend (Express)**: Runs on `http://localhost:5000`
- **API Proxy**: Vite's `server.proxy` (in `vite.config.js`) forwards `/api/*` requests to `http://localhost:5000`
  - This means: `fetch('/api/projects')` → `http://localhost:5000/api/projects`
  - **CORS is NOT used in dev** because requests go through the proxy
- **CORS (disabled in dev)**: The proxy eliminates the need for CORS in development

---

## Production Deployment

### Overview
In production, the backend serves the frontend static files (built from `client/dist/`). A single server handles both:
- Static frontend files at `/` and `/index.html`
- API routes at `/api/...`
- React routing fallback (SPA)

### Deployment to Render or Railway

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

#### Step 2: Create a New Service on Render/Railway
- **Repository**: Select your GitHub repo
- **Environment**: Node.js
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

#### Step 3: Set Environment Variables
In your Render/Railway dashboard, add environment variables:

```env
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/production-db
JWT_SECRET=production-secret-key-change-me
CLIENT_URL=https://your-app-name.onrender.com
NODE_ENV=production
```

**Important**: 
- `CLIENT_URL` must match your final production URL (e.g., `https://your-app.onrender.com`)
- Change `JWT_SECRET` to a strong, unique value

#### Step 4: Deploy
- Render/Railway will automatically:
  1. Run `npm run build` which:
     - Installs client dependencies
     - Builds React with Vite to `client/dist/`
  2. Run `npm start` which:
     - Starts Node.js server on PORT 10000 (Render) or auto-assigned (Railway)
     - Connects to MongoDB
     - Syncs Mongoose indexes
     - Serves frontend from `client/dist/`

#### Step 5: Test
1. Navigate to your production URL
2. Sign up / Log in
3. Verify API calls work (check Network tab in DevTools)
4. All API calls should go to `https://your-app.onrender.com/api/...`

---

## Environment Configuration

### Environment Variables Explained

#### Backend (server/.env)

| Variable | Dev Value | Prod Value | Purpose |
|---|---|---|---|
| `PORT` | `5000` | `10000` (Render) or auto | Server port |
| `MONGO_URI` | Test cluster | Production cluster | MongoDB connection string |
| `JWT_SECRET` | Test secret | Strong random string | JWT signing key |
| `CLIENT_URL` | `http://localhost:5173` | `https://your-app.onrender.com` | CORS origin (frontend URL) |
| `NODE_ENV` | `development` | `production` | Environment mode |

#### Frontend

**Local Dev** - `client/.env.development`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
- Frontend at `localhost:5173` makes requests to backend at `localhost:5000/api`
- Vite proxy forwards requests

**Production** - `client/.env.production`:
```env
VITE_API_BASE_URL=/api
```
- Frontend at `your-app.onrender.com` makes requests to `/api`
- Backend serves frontend AND API from same host
- Request to `/api/projects` becomes `https://your-app.onrender.com/api/projects`

### How to Use Environment Variables

**Frontend** (React):
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// In dev: http://localhost:5000/api
// In prod: /api
```

**Backend** (Node.js):
```javascript
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
```

### Building for Production

```bash
# From root directory
npm run build

# This runs: cd client && npm install && npm run build
# Output: Creates client/dist/ with optimized React build
```

---

## Troubleshooting

### Frontend Issues

#### Issue: "Cannot GET /projects" or blank page in production
- **Cause**: Frontend not being served by backend
- **Fix**: Verify `app.js` has:
  ```javascript
  app.use(express.static(path.join(__dirname, "../../client/dist")));
  app.get("*", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));
  ```

#### Issue: API calls fail with 404 in production
- **Cause**: Wrong `VITE_API_BASE_URL`
- **Fix**: Ensure `client/.env.production` has `VITE_API_BASE_URL=/api`
- **Verify**: Check Network tab in DevTools - requests should go to `/api/...`

#### Issue: "CORS error" in browser console
- **Cause**: `CLIENT_URL` in backend doesn't match frontend URL
- **Fix**: In production, set `CLIENT_URL=https://your-app.onrender.com`
- **Verify**: CORS should only show in dev if proxy is misconfigured

### Backend Issues

#### Issue: "Cannot find module" or "Cannot import"
- **Cause**: Dependencies not installed or Node version mismatch
- **Fix**: 
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

#### Issue: MongoDB connection fails
- **Cause**: Wrong `MONGO_URI` or IP whitelist
- **Fix**: 
  1. Verify connection string in `.env`
  2. In MongoDB Atlas: Network Access → add your Render/Railway IP (or 0.0.0.0 for testing)

#### Issue: "500 Internal Server Error"
- **Cause**: Index sync issues or validation errors
- **Fix**: 
  1. Check server logs for error message
  2. If "E11000 duplicate key error": ensure `User.syncIndexes()` ran at startup
  3. Check database for orphaned indexes

#### Issue: "Port already in use"
- **Cause**: Another process on the port
- **Fix**: 
  ```bash
  # Windows PowerShell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  
  # Linux/Mac
  lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
  ```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Production                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend User Visits: https://your-app.com        │
│         ↓                                           │
│  Express Server Serves: client/dist/index.html      │
│         ↓                                           │
│  React App Loads (VITE_API_BASE_URL=/api)           │
│         ↓                                           │
│  User Clicks "Fetch Projects"                      │
│         ↓                                           │
│  React Code: fetch('/api/projects')                │
│         ↓                                           │
│  Browser Request: POST /api/projects               │
│         ↓                                           │
│  Same Express Server Handles at /api/projects/*    │
│         ↓                                           │
│  Database Query + Response                         │
│         ↓                                           │
│  React State Updates                               │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  Local Development                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend: Vite Dev Server on localhost:5173       │
│         ↓                                           │
│  React App Loads (VITE_API_BASE_URL=localhost:5000)│
│         ↓                                           │
│  User Clicks "Fetch Projects"                      │
│         ↓                                           │
│  React Code: fetch('/api/projects')                │
│         ↓                                           │
│  Vite Proxy Intercepts (from vite.config.js)       │
│         ↓                                           │
│  Request Forwarded to: localhost:5000/api/projects │
│         ↓                                           │
│  Express Server Handles at /api/projects/*         │
│         ↓                                           │
│  Database Query + Response                         │
│         ↓                                           │
│  React State Updates                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Commands

| Command | Purpose |
|---|---|
| `npm run build` | Build frontend for production |
| `npm start` | Start backend server |
| `cd client && npm run dev` | Start frontend dev server |
| `cd server && node src/server.js` | Start backend manually |

### URLs

| Environment | Frontend | Backend | API |
|---|---|---|---|
| Local Dev | `localhost:5173` | `localhost:5000` | `localhost:5000/api` |
| Production (Render) | `your-app.onrender.com` | Same | `your-app.onrender.com/api` |

### Key Files

| File | Purpose |
|---|---|
| `vite.config.js` | Vite build config + dev proxy |
| `server/src/app.js` | Express setup + CORS + static serving |
| `server/src/server.js` | Server bootstrap + DB connection |
| `client/src/lib/api.js` | Axios instance with auth header |
| `client/src/context/AuthContext.jsx` | Auth state + token management |
| `.env.example` files | Template for environment variables |

---

## Support

For issues:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review server logs: `npm start` or Render/Railway dashboard
3. Check browser console (DevTools → Console)
4. Verify environment variables are set correctly
