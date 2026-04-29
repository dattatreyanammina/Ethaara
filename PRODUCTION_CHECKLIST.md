# Production Readiness Checklist

Use this checklist to verify your Ethaara application is ready for production deployment.

## ✅ Configuration

- [ ] **API Base URL Handling**
  - [ ] `client/src/lib/api.js` uses `import.meta.env.VITE_API_BASE_URL`
  - [ ] `client/.env.development` has `VITE_API_BASE_URL=http://localhost:5000/api`
  - [ ] `client/.env.production` has `VITE_API_BASE_URL=/api`
  - [ ] No hardcoded URLs like `localhost:5000` in production code

- [ ] **Vite Proxy Configuration**
  - [ ] `client/vite.config.js` has proxy for `/api` → `http://localhost:5000`
  - [ ] Dev server port is `5173` (default)
  - [ ] Proxy only applies in development (not production build)

- [ ] **CORS Configuration**
  - [ ] `server/src/app.js` has CORS middleware
  - [ ] `CLIENT_URL` environment variable is used for CORS origin
  - [ ] In dev: `CLIENT_URL=http://localhost:5173`
  - [ ] In prod: `CLIENT_URL=https://your-app-domain.com`

- [ ] **Frontend Static Serving**
  - [ ] `server/src/app.js` uses `app.use(express.static(...)` for `client/dist`
  - [ ] React fallback route exists: `app.get("*", (req, res) => ...)`
  - [ ] Fallback serves `index.html` for SPA routing

- [ ] **Backend Environment Variables**
  - [ ] `server/.env` has all required variables:
    - [ ] `PORT` (5000 for local, auto-assigned for Render/Railway)
    - [ ] `MONGO_URI` (MongoDB connection string)
    - [ ] `JWT_SECRET` (unique, strong secret)
    - [ ] `CLIENT_URL` (frontend URL for CORS)
    - [ ] `NODE_ENV` (development/production)
  - [ ] Secrets are NOT committed to git (check .gitignore)

- [ ] **Frontend Environment Configuration**
  - [ ] `.env.development` is in root of `client/`
  - [ ] `.env.production` is in root of `client/`
  - [ ] `.env.example` documents all variables
  - [ ] `.env*` files are gitignored (except `.env.example`)

## ✅ Authentication & Security

- [ ] **Auth Token Management**
  - [ ] Tokens stored in localStorage: `localStorage.setItem('token', token)`
  - [ ] Token retrieved on app load: `const token = localStorage.getItem('token')`
  - [ ] Token set in axios headers immediately: `setAuthToken(token)`
  - [ ] No race condition between auth init and API calls

- [ ] **JWT Configuration**
  - [ ] JWT_SECRET is strong (minimum 32 characters)
  - [ ] JWT_SECRET is different in dev and production
  - [ ] JWT_SECRET is never committed to git

- [ ] **Protected Routes**
  - [ ] `ProtectedRoute.jsx` checks token before rendering
  - [ ] Unauthenticated users redirected to login
  - [ ] Auth middleware on backend protects `/api/` endpoints
  - [ ] Role-based access control works: `requireRole("admin")`

## ✅ Build & Deployment

- [ ] **Build Script**
  - [ ] Root `package.json` has `"build": "cd client && npm install && npm run build"`
  - [ ] Build creates `client/dist/` directory
  - [ ] Build minifies and optimizes frontend code

- [ ] **Start Script**
  - [ ] Root `package.json` has `"start": "node server/src/server.js"`
  - [ ] Server starts correctly: `npm start`
  - [ ] No syntax errors on startup

- [ ] **Entry Point Shim**
  - [ ] `index.js` exists at repo root
  - [ ] `index.js` imports ES modules: `await import('./server/src/server.js')`
  - [ ] Render/Railway can start with `node index.js`

- [ ] **Dependencies**
  - [ ] Root `package.json` lists all required packages
  - [ ] `client/package.json` has React, Vite, Axios, etc.
  - [ ] `server/package.json` has Express, Mongoose, JWT, etc.
  - [ ] No dev dependencies in production build

## ✅ Database

- [ ] **MongoDB Connection**
  - [ ] MongoDB Atlas account created
  - [ ] Cluster configured and accessible
  - [ ] Connection string in `MONGO_URI` is valid
  - [ ] Network access allows app server IP (or 0.0.0.0 for testing)

- [ ] **Mongoose Models**
  - [ ] `User` model has proper schema and validation
  - [ ] `Project` model has proper schema and validation
  - [ ] `Task` model has proper schema and validation
  - [ ] Indexes are synced at startup: `User.syncIndexes()`, etc.

- [ ] **Collections**
  - [ ] Collections exist in MongoDB (auto-created on first use)
  - [ ] No stale indexes or duplicate key errors

## ✅ API Endpoints

- [ ] **Authentication Endpoints**
  - [ ] `POST /api/auth/signup` - creates user and returns token
  - [ ] `POST /api/auth/login` - returns token for valid credentials
  - [ ] Tokens are JWTs and expire correctly

- [ ] **Project Endpoints**
  - [ ] `GET /api/projects` - returns user's projects
  - [ ] `POST /api/projects` - creates new project (admin/member)
  - [ ] `PUT /api/projects/:id` - updates project (admin only)
  - [ ] `DELETE /api/projects/:id` - deletes project (admin only)
  - [ ] `PATCH /api/projects/:id/members` - add/remove members

- [ ] **User Endpoints**
  - [ ] `GET /api/users` - returns all users (admin only)
  - [ ] Includes: `name`, `email`, `role`, `createdAt`

- [ ] **Dashboard Endpoint**
  - [ ] `GET /api/dashboard` - returns task summary
  - [ ] Admins see all tasks; members see assigned tasks only

- [ ] **Task Endpoints**
  - [ ] `GET /api/tasks` - returns tasks (filtered by role)
  - [ ] `POST /api/tasks` - creates task
  - [ ] `PUT /api/tasks/:id` - updates task
  - [ ] `DELETE /api/tasks/:id` - deletes task

## ✅ Frontend Features

- [ ] **Login/Signup Page**
  - [ ] Form submits to `/api/auth/signup` or `/api/auth/login`
  - [ ] Success stores token and redirects to dashboard
  - [ ] Errors display user-friendly messages
  - [ ] No CORS errors in console

- [ ] **Projects Page**
  - [ ] Admin can create, edit, delete projects
  - [ ] Admin can add/remove members with user picker
  - [ ] Members see only assigned projects (read-only)
  - [ ] All API calls succeed with proper auth header

- [ ] **Dashboard Page**
  - [ ] Shows task summary for user
  - [ ] Admins see all tasks; members see assigned tasks
  - [ ] No 401 Unauthorized errors

- [ ] **React Routing**
  - [ ] SPA routing works: page doesn't reload on route change
  - [ ] Direct URL navigation works (e.g., `/projects` on page load)
  - [ ] Protected routes redirect unauthenticated users to login

## ✅ Local Development Testing

Before deploying, test locally:

```bash
# 1. Start backend
cd server
npm install
node src/server.js

# 2. In another terminal, start frontend
cd client
npm run dev

# 3. Test signup
# - Navigate to http://localhost:5173/signup
# - Create admin account
# - Verify signup succeeds and token is stored

# 4. Test login
# - Logout and login again
# - Verify token is used for protected routes

# 5. Test projects CRUD
# - Create project with members
# - Edit project
# - Delete project
# - Add/remove members

# 6. Test as member
# - Create member account
# - Assign member to project
# - Verify member sees project (read-only)

# 7. Check console
# - No 404, 401, 403, or 500 errors
# - No CORS warnings
# - All API calls use Bearer token
```

## ✅ Production Deployment Testing

After deploying to Render/Railway:

- [ ] **Frontend Loads**
  - [ ] Navigate to app URL: content loads
  - [ ] No 404 or blank page
  - [ ] Styling loads correctly (Tailwind CSS)

- [ ] **Auth Flow**
  - [ ] Signup creates user successfully
  - [ ] Login returns valid token
  - [ ] Token persists on page reload
  - [ ] Logout clears token

- [ ] **API Calls**
  - [ ] Check Network tab in DevTools
  - [ ] Requests go to correct URL (e.g., `/api/projects`, not `localhost:5000/api/projects`)
  - [ ] Requests include `Authorization: Bearer <token>` header
  - [ ] No CORS errors

- [ ] **Project Management**
  - [ ] Admin can CRUD projects
  - [ ] Admin can manage members
  - [ ] Members see only assigned projects

- [ ] **Error Handling**
  - [ ] Invalid login shows error message
  - [ ] Failed API calls handled gracefully
  - [ ] No unhandled JavaScript errors in console

## ✅ Security Review

- [ ] **Secrets**
  - [ ] JWT_SECRET is strong and unique per environment
  - [ ] MongoDB password is secure
  - [ ] No secrets in source code
  - [ ] Sensitive files gitignored

- [ ] **CORS**
  - [ ] CORS origin matches frontend URL
  - [ ] Credentials allowed if needed
  - [ ] Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

- [ ] **Authentication**
  - [ ] Passwords hashed with bcrypt
  - [ ] JWT tokens expire (if configured)
  - [ ] Protected routes reject invalid tokens

- [ ] **Authorization**
  - [ ] Members cannot access admin endpoints
  - [ ] Admins can access all endpoints
  - [ ] Users cannot modify other users' data

## ✅ Performance & Monitoring

- [ ] **Logging**
  - [ ] Server logs startup message: "🔥 Server running on port X"
  - [ ] Morgan middleware logs requests (dev mode)
  - [ ] Errors logged with full stack trace

- [ ] **Database Optimization**
  - [ ] Indexes are created automatically (`syncIndexes()`)
  - [ ] No N+1 query problems
  - [ ] Connection pooling configured

- [ ] **Frontend Performance**
  - [ ] React build is minified (production mode)
  - [ ] Static files have far-future cache headers
  - [ ] No console warnings or errors

## 🚀 Deployment Readiness Summary

**Before Deploying:**
- [ ] All checkboxes above are checked
- [ ] Local tests pass completely
- [ ] No warnings or errors in console/logs
- [ ] Secrets are configured per environment
- [ ] Build script runs successfully

**Deployment Steps:**
1. Push to GitHub with all changes
2. Create new app on Render/Railway
3. Set environment variables (PORT, MONGO_URI, JWT_SECRET, CLIENT_URL)
4. Deploy (build will run automatically)
5. Verify app is accessible and working
6. Monitor logs for any errors

**Post-Deployment:**
1. Test signup/login
2. Create and manage projects
3. Check Network tab for API call URLs
4. Monitor error logs for issues
5. Set up alerts for crashes (Render/Railway dashboard)

---

**Date of Checklist Creation**: [Today]  
**Last Updated**: [Today]  
**Status**: Ready for Production ✅
