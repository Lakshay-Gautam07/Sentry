# 🛡️ Sentry — Travel Destination Intelligence

> Search any destination worldwide and get weather alerts, news, images, YouTube travel videos, and an AI travel summary — all in one place.

---

## Project Structure

```
Sentry/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express REST API
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

---

### Backend

```bash
cd backend
cp .env.example .env      # Fill in your API keys
npm start                 # Production
npm run dev               # Development (auto-restarts on save)
```

**Health check:**
```bash
curl http://localhost:5000/api/health
```

---

### Frontend

```bash
cd frontend
npm run dev               # Starts Vite dev server on http://localhost:5173
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `PORT` | Backend port (default `5000`) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `MONGODB_URI` | MongoDB connection string |

> ⚠️ **Never** commit `.env` or hardcode API keys anywhere in the source.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |

---

## Roadmap

| Phase | Feature |
|---|---|
| 0 ✅ | Project scaffold (React + Express) |
| 1 | Geocoding + Weather (Open-Meteo) |
| 2 | Disaster Alerts (GDACS / SACHET) |
| 3 | News (GDELT) |
| 4 | Images (Wikimedia Commons) |
| 5 | YouTube Travel Videos |
| 6 | AI Travel Summary (Gemini) |

---

## Tech Stack

**Frontend:** React · Vite · Tailwind CSS · React Router · Axios · Lucide React  
**Backend:** Node.js · Express · Axios · dotenv · CORS

---

*Built by Lakshay Gautam*
