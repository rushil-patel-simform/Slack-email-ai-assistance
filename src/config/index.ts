import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  server: {
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
  },
  google: {
    clientId: requireEnv('GOOGLE_CLIENT_ID'),
    clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    redirectUri: requireEnv('GOOGLE_REDIRECT_URI'),
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  },
  openai: {
    apiKey: requireEnv('OPENAI_API_KEY'),
    model: process.env['OPENAI_MODEL'] ?? 'gpt-4o',
    maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] ?? '500', 10),
  },
  jobs: {
    pollIntervalCron: process.env['POLL_CRON'] ?? '* * * * *', // every minute
    maxEmailsPerPoll: parseInt(process.env['MAX_EMAILS_PER_POLL'] ?? '10', 10),
  },
  slack: {
    clientId:        process.env['SLACK_CLIENT_ID']        ?? '',
    clientSecret:    process.env['SLACK_CLIENT_SECRET']    ?? '',
    signingSecret:   process.env['SLACK_SIGNING_SECRET']   ?? '',
    redirectUri:     process.env['SLACK_REDIRECT_URI']     ?? 'http://localhost:3000/slack/oauth/callback',
    appToken:        process.env['SLACK_APP_TOKEN']        ?? '',   // xapp-... Socket Mode
    botToken:        process.env['SLACK_BOT_TOKEN']        ?? '',   // xoxb-... direct bot token
  },
} as const;
