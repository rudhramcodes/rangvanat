import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// 1. Minimal CORS (Only frontend origin)
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

// 2. JSON Body Parser with raw body hook for Webhooks
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/api/webhooks')) {
      req.rawBody = buf;
    }
  },
}));

// 3. Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', env: env.NODE_ENV });
});

// 4. 404 & Centralized Error Handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

export default app;
