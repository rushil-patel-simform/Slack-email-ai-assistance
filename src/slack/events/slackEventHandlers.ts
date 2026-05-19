/**
 * Slack Event Handlers — DRAFT MODE
 *
 * When someone DMs the bot or @mentions the bot in a channel:
 *  1. Fetch full conversation history (last 15 msgs) for context
 *  2. If in a thread, fetch thread replies too
 *  3. Generate an AI draft reply
 *  4. Send the DRAFT privately to the workspace owner (you) via DM
 *  5. Save the draft in the DB
 *
 * The owner reviews the draft and sends it manually — nothing is auto-posted.
 */
import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { generateSlackReply, ConversationMessage } from '../ai/slackPromptService';
import { shouldSkipSlackMessage } from '../services/slackFilterService';
import { isAlreadyProcessed, markProcessed } from '../services/slackMessageService';
import { isAutoReplyEnabled } from '../services/slackSettingsService';
import { getWorkspaceBotUserId } from '../services/slackWorkspaceService';
import { generateAndDeliverDraft } from '../services/slackDraftHelper';
import { prisma } from '../../db/prismaClient';
import { logger } from '../../utils/logger';

// ─── Name cache ──────────────────────────────────────────────────────────────
const nameCache = new Map<string, string>();

// ─── Resolve user IDs → display names ───────────────────────────────────────
async function resolveNames(client: WebClient, messages: any[]): Promise<ConversationMessage[]> {
  const out: ConversationMessage[] = [];
  for (const m of messages) {
    if (!m.text || m.subtype === 'channel_join') continue;
    let name = 'Unknown';
    if (m.bot_id) {
      name = m.username ?? 'Bot';
    } else if (m.user) {
      if (nameCache.has(m.user)) {
        name = nameCache.get(m.user)!;
      } else {
        try {
          const info = await client.users.info({ user: m.user });
          name = (info.user as any)?.real_name ?? (info.user as any)?.name ?? m.user;
          nameCache.set(m.user, name);
        } catch { name = m.user; }
      }
    }
    out.push({ senderName: name, text: m.text, isBot: Boolean(m.bot_id) });
  }
  return out;
}

// ─── Fetch conversation history ──────────────────────────────────────────────
async function fetchConversationHistory(client: WebClient, channelId: string, beforeTs: string, limit = 15): Promise<ConversationMessage[]> {
  try {
    const result = await client.conversations.history({ channel: channelId, latest: beforeTs, limit, inclusive: false });
    return await resolveNames(client, (result.messages ?? []).reverse());
  } catch (err) {
    logger.warn('Could not fetch conversation history', { err: String(err) });
    return [];
  }
}

// ─── Fetch thread replies ────────────────────────────────────────────────────
async function fetchThreadHistory(client: WebClient, channelId: string, threadTs: string, currentTs: string): Promise<ConversationMessage[]> {
  try {
    const result = await client.conversations.replies({ channel: channelId, ts: threadTs });
    const messages = (result.messages ?? []).filter((m: any) => m.ts !== currentTs);
    return await resolveNames(client, messages);
  } catch (err) {
    logger.warn('Could not fetch thread history', { err: String(err) });
    return [];
  }
}

// ─── Core draft handler ──────────────────────────────────────────────────────
async function handleIncomingMessage(params: {
  client: WebClient; teamId: string; channelId: string; messageTs: string;
  userId: string; text: string; threadTs?: string; botId?: string | null;
  subtype?: string | null; username?: string | null; channelType: 'channel' | 'im' | 'mpim';
}): Promise<void> {
  const { client, teamId, channelId, messageTs, userId, text, threadTs, channelType } = params;

  try {
    if (!(await isAutoReplyEnabled())) {
      logger.info('Slack drafting DISABLED — skipping', { messageTs });
      return;
    }

    if (await isAlreadyProcessed(messageTs, channelId)) {
      logger.debug('Already processed — skipping', { messageTs });
      return;
    }

    const selfBotUserId = await getWorkspaceBotUserId(teamId);

    const filterResult = shouldSkipSlackMessage({
      botId: params.botId, subtype: params.subtype, username: params.username,
      text, selfBotUserId, fromUserId: userId,
    });

    if (filterResult.skip) {
      logger.info(`Skipped [${filterResult.reason}]`, { messageTs });
      await markProcessed({ messageTs, channelId, teamId, userId, text, replied: false, skipped: true, skipReason: filterResult.reason });
      return;
    }

    await markProcessed({ messageTs, channelId, teamId, userId, text, replied: false, skipped: false });

    // Resolve sender name
    let senderName = 'User';
    try {
      const userInfo = await client.users.info({ user: userId });
      senderName = (userInfo.user as any)?.real_name ?? (userInfo.user as any)?.name ?? 'User';
      nameCache.set(userId, senderName);
    } catch {}

    // Fetch history
    logger.info('Fetching conversation history…', { channelId });
    const conversationHistory = await fetchConversationHistory(client, channelId, messageTs);

    let threadHistory: ConversationMessage[] = [];
    if (threadTs && threadTs !== messageTs) {
      logger.info('Fetching thread history…', { threadTs });
      threadHistory = await fetchThreadHistory(client, channelId, threadTs, messageTs);
    }

    // Get owner info
    const workspace = await prisma.slackWorkspace.findUnique({ where: { teamId } });
    let ownerName = 'User';
    const ownerSlackId = workspace?.slackUserId ?? workspace?.botUserId;
    if (workspace?.slackUserId) {
      try {
        const ownerInfo = await client.users.info({ user: workspace.slackUserId });
        ownerName = (ownerInfo.user as any)?.real_name ?? (ownerInfo.user as any)?.name ?? 'User';
      } catch {}
    }

    // Generate AI draft
    logger.info('Generating AI draft', { senderName, historyCount: conversationHistory.length, threadCount: threadHistory.length });

    const draftText = await generateSlackReply({
      senderName, ownerName, channelType, messageText: text,
      conversationHistory,
      threadHistory: threadHistory.length > 0 ? threadHistory : undefined,
    });

    if (!draftText) {
      logger.warn('AI returned empty draft', { messageTs });
      return;
    }

    // Save draft to DB
    await prisma.slackDraft.upsert({
      where:  { messageTs_channelId: { messageTs, channelId } },
      update: { draftText, status: 'pending', updatedAt: new Date() },
      create: { teamId, channelId, messageTs, threadTs, fromUserId: userId, fromName: senderName, originalText: text, draftText },
    });

    // Send draft as private DM to owner
    if (!ownerSlackId) {
      logger.warn('No owner Slack ID — cannot send draft DM', { teamId });
      return;
    }

    const locationLabel = channelType === 'im' ? 'DM' : channelType === 'mpim' ? 'Group DM' : `<#${channelId}>`;
    const threadLabel   = threadTs && threadTs !== messageTs ? ' _(in thread)_' : '';
    const contextLabel  = conversationHistory.length > 0
      ? `_Context: ${conversationHistory.length} previous messages${threadHistory.length > 0 ? ` + ${threadHistory.length} thread messages` : ''}_`
      : '';

    const draftMessage =
      `📝 *Draft reply ready* — ${locationLabel}${threadLabel}\n` +
      `*From:* ${senderName}\n` +
      `*Message:* _"${text.slice(0, 200)}${text.length > 200 ? '…' : ''}"_\n` +
      `${contextLabel}\n\n` +
      `*Suggested reply:*\n>${draftText.replace(/\n/g, '\n>')}\n\n` +
      `_Review and edit as needed, then send it yourself in ${locationLabel}._`;

    const dmResult = await client.conversations.open({ users: ownerSlackId });
    const dmChannelId = (dmResult.channel as any)?.id;

    if (dmChannelId) {
      await client.chat.postMessage({ channel: dmChannelId, text: draftMessage, mrkdwn: true });
      logger.info('✅ Draft delivered to owner via DM', { ownerSlackId, draftLen: draftText.length });
    }

    await markProcessed({ messageTs, channelId, teamId, userId, text, replied: true, skipped: false });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('Error handling Slack message', { err: msg, messageTs, channelId });
  }
}

// ─── Register event listeners ─────────────────────────────────────────────────
export function registerSlackEventHandlers(app: App): void {

  app.event('app_mention', async ({ event, client, context }) => {
    logger.info('🔔 app_mention received', { user: event.user, channel: event.channel, text: event.text });
    await handleIncomingMessage({
      client,
      teamId:      (context.teamId as string) ?? '',
      channelId:   event.channel,
      messageTs:   event.ts,
      userId:      event.user ?? '',
      text:        event.text ?? '',
      threadTs:    event.thread_ts,
      channelType: 'channel',
    });
  });

  app.event('message', async ({ event, client, context }) => {
    const msg = event as any;

    logger.info('🔔 message event received', {
      channel_type: msg.channel_type, user: msg.user,
      bot_id: msg.bot_id, subtype: msg.subtype, text: msg.text?.slice(0, 80),
    });

    if (msg.channel_type !== 'im' && msg.channel_type !== 'mpim') {
      logger.info(`⏭️  Skipping — not a DM (channel_type=${msg.channel_type})`);
      return;
    }

    await handleIncomingMessage({
      client,
      teamId:      (context.teamId as string) ?? '',
      channelId:   msg.channel,
      messageTs:   msg.ts,
      userId:      msg.user ?? '',
      text:        msg.text ?? '',
      threadTs:    msg.thread_ts,
      botId:       msg.bot_id,
      subtype:     msg.subtype,
      username:    msg.username,
      channelType: msg.channel_type === 'mpim' ? 'mpim' : 'im',
    });
  });
}

// ─── Channel message handler — drafts for ALL channel messages ───────────────
export function registerChannelMentionHandler(app: App): void {
  app.event('message', async ({ event, client, context }) => {
    const msg = event as any;

    // Only channel/group messages (DMs handled by DM poller)
    if (msg.channel_type !== 'channel' && msg.channel_type !== 'group') return;
    // Skip bots, system messages, empty text
    if (msg.bot_id || msg.subtype || !msg.text?.trim()) return;

    const teamId = (context.teamId as string) ?? '';

    // Find the connected workspace owner
    const workspace = await (prisma as any).slackWorkspace.findFirst({
      where: { teamId, userToken: { not: null } },
    });
    if (!workspace) return;

    // Don't draft for messages sent by the owner themselves
    if (msg.user === workspace.slackUserId) return;

    logger.info('🔔 Channel message — generating draft for owner', {
      from: msg.user, channel: msg.channel, text: msg.text?.slice(0, 80),
    });

    const botClient  = new WebClient(workspace.botToken);
    const userClient = new WebClient(workspace.userToken);

    // Get owner name
    let ownerName = workspace.slackUserId ?? 'User';
    try {
      const info = await userClient.users.info({ user: workspace.slackUserId });
      ownerName = (info.user as any)?.real_name ?? (info.user as any)?.name ?? ownerName;
    } catch {}

    await generateAndDeliverDraft({
      botClient,
      historyClient:    client,
      teamId,
      channelId:        msg.channel,
      messageTs:        msg.ts,
      threadTs:         msg.thread_ts,
      fromUserId:       msg.user ?? '',
      text:             msg.text,
      channelType:      msg.channel_type === 'group' ? 'mpim' : 'channel',
      recipientSlackId: workspace.slackUserId,
      ownerName,
    });
  });
}
