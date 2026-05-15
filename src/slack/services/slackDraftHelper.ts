/**
 * Shared draft generation + delivery helper.
 *
 * Used by:
 *  - slackEventHandlers  (channel @mention of a connected user)
 *  - slackDMPoller       (new DM to a connected user)
 */
import { WebClient } from '@slack/web-api';
import { generateSlackReply, ConversationMessage } from '../ai/slackPromptService';
import { isAlreadyProcessed, markProcessed } from './slackMessageService';
import { prisma } from '../../db/prismaClient';
import { logger } from '../../utils/logger';

// ─── Name cache ───────────────────────────────────────────────────────────────
const nameCache = new Map<string, string>();

export async function resolveUserName(client: WebClient, userId: string): Promise<string> {
  if (nameCache.has(userId)) return nameCache.get(userId)!;
  try {
    const info = await client.users.info({ user: userId });
    const name = (info.user as any)?.real_name ?? (info.user as any)?.name ?? userId;
    nameCache.set(userId, name);
    return name;
  } catch {
    return userId;
  }
}

// ─── Fetch channel / DM history ───────────────────────────────────────────────
export async function fetchHistory(
  client: WebClient,
  channelId: string,
  beforeTs: string,
  limit = 15,
): Promise<ConversationMessage[]> {
  try {
    const result = await client.conversations.history({
      channel: channelId, latest: beforeTs, limit, inclusive: false,
    });
    return await resolveMessages(client, (result.messages ?? []).reverse());
  } catch (err) {
    logger.warn('fetchHistory failed', { channelId, err: String(err) });
    return [];
  }
}

// ─── Fetch thread replies ─────────────────────────────────────────────────────
export async function fetchThreadHistory(
  client: WebClient,
  channelId: string,
  threadTs: string,
  excludeTs: string,
): Promise<ConversationMessage[]> {
  try {
    const result = await client.conversations.replies({ channel: channelId, ts: threadTs });
    const msgs = (result.messages ?? []).filter((m: any) => m.ts !== excludeTs);
    return await resolveMessages(client, msgs);
  } catch (err) {
    logger.warn('fetchThreadHistory failed', { channelId, threadTs, err: String(err) });
    return [];
  }
}

async function resolveMessages(client: WebClient, messages: any[]): Promise<ConversationMessage[]> {
  const out: ConversationMessage[] = [];
  for (const m of messages) {
    if (!m.text || m.subtype === 'channel_join') continue;
    const name = m.bot_id
      ? (m.username ?? 'Bot')
      : await resolveUserName(client, m.user ?? '');
    out.push({ senderName: name, text: m.text, isBot: Boolean(m.bot_id) });
  }
  return out;
}

// ─── Main: generate draft and DM it to the recipient ─────────────────────────
export async function generateAndDeliverDraft(params: {
  botClient:       WebClient;   // bot token client — for sending DMs to recipient
  historyClient:   WebClient;   // user/bot token client — for reading conversation history
  teamId:          string;
  channelId:       string;
  messageTs:       string;
  threadTs?:       string;
  fromUserId:      string;
  text:            string;
  channelType:     'channel' | 'im' | 'mpim';
  recipientSlackId: string;     // the person who receives the draft notification (you)
  ownerName:       string;      // display name of the recipient
}): Promise<void> {
  const {
    botClient, historyClient, teamId, channelId, messageTs,
    threadTs, fromUserId, text, channelType, recipientSlackId, ownerName,
  } = params;

  // Dedup — don't process same message twice
  if (await isAlreadyProcessed(messageTs, channelId)) {
    logger.debug('Already processed — skipping', { messageTs });
    return;
  }

  // Resolve sender name
  const senderName = await resolveUserName(historyClient, fromUserId);

  // Mark as being processed
  await markProcessed({ messageTs, channelId, teamId, userId: fromUserId, text, replied: false, skipped: false });

  // Fetch conversation context
  logger.info('Fetching conversation history…', { channelId, messageTs });
  const conversationHistory = await fetchHistory(historyClient, channelId, messageTs);

  let threadHistory: ConversationMessage[] = [];
  if (threadTs && threadTs !== messageTs) {
    logger.info('Fetching thread history…', { threadTs });
    threadHistory = await fetchThreadHistory(historyClient, channelId, threadTs, messageTs);
  }

  // Generate AI draft
  logger.info('Generating AI draft', {
    for: ownerName, from: senderName,
    historyMsgs: conversationHistory.length, threadMsgs: threadHistory.length,
  });

  const draftText = await generateSlackReply({
    senderName,
    ownerName,
    channelType,
    messageText:         text,
    conversationHistory,
    threadHistory:       threadHistory.length > 0 ? threadHistory : undefined,
  });

  if (!draftText) {
    logger.warn('AI returned empty draft', { messageTs });
    return;
  }

  // Save draft to DB
  await prisma.slackDraft.upsert({
    where:  { messageTs_channelId: { messageTs, channelId } },
    update: { draftText, status: 'pending', updatedAt: new Date() },
    create: {
      teamId, channelId, messageTs, threadTs,
      fromUserId, fromName: senderName, originalText: text, draftText,
    },
  });

  // Send draft as private DM to the recipient (the connected user)
  const locationLabel =
    channelType === 'im'   ? 'Direct Message' :
    channelType === 'mpim' ? 'Group DM' :
    `<#${channelId}>`;

  const threadLabel  = threadTs && threadTs !== messageTs ? ' _(in thread)_' : '';
  const contextNote  = conversationHistory.length > 0
    ? `_AI used ${conversationHistory.length} previous messages${threadHistory.length > 0 ? ` + ${threadHistory.length} thread replies` : ''} as context._`
    : '';

  const draftMessage =
    `📝 *New draft ready* — ${locationLabel}${threadLabel}\n` +
    `*From:* ${senderName}\n` +
    `*Their message:* _"${text.slice(0, 250)}${text.length > 250 ? '…' : ''}"_\n` +
    `${contextNote}\n\n` +
    `*Suggested reply for you to send:*\n` +
    `>>>${draftText}\n\n` +
    `_Copy the reply above → go to ${locationLabel} → paste and send it yourself._`;

  try {
    const dmResult = await botClient.conversations.open({ users: recipientSlackId });
    const dmChannelId = (dmResult.channel as any)?.id;
    if (dmChannelId) {
      await botClient.chat.postMessage({ channel: dmChannelId, text: draftMessage, mrkdwn: true });
      logger.info('✅ Draft sent to recipient via private DM', { recipientSlackId, from: senderName });
    }
  } catch (err) {
    logger.error('Failed to send draft DM', { err: String(err), recipientSlackId });
  }

  // Mark as drafted
  await markProcessed({ messageTs, channelId, teamId, userId: fromUserId, text, replied: true, skipped: false });
}
