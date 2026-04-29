# Architecture & Configuration Overview

## System Architecture

### Development Environment
```
Browser (localhost:5173)
    ↓
Vite Dev Server
    ├── Serves React app
    ├── Proxies /api/* → localhost:5000 (NO CORS needed)
    └── Hot reload on file changes

Express Server (localhost:5000)
    ├── Handles /api/* routes
    ├── Connects to MongoDB
    └── Doesn't serve frontend (dev only)
```

**Why Vite proxy?** Eliminates CORS issues during development. All API calls appear to come from same origin.

### Production Environment
```
Browser (your-app.onrender.com)
    ↓
Express Server (Render/Railway)
    ├── Serves React static files (client/dist/)
    ├── Handles /api/* routes
    └── Connects to MongoDB

Result: Single server handles frontend + API
        No separate frontend service needed
```

**Why single server?** Simpler deployment, no CORS needed (same origin), better performance.

---

## Configuration Files

### Frontend Configuration

#### `vite.config.js` (Dev Build Config)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,           // Frontend dev server port
    proxy: {
      '/api': {           // Intercept /api requests
        target: 'http://localhost:5000',  // Forward to backend
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',       // Build output directory
    sourcemap: false      // Disable source maps in prod
  }
})
```

**How it works:**
1. Frontend code: `fetch('/api/projects')`
2. Vite proxy intercepts this request
3. Proxy forwards to: `http://localhost:5000/api/projects`
4. Backend responds, proxy sends back to frontend
5. Frontend sees it as same-origin request (no CORS!)

#### `.env.development` (Frontend Dev Env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Used during `npm run dev` to tell Vite dev server about backend.

#### `.env.production` (Frontend Prod Env)
```env
VITE_API_BASE_URL=/api
```

Used during `npm run build`. Requests go to `/api` (relative path).
In production, backend serves frontend, so `/api` requests hit same server.

### Backend Configuration

#### `server/.env` (Backend Env)
```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/db
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

- `PORT` - Server listens on this port
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Key for signing JWTs
- `CLIENT_URL` - Used for CORS origin (must match frontend URL)
- `NODE_ENV` - Environment mode

#### `app.js` (Express CORS Config)
```javascript
const corsOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({ 
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

- `origin` - Only requests from this URL are allowed
- `credentials` - Allow cookies/auth headers
- `methods` - HTTP methods allowed
- `allowedHeaders` - Headers frontend can send

**In dev:** `CLIENT_URL=http://localhost:5173` (frontend)
**In prod:** `CLIENT_URL=https://your-app.onrender.com` (your domain)

---

## How Requests Flow

### Local Development

#### Frontend Makes API Request
```
React Component: fetch('/api/projects', { headers: { Authorization: 'Bearer ...' } })
    ↓
Vite Dev Server (localhost:5173) intercepts
    ↓
Looks at proxy config: '/api' → target: 'http://localhost:5000'
    ↓
Forwards to: localhost:5000/api/projects
    ↓
Express Server receives request with auth header
    ↓
Auth middleware validates JWT
    ↓
Controller fetches from MongoDB
    ↓
Response sent back through proxy
    ↓
React receives data
```

**Why no CORS error?**
- Browser sees request going to localhost:5173 (same origin)
- Proxy forwards behind the scenes
- CORS only relevant for cross-origin requests
- Proxy makes it same-origin from browser perspective

### Production

#### Frontend Makes API Request
```
React Component: fetch('/api/projects', { headers: { Authorization: 'Bearer ...' } })
    ↓
Browser: Making request to /api/projects
    ↓
Current page is on: your-app.onrender.com
    ↓
So browser makes: your-app.onrender.com/api/projects
    ↓
Same server (Render/Railway) receives it
    ↓
Express router: app.use('/api', projectRoutes)
    ↓
Controller fetches from MongoDB
    ↓
Response sent to browser
```

**Why no CORS error?**
- Frontend and backend are same origin
- No cross-origin request
- CORS not needed

---

## File Structure Impact

### What Gets Built

When you run `npm run build`:

```
client/
├── src/               ← Source code
│   ├── pages/
│   ├── components/
│   └── main.jsx
├── public/            ← Static assets
├── dist/              ← ✅ GENERATED HERE
│   ├── index.html     ← Entry point
│   ├── assets/        ← Bundled JS/CSS
│   └── ...
└── vite.config.js     ← Uses VITE_API_BASE_URL=/api (prod)
```

### What Gets Deployed

```
server/
├── src/
│   ├── server.js      ← Entry point
│   ├── app.js         ← Express setup
│   └── routes/        ← API routes
├── package.json
└── ...

client/dist/          ← ✅ BUILT FRONTEND
├── index.html
└── assets/

ROOT
├── package.json       ← npm scripts
└── index.js          ← Shim for Render/Railway
```

On Render/Railway:
1. `npm run build` creates `client/dist/`
2. `npm start` runs `node server/src/server.js`
3. Express: `app.use(express.static(path.join(__dirname, "../../client/dist")))`
4. Serves frontend at `/` and API at `/api/*`

---

## Environment Variable Resolution

### Frontend (React)

**In source code:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

**During `npm run dev`:**
- Vite reads `.env.development`
- Sets `VITE_API_BASE_URL=http://localhost:5000/api`
- React code uses: `http://localhost:5000/api`

**During `npm run build`:**
- Vite reads `.env.production`
- Sets `VITE_API_BASE_URL=/api`
- React code uses: `/api` (relative path)
- Bundled into `client/dist/` with this value embedded

**At runtime:**
- Vite serves built files from `client/dist/`
- No env vars needed (value is hardcoded in JS)
- Browser makes requests using embedded URL

### Backend (Node.js)

**In source code:**
```javascript
const port = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_URL }));
```

**At runtime:**
- Node reads `server/.env` (or Render/Railway env vars)
- Sets `process.env.PORT`, `process.env.CLIENT_URL`, etc.
- Server uses these values immediately

**Note:** .env files read at runtime, not build time. Different from frontend!

---

## Key Differences: Dev vs Production

| Aspect | Development | Production |
|---|---|---|
| **Servers** | 2 (Vite + Express) | 1 (Express only) |
| **Frontend Port** | 5173 | N/A (served by Express) |
| **Backend Port** | 5000 | 10000 (Render) or auto (Railway) |
| **API URL** | `http://localhost:5000/api` | `/api` (relative) |
| **CORS** | Not needed (proxy) | Strict origin check |
| **Build** | Done per-file (Vite) | Done once (`npm run build`) |
| **Rebuild on file change** | Automatic (hot reload) | Manual (redeploy) |
| **Source maps** | Yes (debugging) | No (smaller size) |

---

## Troubleshooting Guide by Architecture Layer

### Vite (Frontend Dev Server)
- **Problem:** Requests return 404 or ECONNREFUSED
- **Cause:** Backend not running or port wrong
- **Fix:** Ensure backend running on 5000, check proxy config

### Express (Backend)
- **Problem:** CORS error in console
- **Cause:** CLIENT_URL doesn't match frontend origin
- **Fix:** Verify CLIENT_URL env var matches frontend URL

### MongoDB
- **Problem:** "Cannot connect to MongoDB"
- **Cause:** Bad connection string or IP not whitelisted
- **Fix:** Verify MONGO_URI, add IP to MongoDB Atlas Network Access

### Frontend Build
- **Problem:** API requests fail in production
- **Cause:** Wrong VITE_API_BASE_URL in .env.production
- **Fix:** Ensure it's `/api` (not localhost URL)

### Deployment
- **Problem:** App won't start on Render/Railway
- **Cause:** Missing index.js shim or wrong start command
- **Fix:** Verify index.js exists at root, "start": "node server/src/server.js" in package.json

---

## Deployment Checklist (Quick Version)

Before deploying:
- [ ] `npm run build` succeeds (no errors)
- [ ] `npm start` runs without errors (backend starts)
- [ ] Local dev works (npm run dev on frontend works)
- [ ] All env vars set (MONGO_URI, JWT_SECRET, CLIENT_URL, PORT)
- [ ] No hardcoded URLs in code (use env vars)
- [ ] CORS origin matches production URL
- [ ] Secrets not in git (check .gitignore)

On deployment platform (Render/Railway):
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Environment variables set (PORT, MONGO_URI, JWT_SECRET, CLIENT_URL)
- [ ] CLIENT_URL matches your domain (e.g., `https://your-app.onrender.com`)

---

## Summary

**Architecture principle:** Single Express server handles both frontend and API in production, with Vite proxy in development.

**Configuration principle:** Separate configs for dev (localhost URLs) vs production (relative paths).

**Deployment principle:** Build frontend once, deploy with backend, serve both from one server.

**Security principle:** Secrets in env vars, never in code, always gitignored.
