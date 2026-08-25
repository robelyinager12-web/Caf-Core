import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: env.isProduction
    ? [{ emit: 'event', level: 'error' }, { emit: 'event', level: 'warn' }]
    : [{ emit: 'event', level: 'query' }, { emit: 'event', level: 'error' }],
});

// Log slow queries (>200ms) even in development, to catch N+1s and missing
// indexes early rather than discovering them under production load.
prisma.$on('query' as never, (e: any) => {
  if (e.duration > 200) {
    logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
  }
});

prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma error', { error: e });
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma };