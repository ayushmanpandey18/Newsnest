## 🌐 Live Demo
👉 [https://newsnest-eight.vercel.app](https://newsnest-eight.vercel.app)


# 🪺 NewsNest — Personalized News Dashboard

A full-stack web app where users sign up, pick their interests, and get a personalized news feed powered by the GNews API. Features bookmarks, likes, and notifications.

## Tech Stack

- **Frontend:** React + Vite, React Router, Axios, React Hot Toast
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens)
- **News API:** GNews API (free tier)
- **Deployment:** Vercel (frontend) + Railway (backend + DB)

---

## Project Structure

```
newsnest/
├── frontend/         # React + Vite app
│   └── src/
│       ├── components/   # Navbar, NewsCard
│       ├── pages/        # Home, Login, Register, Bookmarks, Notifications, Search, Profile
│       ├── context/      # AuthContext
│       └── utils/        # axios api instance
└── backend/          # Express API
    └── src/
        ├── controllers/  # auth, news, bookmarks, likes, notifications
        ├── routes/       # all API routes
        ├── middleware/   # JWT auth
        └── db/           # PostgreSQL pool + schema init
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL installed and running
- GNews API key (free at https://gnews.io)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/newsnest
JWT_SECRET=any_random_long_string_here
GNEWS_API_KEY=your_gnews_api_key
FRONTEND_URL=http://localhost:5173
```

Create the database in PostgreSQL:
```sql
CREATE DATABASE newsnest;
```

Start the backend:
```bash
npm run dev
```

The server auto-creates all tables on first run. ✅

---

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open http://localhost:5173 🚀

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Get current user |
| PUT | /api/auth/topics | ✅ | Update topic preferences |
| GET | /api/news?topic= | ✅ | Fetch news by topic |
| GET | /api/news/search?q= | ✅ | Search news |
| GET | /api/news/feed | ✅ | Personalized feed |
| POST | /api/bookmarks | ✅ | Add bookmark |
| GET | /api/bookmarks | ✅ | Get all bookmarks |
| DELETE | /api/bookmarks/:id | ✅ | Remove bookmark |
| POST | /api/likes/toggle | ✅ | Like/unlike article |
| GET | /api/likes | ✅ | Get liked article URLs |
| GET | /api/notifications | ✅ | Get notifications |
| PUT | /api/notifications/read | ✅ | Mark all as read |
| GET | /api/notifications/unread-count | ✅ | Get unread count |

---

## Deployment

### Backend → Railway

1. Push backend folder to GitHub
2. Create new project on railway.app
3. Add PostgreSQL plugin
4. Set environment variables (same as .env)
5. Set `DATABASE_URL` to Railway's PostgreSQL URL
6. Deploy ✅

### Frontend → Vercel

1. Push frontend folder to GitHub
2. Import project on vercel.com
3. Set environment variable:
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app/api
   ```
4. Deploy ✅

---

## Features

- ✅ JWT Authentication (Register / Login / Protected Routes)
- ✅ Personalized news feed based on selected topics
- ✅ Topic filter bar on home page
- ✅ Search news by keyword
- ✅ Bookmark articles (saved to DB)
- ✅ Like / Unlike articles
- ✅ Notifications system with unread badge
- ✅ Profile page with topic preference editor
- ✅ Responsive design (mobile friendly)
- ✅ Dark premium UI

---

## GNews API Free Tier Limits

- 100 requests per day
- Max 10 articles per request
- Supports topics: technology, business, sports, science, health, entertainment, world, nation

Get your free key at: https://gnews.io/register
