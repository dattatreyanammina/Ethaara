# Quick Start Guide

Get Ethaara running locally in 5 minutes.

## 1️⃣ Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Git

## 2️⃣ Get Code
```bash
git clone <repo-url>
cd Ethaara
```

## 3️⃣ Configure Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your MongoDB details:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
JWT_SECRET=your-secret-key-123
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## 4️⃣ Configure Frontend

```bash
cd ../client
cp .env.example .env.development
```

File will contain (already set correctly):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 5️⃣ Install & Run

**Terminal 1 - Backend:**
```bash
cd server
npm install
node src/server.js

# Expected output:
# ✅ Database connected
# ✅ Indexes synced
# 🔥 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev

# Expected output:
# VITE v8.0.10 ready in X ms
#   ➜  Local:   http://localhost:5173/
```

## 6️⃣ Test It

1. Open http://localhost:5173
2. Sign up with email/password, choose **admin** role
3. Verify you see the dashboard
4. Go to Projects → Create a project
5. Success! ✅

## 🔍 Check Logs

**Backend logs** show all API requests:
```
POST /api/auth/signup 200 X.XXms
GET /api/projects 200 X.XXms
```

**Frontend console** should have NO errors or CORS warnings.

## 📚 Learn More

- **Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Production checklist**: See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- **Full README**: See [README.md](./README.md)

## 🚨 Troubleshooting

| Problem | Solution |
|---|---|
| "Cannot GET /api/projects" | Ensure backend is running on port 5000 |
| "Cannot find module" | Run `npm install` in both client/ and server/ |
| "CORS error" in console | This shouldn't happen with Vite proxy. Check backend logs. |
| Port 5000 already in use | Change PORT in server/.env or kill other process |
| MongoDB connection fails | Check MONGO_URI and IP whitelist in MongoDB Atlas |

## 🚀 Deploy to Production

Once tested locally:
1. Push to GitHub
2. Create new Render/Railway app
3. Set environment variables (MONGO_URI, JWT_SECRET, etc.)
4. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step production guide.

---

**Need help?** Check the error message in server logs or browser console and search [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section.
