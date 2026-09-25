import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import destinationsRouter from './routes/destinations.js';
import weatherRouter from './routes/weather.js';
import alertsRouter from './routes/alerts.js';
import newsRouter from './routes/news.js';
import imagesRouter from './routes/images.js';
import videosRouter from './routes/videos.js';
import summaryRouter from './routes/summary.js';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = config.port;

// Connect to MongoDB
connectDB();

// CORS configuration for local and production deployment
const preApprovedOrigins = [
  'https://sentry-1msyreljc-lakshay-s-projects9.vercel.app',
  'https://sentry-lakshay-s-projects9.vercel.app',
  'https://*.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
];

const configuredOrigins = config.clientUrl
  ? config.clientUrl.split(',').map((url) => url.trim().replace(/\/+$/, ''))
  : [];

const allowedOrigins = Array.from(new Set([...preApprovedOrigins, ...configuredOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, Render health probes)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');

      // If CLIENT_URL is not set or is '*', permit all origins
      if (!config.clientUrl || configuredOrigins.includes('*') || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Check exact match in allowed origins
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      // Check wildcard patterns if specified (e.g., https://*-user.vercel.app)
      const matchesWildcard = allowedOrigins.some((allowed) => {
        if (!allowed.includes('*')) return false;
        const pattern = new RegExp('^' + allowed.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
        return pattern.test(cleanOrigin);
      });
      if (matchesWildcard) {
        return callback(null, true);
      }

      // Allow local development origins
      if (cleanOrigin.startsWith('http://localhost:') || cleanOrigin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

// Root route for cloud platform health checks & discovery
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Sentry Travel Intelligence API',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/destinations', destinationsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/news', newsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/videos', videosRouter);
app.use('/api/summary', summaryRouter);

// 404 Handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found.',
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[server] Uncaught error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🛡️  Sentry backend running on port ${PORT}`);
});
