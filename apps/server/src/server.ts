import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { checkDbConnection } from './config/db.js';
import { checkRedisConnection } from './config/redis.js';
import { runMigrations } from './db/migrate.js';
import { runSeeds } from './db/seed.js';
import authRoutes from './routes/auth.routes.js';
import ridesRoutes from './routes/rides.routes.js';
import tripsRoutes from './routes/trips.routes.js';
import adminRoutes from './routes/admin.routes.js';
import devRoutes from './routes/dev.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import supportRoutes from './routes/support.routes.js';
import { initializeWebSocketHandlers } from './modules/websocket/socket.handler.js';
import { HealthCheckResponse } from '@campunex/shared';

const app = express();
const server = http.createServer(app);

// Allowed CORS Origins (supports comma-separated URLs and Vercel preview domains)
const allowedOrigins = (config.clientUrl || 'http://localhost:3000')
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''));

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  const clean = origin.replace(/\/$/, '');
  if (allowedOrigins.includes('*') || allowedOrigins.includes(clean)) return true;
  if (allowedOrigins.some((o) => o.includes('vercel.app')) && clean.endsWith('.vercel.app')) return true;
  return false;
};

// Socket.IO Server Setup
export const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    credentials: true,
  },
});

// Initialize WebSocket Event Handlers
initializeWebSocketHandlers(io);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/rides', ridesRoutes);
app.use('/api/v1/trips', tripsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/dev', devRoutes);

// Health Check Endpoint
app.get('/health', async (_req: express.Request, res: express.Response) => {
  const dbStatus = await checkDbConnection();
  const redisStatus = await checkRedisConnection();

  const isHealthy = dbStatus.connected && dbStatus.postgis && redisStatus;

  const response: HealthCheckResponse = {
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      postgres: dbStatus.connected,
      postgis: dbStatus.postgis,
      redis: redisStatus,
    },
  };

  res.status(isHealthy ? 200 : 503).json(response);
});

// WebSocket basic connection listener
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, async () => {
    console.log(`🚀 Campunex Server running on http://localhost:${config.port}`);
    console.log(`📍 Spatial matching proximity threshold: ${config.spatial.matchingProximityMeters}m`);
    try {
      await runMigrations();
      await runSeeds();
    } catch (err) {
      console.error('Failed to initialize database on startup:', err);
    }
  });
}

export { app, server };
