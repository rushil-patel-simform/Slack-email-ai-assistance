/**
 * Slack workspace service.
 * Loads persisted workspace tokens and provides a WebClient per workspace.
 */
import { WebClient } from '@slack/web-api';
import { prisma } from '../../db/prismaClient';
import { logger } from '../../utils/logger';

// In-memory cache: teamId → WebClient
const clientCache = new Map<string, WebClient>();

export async function getWorkspaceClient(teamId: string): Promise<WebClient> {
  if (clientCache.has(teamId)) return clientCache.get(teamId)!;

  const ws = await prisma.slackWorkspace.findUnique({ where: { teamId } });
  if (!ws) throw new Error(`No Slack workspace found for teamId: ${teamId}`);

  const client = new WebClient(ws.botToken);
  clientCache.set(teamId, client);
  return client;
}

export async function getAllWorkspaces() {
  return prisma.slackWorkspace.findMany({
    select: { teamId: true, teamName: true, botUserId: true, installedAt: true },
    orderBy: { installedAt: 'desc' },
  });
}

export async function getWorkspaceBotUserId(teamId: string): Promise<string> {
  const ws = await prisma.slackWorkspace.findUnique({
    where: { teamId },
    select: { botUserId: true },
  });
  return ws?.botUserId ?? '';
}

/** Invalidate the cached client for a workspace (call after token refresh). */
export function invalidateClientCache(teamId: string): void {
  clientCache.delete(teamId);
  logger.info(`Slack client cache cleared for ${teamId}`);
}
