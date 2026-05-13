import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { gmail_v1 } from 'googleapis';
import { ParsedEmail, DraftCreationResult } from '../types';
import { decodeBase64, stripHtml } from '../utils/emailUtils';
import { logger } from '../utils/logger';

/**
 * Fetch unread inbox emails for the authenticated user.
 */
export async function fetchUnreadEmails(
  auth: OAuth2Client,
  maxResults: number = 10,
): Promise<gmail_v1.Schema$Message[]> {
  const gmail = google.gmail({ version: 'v1', auth });

  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread in:inbox',
    maxResults,
  });

  const messages = listResponse.data.messages ?? [];
  if (messages.length === 0) return [];

  // Fetch full message details in parallel
  const fullMessages = await Promise.all(
    messages.map((msg) =>
      gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      }).then((r) => r.data),
    ),
  );

  return fullMessages;
}

/**
 * Extracts a header value from a Gmail message.
 */
function getHeader(headers: gmail_v1.Schema$MessagePartHeader[], name: string): string {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';
}

/**
 * Recursively extracts the plain text or HTML body from message parts.
 */
function extractBody(parts: gmail_v1.Schema$MessagePart[]): string {
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return decodeBase64(part.body.data);
    }
    if (part.parts) {
      const nested = extractBody(part.parts);
      if (nested) return nested;
    }
  }

  // Fall back to HTML
  for (const part of parts) {
    if (part.mimeType === 'text/html' && part.body?.data) {
      return stripHtml(decodeBase64(part.body.data));
    }
    if (part.parts) {
      const nested = extractBody(part.parts);
      if (nested) return nested;
    }
  }

  return '';
}

/**
 * Parses a raw Gmail message into a structured ParsedEmail.
 */
export function parseGmailMessage(message: gmail_v1.Schema$Message): ParsedEmail | null {
  try {
    const headers = message.payload?.headers ?? [];
    const subject = getHeader(headers, 'subject') || '(No Subject)';
    const fromHeader = getHeader(headers, 'from');
    const date = getHeader(headers, 'date');

    // Extract email address from "Name <email@example.com>" format
    const emailMatch = fromHeader.match(/<([^>]+)>/);
    const senderEmail = emailMatch ? emailMatch[1] : fromHeader;
    const sender = fromHeader;

    // Extract body
    let body = '';
    if (message.payload?.parts) {
      body = extractBody(message.payload.parts);
    } else if (message.payload?.body?.data) {
      const raw = decodeBase64(message.payload.body.data);
      body = message.payload.mimeType === 'text/html' ? stripHtml(raw) : raw;
    }

    if (!body) {
      body = message.snippet ?? '';
    }

    return {
      messageId: message.id!,
      threadId: message.threadId!,
      subject,
      sender,
      senderEmail,
      body: body.trim(),
      snippet: message.snippet ?? '',
      date,
    };
  } catch (err) {
    logger.error('Failed to parse Gmail message', { messageId: message.id, err });
    return null;
  }
}

/**
 * Creates a Gmail draft reply in the same thread.
 */
export async function createGmailDraft(
  auth: OAuth2Client,
  replyTo: ParsedEmail,
  replyBody: string,
): Promise<DraftCreationResult> {
  const gmail = google.gmail({ version: 'v1', auth });

  const replySubject = replyTo.subject.startsWith('Re:')
    ? replyTo.subject
    : `Re: ${replyTo.subject}`;

  // Build RFC 2822 email message
  const rawMessage = [
    `To: ${replyTo.senderEmail}`,
    `Subject: ${replySubject}`,
    `In-Reply-To: ${replyTo.messageId}`,
    `References: ${replyTo.messageId}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    '',
    replyBody,
  ].join('\n');

  // Base64url encode
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const draftResponse = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw: encodedMessage,
        threadId: replyTo.threadId,
      },
    },
  });

  const draft = draftResponse.data;
  logger.info('Draft created', { draftId: draft.id, threadId: replyTo.threadId });

  return {
    draftId: draft.id!,
    threadId: replyTo.threadId,
    messageId: draft.message?.id ?? '',
  };
}

/**
 * Fetches the list of existing drafts for the authenticated user.
 */
export async function listDrafts(auth: OAuth2Client): Promise<gmail_v1.Schema$Draft[]> {
  const gmail = google.gmail({ version: 'v1', auth });
  const response = await gmail.users.drafts.list({ userId: 'me', maxResults: 20 });
  return response.data.drafts ?? [];
}
