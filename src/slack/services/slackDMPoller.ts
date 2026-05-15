/**
 * Slack DM Poller
 *
 * Runs every 30 seconds. For each connected user (anyone who did /slack/connect):
 *  1. Uses their personal user token (xoxp-) to list all their DM/group-DM channels
 *  2. Finds messages sent TO them since the last poll
 *  3. Ignores messages they sent themselves
 *  4. Generates an AI draft and sends it to them as a private bot DM
 *
 * This is the only way to monitor real personal DMs between two Slack users
 * without them going through the bot — requires the user's own OAuth token.
 */
import { WebClient } from '@slack/web-api';
import { isAutoReplyEnabled } from './slackSettingsService';
import { shouldSkipSlackMessage } from './slackFilterService';
import { generateAndDeliverDraft } from './slackDraftHelper';
import { prisma } from '../../db/prismaClient';
import { logger } from '../../utils/logger';

const POLL_INTERVAL_MS = 30_000;

let pollerTimer: ReturnType<typeof setInterval> | null = null;

export function startDMPoller(): void {
  if (pollerTimer) return; // already running
  logger.info('📡 Slack DM poller started (interval: 30s)');
  pollerTimer = setInterval(() => void pollAllUsers(), POLL_INTERVAL_MS);
  // Run immediately on start too
  setTimeout(() => void pollAllUsers(), 3000);
}

export function stopDMPoller(): void {
  if (pollerTimer) {
    clearInterval(pollerTimer);
    pollerTimer = null;
    logger.info('Slack DM poller stopped');
  }
}

// ─── Poll all connected users ─────────────────────────────────────────────────

async function pollAllUsers(): Promise<void> {
  if (!(await isAutoReplyEnabled())) return;

  // Get all workspaces where a user has connected (has userToken + slackUserId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workspaces = await (prisma.slackWorkspace as any).findMany({
    where: {
      userToken:   { not: null },
      slackUserId: { not: null },
    },
  });

  if (workspaces.length === 0) return;

  logger.info(`📡 DM poll — checking ${workspaces.length} connected user(s)`);

  for (const workspace of workspaces) {
    try {
      await pollUserDMs(workspace);
    } catch (err) {
      logger.error('DM poll error for workspace', { teamId: workspace.teamId, err: String(err) });
    }
  }
}

// ─── Poll a single user's DMs ─────────────────────────────────────────────────

async function pollUserDMs(workspace: {
  teamId: string;
  botToken: string;
  userToken: string | null;
  slackUserId: string | null;
  botUserId: string;
  teamName: string;
  lastDMCheckAt: Date | null;
}): Promise<void> {
  if (!workspace.userToken || !workspace.slackUserId) return;

  const userClient = new WebClient(workspace.userToken);
  const botClient  = new WebClient(workspace.botToken);

  // Determine oldest timestamp to check (last poll time, or 5 minutes ago on first run)
  const since = workspace.lastDMCheckAt
    ? String(workspace.lastDMCheckAt.getTime() / 1000)
    : String((Date.now() - 5 * 60 * 1000) / 1000);

  // Get owner's display name
  let ownerName = workspace.slackUserId;
  try {
    const info = await userClient.users.info({ user: workspace.slackUserId });
    ownerName = (info.user as any)?.real_name ?? (info.user as any)?.name ?? ownerName;
  } catch {}

  // List all DM and group-DM conversations for this user
  let dmChannels: any[] = [];
  try {
    const result = await userClient.conversations.list({
      types:             'im,mpim',
      exclude_archived:  true,
      limit:             200,
    });
    dmChannels = result.channels ?? [];
  } catch (err) {
    logger.warn('Could not list DM channels', { userId: workspace.slackUserId, err: String(err) });
    return;
  }

  logger.info(`Checking ${dmChannels.length} DM channels for ${ownerName}`, { since });

  let newMessagesFound = 0;

  for (const channel of dmChannels) {
    if (!channel.id) continue;

    try {
      // Fetch messages in this DM since last check
      const histResult = await userClient.conversations.history({
        channel: channel.id,
        oldest:  since,
        limit:   20,
      });

      const messages = (histResult.messages ?? []).reverse(); // oldest first

      for (const msg of messages) {
        // Skip messages the user sent themselves
        if (msg.user === workspace.slackUserId) continue;
        // Skip bot messages, system messages, empty
        if (msg.bot_id || msg.subtype || !msg.text?.trim()) continue;

        const filterResult = shouldSkipSlackMessage({
          botId:        msg.bot_id,
          subtype:      msg.subtype,
          username:     msg.username,
          text:         msg.text,
          selfBotUserId: workspace.botUserId,
          fromUserId:   msg.user ?? '',
        });
        if (filterResult.skip) continue;

        newMessagesFound++;
        logger.info('📬 New DM found for user', {
          owner: ownerName, from: msg.user, text: msg.text?.slice(0, 60),
        });

        const channelType = channel.is_mpim ? 'mpim' : 'im';

        await generateAndDeliverDraft({
          botClient,
          historyClient:    userClient,
          teamId:           workspace.teamId,
          channelId:        channel.id,
          messageTs:        msg.ts ?? '',
          threadTs:         msg.thread_ts,
          fromUserId:       msg.user ?? '',
          text:             msg.text,
          channelType,
          recipientSlackId: workspace.slackUserId!,
          ownerName,
        });
      }
    } catch (err) {
      // Non-fatal — skip this channel and continue
      logger.warn('Error reading DM channel', { channelId: channel.id, err: String(err) });
    }
  }

  if (newMessagesFound > 0) {
    logger.info(`✅ DM poll complete — ${newMessagesFound} new messages drafted for ${ownerName}`);
  }

  // Update last check timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma.slackWorkspace as any).update({
    where: { teamId: workspace.teamId },
    data:  { lastDMCheckAt: new Date() },
  });
}
