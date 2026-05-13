import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

prisma.$on('warn', (e: { message: string }) => {
  logger.warn('Prisma warning', { message: e.message });
});

prisma.$on('error', (e: { message: string }) => {
  logger.error('Prisma error', { message: e.message });
});

export { prisma };
