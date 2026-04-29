# Team Task Manager

A fast MVP for assignment/demo use with role-based project and task management.

## Tech Stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT + bcrypt

## Features

- Signup/Login with hashed passwords
- Role-based access (`admin`, `member`)
- Admin can create projects and assign tasks
- Members can view tasks and update their status
- Dashboard summary (`total`, `completed`, `pending`, `overdue`)

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Projects

- `POST /api/projects` (admin)
- `GET /api/projects` (admin/member)
 - `PATCH /api/projects/:id/members` (admin) — body: `{ action: 'add'|'remove', memberId }`

### Tasks

- `POST /api/tasks` (admin)
- `GET /api/tasks/:projectId` (admin/member, project member only)
- `PUT /api/tasks/:id` (admin or assigned member)

### Dashboard

- `GET /api/dashboard/summary`
  
Response includes: `totalTasks`, `completedTasks`, `pendingTasks`, `overdueTasks`, `tasksByStatus`, `tasksPerUser`

## Local Setup

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Set values in `server/.env`:

- `PORT=5000`
- `MONGO_URI=<your atlas uri>`
- `JWT_SECRET=<your secret>`
- `CLIENT_URL=http://localhost:5173`

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Set value in `client/.env`:

- `VITE_API_BASE_URL=http://localhost:5000/api`

## Quick Demo Flow

1. Signup as `admin`.
2. Signup another user as `member`.
3. Admin creates a project and adds member IDs.
4. Admin creates a task assigned to member.
5. Member logs in and updates task status.
6. Dashboard reflects changes.

## Deployment (Railway)

1. Push repo to GitHub.
2. Create Railway service for backend (`server`).
3. Set backend env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
4. Create Railway service for frontend (`client`) with `VITE_API_BASE_URL` set to backend URL + `/api`.

Notes:
- Projects API supports adding/removing members after creation using the `PATCH /api/projects/:id/members` endpoint (admin only).
- Tasks include a `priority` field (`low|medium|high`) and the dashboard shows tasks by status and tasks per user.
