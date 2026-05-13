import app from './app';
import { config } from './config';
import { prisma } from './db/prismaClient';
import { startEmailPollerJob } from './jobs/cronScheduler';
import { logger } from './utils/logger';

const PORT = config.server.port;

async function bootstrap(): Promise<void> {
  // Verify database connection
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (err) {
    logger.error('Failed to connect to database', { err });
    process.exit(1);
  }

  // Start Express server
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Gmail AI Assistant running on http://localhost:${PORT}`);
    logger.info(`   Environment: ${config.server.nodeEnv}`);
    logger.info(`   Health check: http://localhost:${PORT}/health`);
    logger.info(`   OAuth login:  http://localhost:${PORT}/auth/google`);
  });

  // Start background email polling job
  startEmailPollerJob();
  logger.info('📬 Email poller job started');

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Database disconnected. Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { err });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { err });
  process.exit(1);
});
