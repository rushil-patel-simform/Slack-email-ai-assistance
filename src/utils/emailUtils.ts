/**
 * Only truly un-repliable automated senders (no-reply, mailer daemons, etc.)
 * Kept intentionally narrow — real people at companies should NOT be skipped.
 */
const AUTOMATED_SENDER_PATTERNS: RegExp[] = [
  /no[-_.]?reply/i,
  /noreply/i,
  /do[-_.]?not[-_.]?reply/i,
  /mailer[-_.]?daemon/i,
  /postmaster@/i,
  /bounce[sd]?@/i,
  /automated@/i,
  // Bulk/newsletter sender address patterns
  /news@/i,
  /newsletter@/i,
  /notifications?@/i,
  /updates?@/i,
  /alerts?@/i,
  /promotions?@/i,
  /marketing@/i,
  /digest@/i,
  /bulk@/i,
];

/**
 * Only clearly bulk/system subject lines that nobody expects a human reply to.
 */
const AUTOMATED_SUBJECT_PATTERNS: RegExp[] = [
  /\[automated\]/i,
  /delivery (notification|status|update)/i,
  /\d+% off/i,
  /limited time offer/i,
  /flash sale/i,
  /don't miss out/i,
  /act now/i,
  /special offer/i,
  /get \d+% (off|discount)/i,
  /build (passed|failed|succeeded)/i,
  /pipeline (passed|failed)/i,
  /dependabot/i,
  /security advisory/i,
  // Product recommendation / shopping emails
  /finds for you/i,
  /recommended for you/i,
  /hot deals/i,
  /buy now/i,
];

/**
 * Skip CATEGORY_PROMOTIONS (Gmail's own ML classifier) — very reliable for ads.
 * Do NOT skip CATEGORY_UPDATES or CATEGORY_SOCIAL — real emails land there too.
 */
const SKIP_LABEL_PATTERNS: RegExp[] = [
  /^CATEGORY_PROMOTIONS$/,
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
