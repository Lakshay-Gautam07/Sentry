import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import destinationsRouter from './routes/destinations.js';
import weatherRouter from './routes/weather.js';
import alertsRouter from './routes/alerts.js';
import newsRouter from './routes/news.js';
import imagesRouter from './routes/images.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start server
app.listen(PORT, () => {
  console.log(`🛡️  Sentry backend running on http://localhost:${PORT}`);
});
