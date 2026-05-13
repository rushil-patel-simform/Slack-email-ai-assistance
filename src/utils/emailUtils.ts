/**
 * Patterns that indicate automated / no-reply senders that should be skipped.
 */
const AUTOMATED_SENDER_PATTERNS: RegExp[] = [
  /no[-_.]?reply/i,
  /noreply/i,
  /do[-_.]?not[-_.]?reply/i,
  /notifications?@/i,
  /automated@/i,
  /mailer[-_.]?daemon/i,
  /postmaster@/i,
  /bounce[sd]?@/i,
  /newsletter@/i,
  /updates?@/i,
  /alerts?@/i,
  /support-noreply/i,
  /feedback@/i,
];

/**
 * Common automated subject line patterns.
 */
const AUTOMATED_SUBJECT_PATTERNS: RegExp[] = [
  /unsubscribe/i,
  /your (order|receipt|invoice|subscription)/i,
  /account (created|activated|verified|suspended)/i,
  /password (reset|changed|expir)/i,
  /verify your (email|account)/i,
  /welcome to/i,
  /\[automated\]/i,
  /delivery (notification|status|update)/i,
];

export function isAutomatedEmail(sender: string, subject: string): boolean {
  for (const pattern of AUTOMATED_SENDER_PATTERNS) {
    if (pattern.test(sender)) return true;
  }
  for (const pattern of AUTOMATED_SUBJECT_PATTERNS) {
    if (pattern.test(subject)) return true;
  }
  return false;
}

/**
 * Decode base64url-encoded Gmail message body.
 */
export function decodeBase64(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Strips HTML tags from a string for plain text extraction.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Truncate text to a max character length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
