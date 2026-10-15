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
import customerRoutes from './routes/customerRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

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
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.startsWith('http://192.168.') ||
      origin === process.env.CLIENT_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
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
app.use('/api/v1/admin/inventory', inventoryRoutes);
app.use('/api/v1/admin/deliveries', deliveryRoutes);
app.use('/api/v1/admin/notifications', notificationRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin/config', configRoutes);
app.use('/api/v1/admin/coupons', couponRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);

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

// Self-healing EADDRINUSE handling — auto-clears stale port and re-binds
server.on('error', async (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`\n⚠️ Port ${PORT} was busy. Auto-releasing port ${PORT}...`);
    try {
      const { execSync } = await import('child_process');
      if (process.platform === 'win32') {
        const out = execSync(`netstat -ano | findstr :${PORT}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
        const lines = out.split('\n').filter(l => l.includes('LISTENING'));
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== String(process.pid)) {
            try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); } catch {}
          }
        }
      }
      setTimeout(() => {
        app.listen(PORT, async () => {
          console.log(`\n✅ Naavori Backend recovered and running on http://localhost:${PORT}`);
          await testConnection();
        });
      }, 600);
    } catch {
      console.error(`\n❌ Port ${PORT} is in use. Run: npx kill-port ${PORT}\n`);
      process.exit(1);
    }
  } else {
    throw err;
  }
});
