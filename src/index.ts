import app from './app';
import { config } from './config';
import { prisma } from './db/prismaClient';
import { startEmailPollerJob } from './jobs/cronScheduler';
import { logger } from './utils/logger';
import { initSlackApp, stopSlackApp, slackCredentialsPresent } from './slack/slackApp';

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

  // ── Slack Bolt — Socket Mode (optional — only if credentials are configured) ─
  let slackStarted = false;
  if (slackCredentialsPresent()) {
    try {
      await initSlackApp();
      slackStarted = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`Slack integration skipped: ${msg}`);
    }
  } else {
    logger.info('ℹ️  Slack credentials not configured — Slack integration skipped');
    logger.info('   Set SLACK_SIGNING_SECRET, SLACK_APP_TOKEN, SLACK_BOT_TOKEN in .env to enable');
  }

  // Start Express server
  const server = app.listen(PORT, () => {
    logger.info(`🚀 AI Assistant running on http://localhost:${PORT}`);
    logger.info(`   Environment: ${config.server.nodeEnv}`);
    logger.info(`   Health check:      http://localhost:${PORT}/health`);
    logger.info(`   Gmail OAuth:       http://localhost:${PORT}/auth/google`);
    if (slackStarted) {
      logger.info(`   Slack settings:    http://localhost:${PORT}/slack/settings`);
      logger.info(`   Slack workspaces:  http://localhost:${PORT}/slack/workspaces`);
      logger.info(`   Slack replies:     http://localhost:${PORT}/slack/replies`);
    }
  });

  // Start background email polling job
  startEmailPollerJob();
  logger.info('📬 Email poller job started');

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await stopSlackApp();
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Database disconnected. Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT',  () => void shutdown('SIGINT'));
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
