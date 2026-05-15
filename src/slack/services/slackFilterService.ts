/**
 * shouldSkipSlackMessage
 *
 * Returns { skip: true, reason: '...' } for any message we should NOT reply to.
 * Returns { skip: false } for genuine human messages that deserve a reply.
 */

export interface SlackFilterResult {
  skip:    boolean;
  reason?: string;
}

// Known bot/automation subtype strings Slack sends
const BOT_SUBTYPES = new Set([
  'bot_message',
  'channel_join',
  'channel_leave',
  'channel_topic',
  'channel_purpose',
  'channel_name',
  'channel_archive',
  'channel_unarchive',
  'pinned_item',
  'file_share',
  'slackbot_response',
  'reminder_add',
  'thread_broadcast',
]);

// Bot username patterns to ignore
const BOT_USERNAME_PATTERNS: RegExp[] = [
  /github/i,
  /gitlab/i,
  /jira/i,
  /jenkins/i,
  /circleci/i,
  /travis/i,
  /bitbucket/i,
  /pagerduty/i,
  /datadog/i,
  /newrelic/i,
  /sentry/i,
  /heroku/i,
  /vercel/i,
  /netlify/i,
  /dependabot/i,
  /renovate/i,
  /sonarqube/i,
  /slack\s*bot/i,
  /slackbot/i,
  /zapier/i,
  /ifttt/i,
  /hubot/i,
  /bot$/i,
];

// Message text patterns that indicate automated notifications
const AUTOMATED_TEXT_PATTERNS: RegExp[] = [
  /\[build (passed|failed|pending)\]/i,
  /pull request #\d+/i,
  /merged into/i,
  /opened a pull request/i,
  /pushed \d+ commit/i,
  /deployment (started|finished|failed)/i,
  /pipeline #\d+/i,
  /codecov/i,
  /security alert/i,
];

export interface SlackMessageMeta {
  botId?:    string | null;
  subtype?:  string | null;
  username?: string | null;
  text:      string;
  selfBotUserId: string;    // our own bot's user ID
  fromUserId:    string;    // the message author's user ID
}

export function shouldSkipSlackMessage(meta: SlackMessageMeta): SlackFilterResult {
  // 1. Never reply to ourselves
  if (meta.fromUserId && meta.fromUserId === meta.selfBotUserId) {
    return { skip: true, reason: 'self_message' };
  }

  // 2. Skip messages from any bot
  if (meta.botId) {
    return { skip: true, reason: `bot_message:${meta.botId}` };
  }

  // 3. Skip known automated subtypes
  if (meta.subtype && BOT_SUBTYPES.has(meta.subtype)) {
    return { skip: true, reason: `subtype:${meta.subtype}` };
  }

  // 4. Skip by bot username patterns
  if (meta.username) {
    for (const pattern of BOT_USERNAME_PATTERNS) {
      if (pattern.test(meta.username)) {
        return { skip: true, reason: `bot_username:${meta.username}` };
      }
    }
  }

  // 5. Skip empty or whitespace-only messages
  if (!meta.text || meta.text.trim() === '') {
    return { skip: true, reason: 'empty_message' };
  }

  // 6. Skip automated notification text patterns
  for (const pattern of AUTOMATED_TEXT_PATTERNS) {
    if (pattern.test(meta.text)) {
      return { skip: true, reason: `automated_text:${pattern.source}` };
    }
  }

  return { skip: false };
}
