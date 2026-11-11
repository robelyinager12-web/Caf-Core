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
  if (
    e.message.includes('E57P01') ||
    e.message.includes('terminating connection due to administrator command')
  ) {
    logger.warn(
      'Neon terminated an idle database connection during compute suspension or restart',
      { timestamp: e.timestamp, target: e.target }
    );
    return;
  }

  logger.error('Prisma error', { error: e });
});

export async function connectDatabase(): Promise<void> {
  const retryDelaysMs = [1000, 2000, 4000, 8000, 15000, 20000, 20000, 20000, 20000];
  const maxAttempts = retryDelaysMs.length + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prisma.$connect();
      logger.info('Database connection established');
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        logger.error('Failed to connect to database after retries', { error });
        process.exit(1);
      }

      const delayMs = retryDelaysMs[attempt - 1];
      logger.warn(
        `Database connection attempt ${attempt}/${maxAttempts} failed; retrying in ${delayMs}ms`,
        { error }
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma };