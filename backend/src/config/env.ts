import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),

  databaseUrl: requireEnv('DATABASE_URL'),

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 200),
  },

  upload: {
    dir: process.env.UPLOAD_DIR ?? 'uploads/menu-images',
    maxSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5),
  },

  isProduction: process.env.NODE_ENV === 'production',
};