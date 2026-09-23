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
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

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
  console.log(`🛡️  Sentry backend running on http://localhost:${PORT}`);
});
