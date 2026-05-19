import { getAuthenticatedClient } from '../auth/googleOAuth';
import { getValidTokens, getAllConnectedUsers } from '../auth/tokenService';
import { fetchUnreadEmails, parseGmailMessage, createGmailDraft } from '../gmail/gmailService';
import { generateEmailReply } from '../ai/promptService';
import { shouldSkipEmail } from '../utils/emailUtils';
import { isAutoDraftEnabled } from '../settings/settingsService';
import { prisma } from '../db/prismaClient';
import { logger } from '../utils/logger';
import { gmail_v1 } from 'googleapis';

/**
 * List-Unsubscribe header = bulk/marketing mail. Real person-to-person emails never have it.
 */
function hasListUnsubscribe(rawMessage: gmail_v1.Schema$Message): boolean {
  const headers = rawMessage.payload?.headers ?? [];
  return headers.some((h) => h.name?.toLowerCase() === 'list-unsubscribe');
}

/**
 * Extracts Gmail label IDs from a message.
 */
function getLabels(rawMessage: gmail_v1.Schema$Message): string[] {
  return rawMessage.labelIds ?? [];
}

/**
 * Core pipeline for a single user:
 * 1. Fetch latest 10 unread inbox emails
 * 2. Apply smart filtering (labels, headers, patterns)
 * 3. Generate AI reply via OpenAI
 * 4. Create Gmail draft in the same thread
 * 5. Record everything in the database
 */
async function processEmailsForUser(userId: string): Promise<void> {
  logger.info(`Starting email poll for user: ${userId}`);

  const tokens = await getValidTokens(userId);
  const auth = getAuthenticatedClient(tokens.accessToken, tokens.refreshToken);

  // Always fetch latest 30 unread only
  const rawMessages = await fetchUnreadEmails(auth, 30);
  logger.info(`Fetched ${rawMessages.length} unread messages for user ${userId}`);

  for (const rawMessage of rawMessages) {
    const messageId = rawMessage.id;
    if (!messageId) continue;

    // Skip already-processed emails (primary dedup — DB unique constraint on messageId)
    const alreadyProcessed = await prisma.processedEmail.findUnique({
      where: { messageId },
    });
    if (alreadyProcessed) {
      logger.debug(`Skipping already processed email: ${messageId}`);
      continue;
    }

    // Secondary dedup — skip if a draft was already created for this thread
    const existingDraft = await prisma.draftLog.findFirst({
      where: { threadId: rawMessage.threadId ?? '', userId },
    });
    if (existingDraft) {
      logger.debug(`Skipping — draft already exists for thread: ${rawMessage.threadId}`);
      // Mark as processed so we don't check again
      await prisma.processedEmail.create({
        data: {
          messageId,
          threadId: rawMessage.threadId ?? messageId,
          userId,
          subject: '',
          sender: '',
          skipped: true,
          skipReason: 'draft_already_exists_for_thread',
        },
      }).catch(() => {}); // ignore unique conflict
      continue;
    }

    const parsed = parseGmailMessage(rawMessage);
    if (!parsed) {
      logger.warn(`Could not parse message: ${messageId}`);
      continue;
    }

    // Run filter: Gmail labels + List-Unsubscribe header + sender/subject patterns
    const labels = getLabels(rawMessage);
    const listUnsub = hasListUnsubscribe(rawMessage);
    const filterResult = shouldSkipEmail(parsed.sender, parsed.subject, labels, listUnsub);

    if (filterResult.skip) {
      logger.info(
        `Skipping email from ${parsed.senderEmail}: "${parsed.subject}" [${filterResult.reason}]`,
      );
      await prisma.processedEmail.create({
        data: {
          messageId: parsed.messageId,
          threadId: parsed.threadId,
          userId,
          subject: parsed.subject,
          sender: parsed.senderEmail,
          skipped: true,
          skipReason: filterResult.reason ?? 'filtered',
        },
      });
      continue;
    }

    logger.info(`Processing important email: "${parsed.subject}" from ${parsed.senderEmail}`);

    try {
      const aiReply = await generateEmailReply(parsed);
      const draft = await createGmailDraft(auth, parsed, aiReply);

      const processedEmail = await prisma.processedEmail.create({
        data: {
          messageId: parsed.messageId,
          threadId: parsed.threadId,
          userId,
          subject: parsed.subject,
          sender: parsed.senderEmail,
          hasDraft: true,
        },
      });

      await prisma.draftLog.create({
        data: {
          userId,
          processedEmailId: processedEmail.id,
          draftId: draft.draftId,
          threadId: draft.threadId,
          subject: parsed.subject,
          aiReplyPreview: aiReply.slice(0, 500),
        },
      });

      logger.info(`Draft created for "${parsed.subject}" → draftId: ${draft.draftId}`);
    } catch (err) {
      logger.error(`Failed to process email ${messageId}`, { err });
      await prisma.processedEmail.create({
        data: {
          messageId: parsed.messageId,
          threadId: parsed.threadId,
          userId,
          subject: parsed.subject,
          sender: parsed.senderEmail,
          skipped: true,
          skipReason: `error: ${err instanceof Error ? err.message : String(err)}`,
        },
      });
    }
  }

  logger.info(`Email poll complete for user: ${userId}`);
}

/**
 * Main poller entry point.
 * Checks auto-draft flag first — skips all processing if disabled.
 */
export async function pollAllUsers(): Promise<void> {
  logger.info('=== Email poll job started ===');

  // Respect the auto-draft toggle from AppSettings
  const autoDraftOn = await isAutoDraftEnabled();
  if (!autoDraftOn) {
    logger.info('Auto-draft is DISABLED — skipping poll.');
    return;
  }

  const userIds = await getAllConnectedUsers();
  if (userIds.length === 0) {
    logger.info('No connected users found, skipping poll.');
    return;
  }

  for (const userId of userIds) {
    try {
      await processEmailsForUser(userId);
    } catch (err) {
      logger.error(`Error processing emails for user ${userId}`, { err });
    }
  }

  logger.info('=== Email poll job finished ===');
}
