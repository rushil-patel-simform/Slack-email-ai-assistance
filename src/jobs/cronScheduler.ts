import cron from 'node-cron';
import { config } from '../config';
import { pollAllUsers } from './emailPoller';
import { logger } from '../utils/logger';

let isRunning = false;

/**
 * Starts the cron job that polls emails on a schedule.
 * Default: every minute.
 * Prevents overlapping runs with a lock flag.
 */
export function startEmailPollerJob(): void {
  const cronExpression = config.jobs.pollIntervalCron;

  if (!cron.validate(cronExpression)) {
    throw new Error(`Invalid cron expression: ${cronExpression}`);
  }

  logger.info(`Email poller scheduled with cron: "${cronExpression}"`);

  cron.schedule(cronExpression, async () => {
    if (isRunning) {
      logger.warn('Email poll job already running, skipping this tick.');
      return;
    }

    isRunning = true;
    try {
      await pollAllUsers();
    } catch (err) {
      logger.error('Unhandled error in email poll job', { err });
    } finally {
      isRunning = false;
    }
  });
}
