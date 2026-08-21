import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'campunex_db',
    user: process.env.DB_USER || 'campunex_user',
    password: process.env.DB_PASSWORD || 'campunex_password',
    url: process.env.DATABASE_URL || 'postgres://campunex_user:campunex_password@localhost:5432/campunex_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  spatial: {
    matchingProximityMeters: parseInt(process.env.MATCHING_PROXIMITY_METERS || '500', 10),
  },
  otp: {
    expirationSeconds: parseInt(process.env.OTP_EXPIRATION_SECONDS || '300', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10),
  },
  dev: {
    enableSimulator: process.env.ENABLE_DEV_SIMULATOR === 'true',
  },
};
