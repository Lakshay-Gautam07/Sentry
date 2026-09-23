# 🛡️ Sentry — Travel Destination Intelligence

> Real-time global travel intelligence platform: weather forecasts, official disaster & government alerts, international news, destination imagery, curated travel videos, and AI-powered destination summaries — unified in a single dashboard.

---

## 🌟 Key Features

- 🔍 **Global Destination Search**: Auto-complete geocoding across worldwide cities and regions powered by Open-Meteo.
- ⛅ **Real-Time Weather & Forecasts**: Live temperature, apparent temperature, humidity, wind speed, weather condition codes, and multi-day daily forecasts.
- 🚨 **Disaster & Safety Alerts**: Real-time disaster alerts from **GDACS** (Global Disaster Alert and Coordination System) and official Indian alerts from **SACHET (NDMA)**.
- 📰 **Recent News & Articles**: International context-aware news queries via **GDELT DOC 2.0 API** with rate-limit protection and in-memory caching.
- 📸 **High-Resolution Imagery**: Curated destination photography dynamically retrieved from **Wikimedia Commons**.
- 🎥 **Travel Guides & Videos**: Curated travel video guides via **YouTube Data API v3** with quota-conserving caching.
- 🤖 **Gemini AI Travel Summary**: Synthesizes weather, safety, and local news into a concise, actionable travel briefing powered by Google Gemini.
- 💾 **Intelligent Persistence**: Automatic summary and destination caching in **MongoDB Atlas** with graceful offline fallback.

---

## 🏗️ Architecture & Project Structure

```text
Sentry/
├── backend/                  # Node.js + Express 5 REST API
│   ├── config/               # Database connection & env config
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose schemas (Destination, Summary)
│   ├── routes/               # API route definitions
│   ├── services/             # Third-party integrations (GDACS, SACHET, GDELT, Wikimedia, YouTube, Gemini)
│   ├── .env.example          # Backend environment variable template
│   ├── package.json
│   └── server.js             # Express application entry point
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/       # UI cards, alerts, news, media, modals
│   │   ├── lib/              # Axios API client
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Main application view & state
│   │   └── main.tsx
│   ├── .env.example          # Frontend environment variable template
│   ├── package.json
│   └── vite.config.ts
├── .gitignore                # Global ignore rules (secrets, dist, node_modules)
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** cluster or local MongoDB instance (optional; backend works with fallback if not provided)
- **API Keys**:
  - Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/))
  - YouTube Data API v3 key (from [Google Cloud Console](https://console.cloud.google.com/))

---

### 1. Clone the Repository

```bash
git clone https://github.com/Lakshay-Gautam07/Sentry.git
cd Sentry
```

---

### 2. Configure & Run Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file from example
cp .env.example .env
```

Open `backend/.env` and supply your keys:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sentry?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
# Development mode (auto-reload on changes)
npm run dev

# Or production mode
npm start
```

Verify backend health at [http://localhost:5000/api/health](http://localhost:5000/api/health).

---

### 3. Configure & Run Frontend

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file from example
cp .env.example .env
```

`frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|:---:|:---:|---|
| `PORT` | No | `5000` | Port on which the Express server listens. |
| `CLIENT_URL` | No | `*` / `http://localhost:5173` | Allowed frontend URL for CORS. Comma-separated if multiple (e.g. `https://sentry.vercel.app,http://localhost:5173`). |
| `MONGODB_URI` | No | _None_ | MongoDB Atlas connection string for persistent caching. |
| `GEMINI_API_KEY` | Recommended | _None_ | Google Gemini API key for AI summaries. (Deterministic fallback used if absent). |
| `YOUTUBE_API_KEY` | Recommended | _None_ | YouTube Data API v3 key for travel guides and videos. |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|:---:|:---:|---|
| `VITE_API_URL` | No | `http://localhost:5000` | Base URL of the deployed Sentry backend API (without trailing slash). |

> ⚠️ **Security Notice**: Never commit `.env` files or secrets to source control. Both `backend/.env` and `frontend/.env` are protected by `.gitignore`.

---

## 🌐 Production Deployment Guide

Sentry is structured as a decoupled client-server application, making it easy and cost-free to deploy the backend and frontend to leading cloud providers.

---

### Option A: Backend Deployment (e.g., Render / Railway / Fly.io)

#### Deploying on [Render](https://render.com) (Web Service)
1. **Create Web Service**: Connect your GitHub repository (`Lakshay-Gautam07/Sentry`).
2. **Configuration Settings**:
   - **Name**: `sentry-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables** (in Render Dashboard → Environment):
   - `PORT`: `5000` (or leave default, Render sets `PORT` automatically)
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `GEMINI_API_KEY`: `<Your Gemini API key>`
   - `YOUTUBE_API_KEY`: `<Your YouTube API key>`
   - `CLIENT_URL`: `<Your deployed frontend URL, e.g. https://sentry-travel.vercel.app>`
4. **Deploy**: Click **Create Web Service**. Note your backend URL (e.g., `https://sentry-api.onrender.com`).
5. **Verify**: Open `https://sentry-api.onrender.com/api/health` to confirm `{"status":"ok"}`.

---

### Option B: Frontend Deployment (e.g., Vercel / Netlify)

#### Deploying on [Vercel](https://vercel.com)
1. **Import Git Repository**: Select `Lakshay-Gautam07/Sentry`.
2. **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: `https://sentry-api.onrender.com` (your deployed backend URL)
4. **Deploy**: Click **Deploy**. Vercel will build and assign your production domain.
5. **Update Backend CORS**: Return to your backend settings (e.g. Render) and ensure `CLIENT_URL` matches your new Vercel domain.

---

## 📡 API Endpoints Reference

All requests and third-party integrations are mediated securely through the backend.

| Method | Endpoint | Query / Body Params | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Service health check and database connectivity status. |
| `GET` | `/api/destinations/search` | `?q={query}` | Search worldwide destinations with coordinates & country codes. |
| `GET` | `/api/weather` | `?lat={lat}&lon={lon}` | Current weather conditions and multi-day forecast. |
| `GET` | `/api/alerts` | `?lat={lat}&lon={lon}&country={code}` | Active disaster (GDACS) and national safety alerts (SACHET). |
| `GET` | `/api/news` | `?q={query}&country={country}` | Relevant recent destination articles via GDELT DOC 2.0. |
| `GET` | `/api/images` | `?q={query}` | Destination photo gallery from Wikimedia Commons. |
| `GET` | `/api/videos` | `?q={query}&country={country}` | Travel guides and video highlights via YouTube Data API v3. |
| `POST` | `/api/summary` | JSON body with destination, weather, alerts, news | Generates or retrieves cached Gemini AI Travel Summary. |

---

## 🛡️ Resilience & Security Best Practices

- **Zero Client-Side Secrets**: All API keys (Gemini, YouTube, MongoDB) stay strictly inside the backend environment.
- **Strict In-Memory & Database Caching**: YouTube API and GDELT DOC 2.0 requests are cached in-memory and MongoDB to protect API quotas and rate limits.
- **Graceful Degradation**: If any individual external source (e.g., YouTube quota or GDELT throttle) is unavailable, all other destination modules continue to function without interruption.
- **CORS Protection**: Flexible configurable origin validation prevents unauthorized cross-origin requests in production.

---

## 📜 License

This project is licensed under the ISC License.

*Built with ❤️ by Lakshay Gautam*
