import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: env.isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
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