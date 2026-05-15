/**
 * Message deduplication helpers.
 * Uses SlackProcessedMessage to ensure we never reply twice to the same message.
 */
import { prisma } from '../../db/prismaClient';

export async function isAlreadyProcessed(messageTs: string, channelId: string): Promise<boolean> {
  const existing = await prisma.slackProcessedMessage.findUnique({
    where: { messageTs_channelId: { messageTs, channelId } },
  });
  return existing !== null;
}

export async function markProcessed(params: {
  messageTs: string;
  channelId:  string;
  teamId:     string;
  userId:     string;
  text:       string;
  replied:    boolean;
  skipped:    boolean;
  skipReason?: string;
}) {
  return prisma.slackProcessedMessage.upsert({
    where:  { messageTs_channelId: { messageTs: params.messageTs, channelId: params.channelId } },
    update: { replied: params.replied, skipped: params.skipped, skipReason: params.skipReason },
    create: {
      messageTs:  params.messageTs,
      channelId:  params.channelId,
      teamId:     params.teamId,
      userId:     params.userId,
      text:       params.text,
      replied:    params.replied,
      skipped:    params.skipped,
      skipReason: params.skipReason,
    },
  });
}

export async function recordReply(params: {
  teamId:        string;
  channelId:     string;
  messageTs:     string;
  replyTs:       string;
  aiReplyPreview: string;
  processedMessageId: string;
}) {
  return prisma.slackReplyLog.create({
    data: {
      teamId:             params.teamId,
      channelId:          params.channelId,
      messageTs:          params.messageTs,
      replyTs:            params.replyTs,
      aiReplyPreview:     params.aiReplyPreview,
      processedMessageId: params.processedMessageId,
    },
  });
}

export async function getRecentReplies(limit = 50) {
  return prisma.slackReplyLog.findMany({
    orderBy: { createdAt: 'desc' },
    take:    limit,
    select: {
      id:             true,
      teamId:         true,
      channelId:      true,
      messageTs:      true,
      replyTs:        true,
      aiReplyPreview: true,
      createdAt:      true,
    },
  });
}
