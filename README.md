# Team Task Manager - Ethaara

A fast MVP for assignment/demo use with role-based project and task management.

## Tech Stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT + bcrypt

## Features

- Signup/Login with hashed passwords
- Role-based access (`admin`, `member`)
- Admin can create, edit, and delete projects
- Admin can add/remove members from projects
- Members can view assigned projects (read-only)
- Admin can create, edit, and delete tasks
- Members can view tasks and update their status
- Dashboard summary (`total`, `completed`, `pending`, `overdue`)

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login and get JWT token

### Users
- `GET /api/users` — Get all users (admin only)

### Projects
- `POST /api/projects` — Create project (admin/member)
- `GET /api/projects` — Get user's projects (admin sees all, member sees assigned)
- `PUT /api/projects/:id` — Update project title/description (admin only)
- `DELETE /api/projects/:id` — Delete project with cascade (admin only)
- `PATCH /api/projects/:id/members` — Add/remove members (admin only)

### Tasks
- `POST /api/tasks` — Create task (admin only)
- `GET /api/tasks/:projectId` — Get tasks in project
- `PUT /api/tasks/:id` — Update task (admin or assigned member)
- `DELETE /api/tasks/:id` — Delete task (admin only)

### Dashboard
- `GET /api/dashboard` — Get task summary
  - Response includes: `totalTasks`, `completedTasks`, `pendingTasks`, `overdueTasks`, `tasksByStatus`, `tasksPerUser`

---

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** — Get running in 5 minutes
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — How dev/prod environments work
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Complete local dev + production guide
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** — Pre-deployment validation

---

## Local Development

### Prerequisites
- Node.js 20+ 
- MongoDB Atlas account
- Git

### Quick Start

**Backend** (Terminal 1):
```bash
cd server
npm install
node src/server.js
# Output: 🔥 Server running on port 5000
```

**Frontend** (Terminal 2):
```bash
cd client
npm install
npm run dev
# Output: VITE ready on http://localhost:5173
```

### Configuration

**Backend** - Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** - Create `client/.env.development`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

---

## Production Deployment

### One-Command Deploy to Render or Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Create New Service**
   - Choose Render.com or Railway.app
   - Connect your GitHub repo
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Set Environment Variables**
   ```env
   PORT=10000
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/production-db
   JWT_SECRET=strong-production-secret
   CLIENT_URL=https://your-app-name.onrender.com
   NODE_ENV=production
   ```

4. **Deploy** — Service auto-starts and deploys

### How It Works

- Backend Express server runs on `PORT` (auto-assigned by Render/Railway)
- Frontend React build is compiled to `client/dist/`
- Backend serves frontend static files + API routes from single server
- All requests to `/api/*` handled by Express
- All other requests serve frontend for SPA routing
- Client uses `/api` (relative) for requests, so they hit the same backend

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production guide with troubleshooting.

---

## Architecture

```
Production: Single Server (Backend + Frontend)
  ├─ Listens on PORT (Render: 10000, Railway: auto)
  ├─ Serves frontend from /
  └─ Handles API from /api/*

Local Dev: Two Servers
  ├─ Frontend: Vite on localhost:5173
  ├─ Backend: Express on localhost:5000
  └─ Vite proxy forwards /api/* to localhost:5000
```

---

## Quick Demo Flow

1. **Signup**: Create admin account at `/signup`
2. **Login**: Login to access dashboard
3. **Create Project**: Admin creates project and selects members
4. **Manage Tasks**: Admin creates/edits/deletes tasks
5. **Member View**: Member user sees assigned projects (read-only) and can update task status
6. **Dashboard**: View task summary and statistics

---

## Project Structure

```
Ethaara/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/         # Login, Signup, Projects, Tasks, Dashboard
│   │   ├── components/    # ProtectedRoute
│   │   ├── context/       # AuthContext (auth state)
│   │   ├── lib/           # api.js (axios instance)
│   │   └── App.jsx
│   ├── vite.config.js     # Dev proxy + build config
│   └── .env.development   # Local env vars
│
├── server/                 # Node + Express backend
│   ├── src/
│   │   ├── routes/        # Auth, Projects, Tasks, Dashboard, Users
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Mongoose schemas
│   │   ├── middleware/    # Auth, role checks
│   │   ├── config/        # DB connection
│   │   ├── app.js         # Express setup + static serving
│   │   └── server.js      # Server bootstrap
│   └── .env               # Backend secrets
│
├── package.json           # Root build/start scripts
├── index.js              # Railway/Render entry point
├── DEPLOYMENT.md         # Complete deployment guide
├── PRODUCTION_CHECKLIST.md
└── README.md             # This file
```

---

## Troubleshooting

### Local Dev

**Issue**: "Cannot GET /api/projects" in browser
- **Fix**: Ensure backend is running on `localhost:5000`

**Issue**: "CORS error"
- **Fix**: Check `CLIENT_URL` in backend matches frontend URL (`http://localhost:5173`)

**Issue**: "Cannot find module" or "Cannot import"
- **Fix**: Run `npm install` in both `client/` and `server/` directories

### Production

**Issue**: Blank page or 404 in production
- **Fix**: Ensure backend builds frontend: `npm run build` creates `client/dist/`

**Issue**: API calls fail with 404
- **Fix**: Verify `VITE_API_BASE_URL=/api` in production build

**Issue**: MongoDB connection fails
- **Fix**: Verify `MONGO_URI` and add Render/Railway IP to MongoDB Atlas Network Access

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

---

## Security Notes

- JWT tokens stored in localStorage
- Passwords hashed with bcrypt
- Protected routes require valid JWT token
- Role-based access control (admin vs member)
- CORS configured per environment
- Environment secrets not committed to git

---

## License

ISC
