import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Search paths for .env
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'campunex',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Aditya@2005',
    url: process.env.DATABASE_URL || 'postgres://postgres:Aditya@2005@localhost:5432/campunex',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-campunex-jwt-token-key-change-in-production',
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
    enableSimulator: process.env.ENABLE_DEV_SIMULATOR !== 'false',
  },
};
