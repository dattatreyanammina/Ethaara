ETHAARA - Team Task Manager (Full Stack Application)

---

## PROJECT OVERVIEW

Ethaara is a full-stack team task management application designed for collaborative project workflows. It supports role-based access, project tracking, task assignments, and dashboard insights.

Tech Stack:

* Frontend: React (Vite)
* Backend: Node.js, Express.js
* Database: MongoDB Atlas
* Authentication: JWT

---

## FEATURES

* User Authentication (Signup/Login)
* Role-Based Access (Admin, Manager, Member)
* Project Management
* Task Assignment & Tracking
* Dashboard Overview
* Secure API with JWT
* Fully deployed (Frontend + Backend on same service)

---

## PROJECT STRUCTURE

Ethaara/
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── dist/               # Production build
│   └── package.json
│
├── server/                 # Backend (Node + Express)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── config/
│   └── package.json
│
├── package.json            # Root config
└── README.txt

---

## ENVIRONMENT VARIABLES

Backend (.env):
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173 (for local)

# In production:

# CLIENT_URL=https://your-render-url

Frontend (.env.development):
VITE_API_BASE_URL=http://localhost:5000/api

Frontend (.env.production):
VITE_API_BASE_URL=/api

---

## LOCAL DEVELOPMENT SETUP

1. Clone the repository:
   git clone <repo-url>
   cd Ethaara

2. Install dependencies:
   npm install
   cd client
   npm install
   cd ..

3. Start backend:
   npm start

4. Start frontend:
   cd client
   npm run dev

5. Open in browser:
   http://localhost:5173

---

## PRODUCTION BUILD

Build frontend:
cd client
npm run build

Serve frontend via backend (Express static middleware is used).

---

## DEPLOYMENT (RENDER)

Build Command:
npm install && npm run build

Start Command:
npm start

Environment Variables:

* MONGO_URI
* JWT_SECRET
* CLIENT_URL (set to deployed frontend URL)

---

## API ENDPOINTS

Auth:
POST   /api/auth/signup
POST   /api/auth/login

Users:
GET    /api/users

Projects:
GET    /api/projects
POST   /api/projects

Tasks:
GET    /api/tasks
POST   /api/tasks

Dashboard:
GET    /api/dashboard

Health Check:
GET    /api/health

---

## COMMON ISSUES & FIXES

1. 404 on login/signup
   → Ensure API calls include `/api`

2. CORS Errors
   → Set correct CLIENT_URL in backend

3. API hitting localhost in production
   → Rebuild frontend after updating env variables

4. Vite env not updating
   → Restart dev server or rebuild project

---

## FUTURE IMPROVEMENTS

* Notifications system
* Real-time updates (WebSockets)
* File attachments
* Advanced analytics dashboard
* Mobile responsiveness improvements

---

## AUTHOR

Dattatreya Nammina

---

## END
