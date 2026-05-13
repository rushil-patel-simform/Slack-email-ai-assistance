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
  // Marketing / bulk senders
  /promotions?@/i,
  /marketing@/i,
  /info@/i,
  /hello@/i,
  /news@/i,
  /digest@/i,
  /weekly@/i,
  /monthly@/i,
  /deals?@/i,
  /offers?@/i,
  /notify@/i,
  /admin@/i,
  /system@/i,
  /team@/i,
  /hello@/i,
];

/**
 * Common automated / promotional subject line patterns.
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
  // Promotional
  /\d+% off/i,
  /limited time offer/i,
  /flash sale/i,
  /exclusive deal/i,
  /don't miss out/i,
  /act now/i,
  /special offer/i,
  /get \d+% (off|discount)/i,
  // GitHub / CI / release notifications
  /\[GitHub\]/i,
  /new release:/i,
  /security advisory/i,
  /dependabot/i,
  /build (passed|failed|succeeded)/i,
  /ci (passed|failed)/i,
  /pipeline (passed|failed)/i,
  // Newsletters
  /newsletter/i,
  /digest/i,
  /weekly (round)?up/i,
  /issue #\d+/i,
  /vol\.\s*\d+/i,
];

/**
 * Gmail category labels that indicate non-important mail.
 */
const SKIP_LABEL_PATTERNS: RegExp[] = [
  /^CATEGORY_PROMOTIONS$/,
  /^CATEGORY_SOCIAL$/,
  /^CATEGORY_UPDATES$/,
  /^CATEGORY_FORUMS$/,
  /^SPAM$/,
];

export interface EmailFilterResult {
  skip: boolean;
  reason?: string;
}

/**
 * Comprehensive email filter.
 * Returns { skip: true, reason } if the email should be skipped.
 */
export function shouldSkipEmail(
  sender: string,
  subject: string,
  labels: string[] = [],
  hasListUnsubscribe: boolean = false,
): EmailFilterResult {
  // 1. Check Gmail category labels
  for (const label of labels) {
    for (const pattern of SKIP_LABEL_PATTERNS) {
      if (pattern.test(label)) {
        return { skip: true, reason: `gmail_label:${label}` };
      }
    }
  }

  // 2. List-Unsubscribe header = bulk/marketing email
  if (hasListUnsubscribe) {
    return { skip: true, reason: 'list_unsubscribe_header' };
  }

  // 3. Sender pattern matching
  for (const pattern of AUTOMATED_SENDER_PATTERNS) {
    if (pattern.test(sender)) {
      return { skip: true, reason: `sender_pattern:${pattern.source}` };
    }
  }

  // 4. Subject pattern matching
  for (const pattern of AUTOMATED_SUBJECT_PATTERNS) {
    if (pattern.test(subject)) {
      return { skip: true, reason: `subject_pattern:${pattern.source}` };
    }
  }

  return { skip: false };
}

/**
 * @deprecated Use shouldSkipEmail instead.
 */
export function isAutomatedEmail(sender: string, subject: string): boolean {
  return shouldSkipEmail(sender, subject).skip;
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
