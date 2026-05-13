import { prisma } from '../db/prismaClient';
import { logger } from '../utils/logger';

const SETTINGS_ID = 'global'; // Single-row settings record

/**
 * Gets the global AppSettings record, creating it with defaults if missing.
 */
export async function getAppSettings(): Promise<{ id: string; autoDraftEnabled: boolean }> {
  let settings = await prisma.appSettings.findFirst();
  if (!settings) {
    settings = await prisma.appSettings.create({
      data: { id: SETTINGS_ID, autoDraftEnabled: true },
    });
    logger.info('AppSettings initialised with defaults');
  }
  return settings;
}

/**
 * Enables automatic draft generation.
 */
export async function enableAutoDraft(): Promise<{ autoDraftEnabled: boolean }> {
  const settings = await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { autoDraftEnabled: true },
    create: { id: SETTINGS_ID, autoDraftEnabled: true },
  });
  logger.info('Auto-draft ENABLED');
  return { autoDraftEnabled: settings.autoDraftEnabled };
}

/**
 * Disables automatic draft generation.
 */
export async function disableAutoDraft(): Promise<{ autoDraftEnabled: boolean }> {
  const settings = await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { autoDraftEnabled: false },
    create: { id: SETTINGS_ID, autoDraftEnabled: false },
  });
  logger.info('Auto-draft DISABLED');
  return { autoDraftEnabled: settings.autoDraftEnabled };
}

/**
 * Returns whether auto-draft is currently enabled.
 */
export async function isAutoDraftEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.autoDraftEnabled;
}
