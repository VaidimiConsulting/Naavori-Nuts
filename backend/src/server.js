import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import configRoutes from './routes/configRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://192.168.1.4:3000',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded product images statically
const uploadsPath = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/orders', orderRoutes);
app.use('/api/v1/admin/customers', customerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin/config', configRoutes);
app.use('/api/v1/admin/coupons', couponRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Health Check Endpoint
app.get('/api/v1/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    success: true,
    data: null,
    message: 'Server is running',
    dbConnected: dbStatus
  });
});

const server = app.listen(PORT, async () => {
  console.log(`\n✅ Naavori Backend running on http://localhost:${PORT}`);
  await testConnection();
});

// Graceful EADDRINUSE handling — show clear message instead of crash
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run this command to free the port and try again:`);
    console.error(`   npx kill-port ${PORT}\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
