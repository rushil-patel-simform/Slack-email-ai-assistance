/**
 * Slack OAuth helpers.
 *
 * TWO OAuth flows:
 *  1. Bot install  → /slack/install   → gets xoxb- bot token (for posting)
 *  2. User connect → /slack/connect   → gets xoxp- user token (for monitoring YOUR DMs/channels)
 *
 * The user token is what enables "reply on your behalf":
 *  - Reads YOUR conversations (im, mpim, channels)
 *  - Posts messages AS YOU in those conversations
 */
import { WebClient } from '@slack/web-api';
import { prisma } from '../../db/prismaClient';
import { logger } from '../../utils/logger';
import { config } from '../../config';

// ── Bot install URL (grants bot scopes) ──────────────────────────
export function buildInstallUrl(): string {
  const params = new URLSearchParams({
    client_id:    config.slack.clientId,
    scope:        [
      'app_mentions:read',
      'channels:history',
      'chat:write',
      'groups:history',
      'im:history',
      'im:write',
      'mpim:history',
      'mpim:write',
      'users:read',
    ].join(','),
    redirect_uri: config.slack.redirectUri,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

// ── User connect URL (grants user scopes so we can act as the user) ──
export function buildUserConnectUrl(): string {
  const params = new URLSearchParams({
    client_id:    config.slack.clientId,
    user_scope:   [
      'channels:history',
      'channels:read',
      'chat:write',
      'groups:history',
      'groups:read',
      'im:history',
      'im:read',
      'im:write',
      'mpim:history',
      'mpim:read',
      'mpim:write',
      'users:read',
    ].join(','),
    redirect_uri: config.slack.redirectUri,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

// ── Bot OAuth callback ────────────────────────────────────────────
export async function handleOAuthCallback(code: string): Promise<{
  teamId: string;
  teamName: string;
}> {
  const client = new WebClient();

  const result = await client.oauth.v2.access({
    client_id:     config.slack.clientId,
    client_secret: config.slack.clientSecret,
    code,
    redirect_uri:  config.slack.redirectUri,
  });

  if (!result.ok || !result.access_token) {
    throw new Error(`Slack OAuth failed: ${result.error ?? 'unknown error'}`);
  }

  const botToken  = result.access_token;
  const teamId    = (result.team as { id: string }).id;
  const teamName  = (result.team as { name: string }).name ?? 'Unknown Workspace';
  const botUserId = (result.bot_user_id as string) ?? '';
  const scope     = (result.scope as string) ?? '';

  // Also grab user token if returned (happens when user_scope was requested)
  const authedUser = result.authed_user as { id?: string; access_token?: string } | undefined;
  const userToken   = authedUser?.access_token ?? null;
  const slackUserId = authedUser?.id ?? null;

  await prisma.slackWorkspace.upsert({
    where:  { teamId },
    update: { teamName, botToken, botUserId, scope, userToken, slackUserId, updatedAt: new Date() },
    create: { teamId, teamName, botToken, botUserId, scope, userToken, slackUserId },
  });

  logger.info(`Slack workspace installed: ${teamName} (${teamId}) | userToken=${userToken ? 'YES' : 'NO'}`);
  return { teamId, teamName };
}

// ── User connect callback (stores xoxp- user token) ──────────────
export async function handleUserConnectCallback(code: string): Promise<{
  teamId: string;
  slackUserId: string;
}> {
  const client = new WebClient();

  const result = await client.oauth.v2.access({
    client_id:     config.slack.clientId,
    client_secret: config.slack.clientSecret,
    code,
    redirect_uri:  config.slack.redirectUri,
  });

  if (!result.ok) {
    throw new Error(`Slack user OAuth failed: ${result.error ?? 'unknown error'}`);
  }

  const teamId      = (result.team as { id: string }).id;
  const authedUser  = result.authed_user as { id?: string; access_token?: string } | undefined;
  const userToken   = authedUser?.access_token;
  const slackUserId = authedUser?.id ?? '';

  if (!userToken) throw new Error('No user token returned — make sure user_scope was requested');

  await prisma.slackWorkspace.update({
    where:  { teamId },
    data:   { userToken, slackUserId, updatedAt: new Date() },
  });

  logger.info(`Slack user token stored for workspace ${teamId} | userId=${slackUserId}`);
  return { teamId, slackUserId };
}
