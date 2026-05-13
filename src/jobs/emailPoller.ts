import { getAuthenticatedClient } from '../auth/googleOAuth';
import { getValidTokens, getAllConnectedUsers } from '../auth/tokenService';
import { fetchUnreadEmails, parseGmailMessage, createGmailDraft } from '../gmail/gmailService';
import { generateEmailReply } from '../ai/promptService';
import { isAutomatedEmail } from '../utils/emailUtils';
import { prisma } from '../db/prismaClient';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Processes unread emails for a single user:
 * 1. Fetch unread emails
 * 2. Filter automated/already-processed
 * 3. Generate AI reply
 * 4. Create Gmail draft
 * 5. Record in database
 */
async function processEmailsForUser(userId: string): Promise<void> {
  logger.info(`Starting email poll for user: ${userId}`);

  const tokens = await getValidTokens(userId);
  const auth = getAuthenticatedClient(tokens.accessToken, tokens.refreshToken);

  const rawMessages = await fetchUnreadEmails(auth, config.jobs.maxEmailsPerPoll);
  logger.info(`Fetched ${rawMessages.length} unread messages for user ${userId}`);

  for (const rawMessage of rawMessages) {
    const messageId = rawMessage.id;
    if (!messageId) continue;

    // Check if already processed
    const alreadyProcessed = await prisma.processedEmail.findUnique({
      where: { messageId },
    });
    if (alreadyProcessed) {
      logger.debug(`Skipping already processed email: ${messageId}`);
      continue;
    }

    const parsed = parseGmailMessage(rawMessage);
    if (!parsed) {
      logger.warn(`Could not parse message: ${messageId}`);
      continue;
    }

    // Filter automated/no-reply emails
    if (isAutomatedEmail(parsed.sender, parsed.subject)) {
      logger.info(`Skipping automated email from ${parsed.senderEmail}: "${parsed.subject}"`);
      await prisma.processedEmail.create({
        data: {
          messageId: parsed.messageId,
          threadId: parsed.threadId,
          userId,
          subject: parsed.subject,
          sender: parsed.senderEmail,
          skipped: true,
          skipReason: 'automated_email',
        },
      });
      continue;
    }

    logger.info(`Processing email: "${parsed.subject}" from ${parsed.senderEmail}`);

    try {
      // Generate AI reply
      const aiReply = await generateEmailReply(parsed);

      // Create Gmail draft
      const draft = await createGmailDraft(auth, parsed, aiReply);

      // Record processed email
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

      // Record draft log
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

      logger.info(`Draft created for email "${parsed.subject}" → draftId: ${draft.draftId}`);
    } catch (err) {
      logger.error(`Failed to process email ${messageId}`, { err });
      // Still mark as processed to avoid retry loops on permanent failures
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
 * Main poller entry point — processes all connected users.
 */
export async function pollAllUsers(): Promise<void> {
  logger.info('=== Email poll job started ===');

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
