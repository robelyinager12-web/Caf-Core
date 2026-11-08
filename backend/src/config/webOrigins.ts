import { env } from './env';

export const allowedOrigins = [
  'http://localhost:5173',
  env.clientUrl.replace(/\/$/, ''),
  'https://caf-core-wmyp.vercel.app',
];
