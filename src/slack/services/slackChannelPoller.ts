import { WebClient } from '@slack/web-api';
import { isAutoReplyEnabled } from './slackSettingsService';
import { generateAndDeliverDraft } from './slackDraftHelper';
import { prisma } from '../../db/prismaClient';
import { logger } from '../../utils/logger';

const POLL_INTERVAL_MS = 30_000;

let pollerTimer: ReturnType<typeof setInterval> | null = null;
// Track last-checked timestamp per channel so we don't reprocess
const lastChannelCheckAt = new Map<string, string>(); // channelId → oldest ts

export function startChannelPoller(): void {
  if (pollerTimer) return;
  logger.info('📢 Slack Channel poller started (interval: 30s)');
  pollerTimer = setInterval(() => void pollAllUsersChannels(), POLL_INTERVAL_MS);
  setTimeout(() => void pollAllUsersChannels(), 5000);
}

export function stopChannelPoller(): void {
  if (pollerTimer) {
    clearInterval(pollerTimer);
    pollerTimer = null;
    logger.info('Slack Channel poller stopped');
  }
}

// ─── Poll all connected users' channels ──────────────────────────────────────

async function pollAllUsersChannels(): Promise<void> {
  if (!(await isAutoReplyEnabled())) return;

  const workspaces = await (prisma.slackWorkspace as any).findMany({
    where: { userToken: { not: null }, slackUserId: { not: null } },
  });

  if (workspaces.length === 0) return;

  logger.info(`📢 Channel poll — checking ${workspaces.length} connected user(s)`);

  for (const workspace of workspaces) {
    try {
      await pollUserChannels(workspace);
    } catch (err) {
      logger.error('Channel poll error', { teamId: workspace.teamId, err: String(err) });
    }
  }
}

// ─── Poll a single user's channels ───────────────────────────────────────────

async function pollUserChannels(workspace: {
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

  // Use lastDMCheckAt as shared base, or 5 min ago on first run
  const since = workspace.lastDMCheckAt
    ? String(workspace.lastDMCheckAt.getTime() / 1000)
    : String((Date.now() - 5 * 60 * 1000) / 1000);

  // Get owner's display name
  let ownerName = workspace.slackUserId;
  try {
    const info = await userClient.users.info({ user: workspace.slackUserId });
    ownerName = (info.user as any)?.real_name ?? (info.user as any)?.name ?? ownerName;
  } catch {}

  // List all public + private channels the user is a member of
  let channels: any[] = [];
  try {
    const result = await userClient.conversations.list({
      types:            'public_channel,private_channel',
      exclude_archived: true,
      limit:            200,
    });
    // Only channels they are actually a member of
    channels = (result.channels ?? []).filter((c: any) => c.is_member);
  } catch (err) {
    logger.warn('Could not list channels', { userId: workspace.slackUserId, err: String(err) });
    return;
  }

  if (channels.length === 0) return;

  logger.info(`📢 Checking ${channels.length} channels for ${ownerName}`, { since });

  let drafted = 0;

  for (const channel of channels) {
    if (!channel.id) continue;

    // Use per-channel timestamp if available, else fall back to global since
    const channelSince = lastChannelCheckAt.get(channel.id) ?? since;

    try {
      const histResult = await userClient.conversations.history({
        channel: channel.id,
        oldest:  channelSince,
        limit:   20,
      });

      const messages = (histResult.messages ?? []).reverse(); // oldest first
      if (messages.length === 0) continue;

      // Update per-channel timestamp to latest message seen
      const latestTs = messages[messages.length - 1].ts;
      if (latestTs) lastChannelCheckAt.set(channel.id, latestTs);

      for (const msg of messages) {
        // Skip messages sent by the owner themselves or bots/system
        if (!msg.text?.trim() || msg.subtype || msg.bot_id) continue;
        if (msg.user === workspace.slackUserId) continue;
        if (!msg.ts) continue;

        await generateAndDeliverDraft({
          botClient,
          historyClient:    userClient,
          teamId:           workspace.teamId,
          channelId:        channel.id,
          messageTs:        msg.ts,
          threadTs:         msg.thread_ts,
          fromUserId:       msg.user ?? '',
          text:             msg.text,
          channelType:      'channel',
          recipientSlackId: workspace.slackUserId,
          ownerName,
        });

        drafted++;
      }
    } catch (err) {
      // Bot may not be able to read some channels — skip silently
      logger.debug('Could not read channel', { channelId: channel.id, err: String(err) });
    }
  }

  if (drafted > 0) {
    logger.info(`✅ Channel poll complete — ${drafted} new messages drafted for ${ownerName}`);
  }
}
