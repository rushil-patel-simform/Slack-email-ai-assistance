/**
 * Slack Settings Service
 * Reads and writes the SlackSettings singleton row (id = "global").
 */
import { prisma } from '../../db/prismaClient';
import { logger } from '../../utils/logger';

async function ensureSettings() {
  return prisma.slackSettings.upsert({
    where:  { id: 'global' },
    update: {},
    create: { id: 'global', autoReplyEnabled: true },
  });
}

export async function getSlackSettings() {
  return ensureSettings();
}

export async function isAutoReplyEnabled(): Promise<boolean> {
  const s = await ensureSettings();
  return s.autoReplyEnabled;
}

export async function enableAutoReply() {
  const s = await prisma.slackSettings.upsert({
    where:  { id: 'global' },
    update: { autoReplyEnabled: true },
    create: { id: 'global', autoReplyEnabled: true },
  });
  logger.info('Slack auto-reply ENABLED');
  return s;
}

export async function disableAutoReply() {
  const s = await prisma.slackSettings.upsert({
    where:  { id: 'global' },
    update: { autoReplyEnabled: false },
    create: { id: 'global', autoReplyEnabled: false },
  });
  logger.info('Slack auto-reply DISABLED');
  return s;
}
