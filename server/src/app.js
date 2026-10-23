import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';

import productRoutes from './modules/products/product.routes.js';
import collectionRoutes from './modules/collections/collection.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import storefrontRoutes from './modules/storefront/storefront.routes.js';

const app = express();

// 1. CORS Configuration (Allows frontend origin and localhost ports)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// 2. JSON Body Parser with raw body hook for Webhooks
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith('/api/webhooks')) {
        req.rawBody = buf;
      }
    },
  })
);

// 3. Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', env: env.NODE_ENV, timestamp: new Date() });
});

// 4. API Endpoints
app.use('/api/products', productRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/storefront', storefrontRoutes);

// 5. 404 & Centralized Error Handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

export default app;
