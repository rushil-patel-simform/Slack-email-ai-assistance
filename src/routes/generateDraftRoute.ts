import { Router, Request, Response, NextFunction } from 'express';
import { getAuthenticatedClient } from '../auth/googleOAuth';
import { getValidTokens, getAllConnectedUsers } from '../auth/tokenService';
import { createGmailDraft } from '../gmail/gmailService';
import { generateEmailReply } from '../ai/promptService';
import { prisma } from '../db/prismaClient';
import { ParsedEmail } from '../types';
import { logger } from '../utils/logger';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface GenerateDraftBody {
  subject?: string;
  sender?: string;
  senderEmail?: string;
  body?: string;
  threadId?: string;
  userId?: string;
}

const router = Router();

/**
 * Gmail URLs use a compact/legacy thread ID format (e.g. "FMfcgzQg...")
 * which is NOT the same as the hex thread ID the Gmail API requires (e.g. "19e20f5b...").
 *
 * This function:
 *  1. Checks if the supplied threadId looks like a real API hex ID (all hex chars, 12-20 chars)
 *  2. If not, searches Gmail by subject + sender to find the real hex thread ID
 *  3. Falls back to the original value if search finds nothing (so the API error is descriptive)
 */
async function resolveApiThreadId(
  auth: OAuth2Client,
  compactId: string,
  subject: string,
  senderEmail: string,
): Promise<string> {
  // Hex-only ID = already in API format
  const isHexId = /^[0-9a-f]{12,20}$/i.test(compactId);
  if (isHexId) {
    logger.info(`Thread ID already in hex format: ${compactId}`);
    return compactId;
  }

  logger.info(`Compact/URL thread ID detected (${compactId}), searching Gmail API for real thread ID…`);

  try {
    const gmail = google.gmail({ version: 'v1', auth });

    // Build a search query that narrows it down to this specific thread
    const cleanSubject = subject.replace(/^(Re:|Fwd?:)\s*/gi, '').trim();
    const query = [
      `subject:"${cleanSubject}"`,
      senderEmail ? `from:${senderEmail}` : '',
    ].filter(Boolean).join(' ');

    logger.info(`Gmail thread search query: ${query}`);

    const searchRes = await gmail.users.threads.list({
      userId: 'me',
      q: query,
      maxResults: 5,
    });

    const threads = searchRes.data.threads ?? [];
    if (threads.length === 0) {
      logger.warn(`No threads found for query "${query}", using original compact ID`);
      return compactId;
    }

    const resolvedId = threads[0].id!;
    logger.info(`Resolved thread ID: ${compactId} → ${resolvedId}`);
    return resolvedId;

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Thread ID resolution failed: ${msg}, falling back to compact ID`);
    return compactId;
  }
}

/**
 * POST /generate-draft
 * Manually generate an AI reply draft for any email content.
 * Works independently of the auto-draft toggle.
 *
 * Body: { subject, sender, senderEmail, body, threadId, userId }
 */
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      subject,
      sender,
      senderEmail,
      body,
      threadId,
      userId,
    } = req.body as GenerateDraftBody;

    // Validate required fields
    if (!body || body.trim() === '') {
      res.status(400).json({ success: false, error: 'email body is required' });
      return;
    }
    if (!threadId) {
      res.status(400).json({ success: false, error: 'threadId is required' });
      return;
    }

    // Resolve userId — use provided one or fall back to the first connected user
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const users = await getAllConnectedUsers();
      if (users.length === 0) {
        res.status(400).json({ success: false, error: 'No connected Gmail accounts found' });
        return;
      }
      resolvedUserId = users[0];
    }

    const tokens = await getValidTokens(resolvedUserId);
    const auth = getAuthenticatedClient(tokens.accessToken, tokens.refreshToken);

    // Resolve the real Gmail API thread ID — URL compact IDs (FMfcgz…) are not accepted
    const resolvedThreadId = await resolveApiThreadId(
      auth,
      threadId,
      subject ?? '',
      senderEmail ?? sender ?? '',
    );

    // Build a ParsedEmail from the request body
    const emailContext: ParsedEmail = {
      messageId: `manual-${Date.now()}`,
      threadId: resolvedThreadId,
      subject: subject ?? '(No Subject)',
      sender: sender ?? senderEmail ?? 'Unknown Sender',
      senderEmail: senderEmail ?? sender ?? '',
      body: body.trim(),
      snippet: body.slice(0, 200),
      date: new Date().toUTCString(),
    };

    logger.info(`Manual draft requested for thread ${threadId} by user ${resolvedUserId}`);

    // Generate AI reply
    const aiReply = await generateEmailReply(emailContext);

    // Create Gmail draft
    const draft = await createGmailDraft(auth, emailContext, aiReply);

    // Record in DB — use a transient processedEmail row for the draft log
    const processedEmail = await prisma.processedEmail.upsert({
      where: { messageId: emailContext.messageId },
      update: { hasDraft: true },
      create: {
        messageId: emailContext.messageId,
        threadId: emailContext.threadId,
        userId: resolvedUserId,
        subject: emailContext.subject,
        sender: emailContext.senderEmail,
        hasDraft: true,
      },
    });

    await prisma.draftLog.create({
      data: {
        userId: resolvedUserId,
        processedEmailId: processedEmail.id,
        draftId: draft.draftId,
        threadId: draft.threadId,
        subject: emailContext.subject,
        aiReplyPreview: aiReply.slice(0, 500),
      },
    });

    logger.info(`Manual draft created: draftId=${draft.draftId} thread=${threadId}`);

    res.status(201).json({
      success: true,
      message: 'AI Draft Created',
      data: {
        draftId: draft.draftId,
        threadId: draft.threadId,
        aiReplyPreview: aiReply.slice(0, 300),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
