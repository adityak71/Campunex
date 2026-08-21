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
import devRoutes from './routes/dev.routes.js';
import { initializeWebSocketHandlers } from './modules/websocket/socket.handler.js';
import { HealthCheckResponse } from '@campunex/shared';

const app = express();
const server = http.createServer(app);

// Socket.IO Server Setup
export const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientUrl,
    credentials: true,
  },
});

// Initialize WebSocket Event Handlers
initializeWebSocketHandlers(io);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rides', ridesRoutes);
app.use('/api/v1/trips', tripsRoutes);
app.use('/api/v1/dev', devRoutes);

// Health Check Endpoint
app.get('/health', async (_req, res) => {
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
