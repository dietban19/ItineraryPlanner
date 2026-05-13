import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import placeImagesRouter from './server/routes/placeImages.routes.js';
import placeCacheRouter from './server/routes/placeCache.routes.js';
import weatherRouter from './server/routes/weather.routes.js';
import prayerRouter from './server/routes/prayer.routes.js';
import { connectDB } from './server/config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Global rate limiter: max 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Stricter limiter for Google Places API routes to protect billing
const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many place search requests, please slow down.' },
});

// Routes – apply strict rate limiter to Google Places API endpoints
app.use('/api/place-image', placesLimiter);
app.use('/api/places', placesLimiter);
app.use('/api', placeImagesRouter);
app.use('/api', placeCacheRouter);
app.use('/api', weatherRouter);
app.use('/api', prayerRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack ?? err.message ?? err);
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({ error: err.message ?? 'Internal server error' });
});

async function start() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  server.on('close', () => {
    console.log('Server closed');
  });
}

start();

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});
