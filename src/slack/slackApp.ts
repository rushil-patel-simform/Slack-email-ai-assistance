/**
 * Slack Bolt App — Socket Mode
 *
 * Uses SLACK_APP_TOKEN (xapp-...) + SLACK_BOT_TOKEN (xoxb-...) to connect
 * via persistent WebSocket. NO public URL or ngrok required.
 *
 * Flow:
 *   1. app.start() opens a WebSocket to Slack via Socket Mode
 *   2. Slack pushes events over that connection
 *   3. Bolt dispatches events to our registered handlers
 *   4. We reply using chat.postMessage with the bot token
 */
import { App, LogLevel } from '@slack/bolt';
import { prisma } from '../db/prismaClient';
import { config } from '../config';
import { registerSlackEventHandlers, registerChannelMentionHandler } from './events/slackEventHandlers';
import { startDMPoller, stopDMPoller } from './services/slackDMPoller';
import { logger } from '../utils/logger';

let boltApp: App | null = null;

export function getBoltApp(): App {
  if (!boltApp) throw new Error('Slack Bolt app not initialised — call initSlackApp() first');
  return boltApp;
}

/**
 * Checks whether enough credentials exist to start the Slack integration.
 * Requires at minimum: signingSecret + appToken + botToken (Socket Mode).
 */
export function slackCredentialsPresent(): boolean {
  return Boolean(
    config.slack.signingSecret &&
    config.slack.appToken      &&
    config.slack.botToken,
  );
}

/**
 * Initialise and start the Bolt Socket Mode app.
 * Registers event handlers and connects to Slack via WebSocket.
 * Stores workspace info in the DB using auth.test().
 */
export async function initSlackApp(): Promise<App> {
  if (boltApp) return boltApp;

  if (!slackCredentialsPresent()) {
    throw new Error(
      'Missing Slack credentials. Set SLACK_SIGNING_SECRET, SLACK_APP_TOKEN, SLACK_BOT_TOKEN in .env',
    );
  }

  logger.info('⚡ Initialising Slack Bolt (Socket Mode)…');

  boltApp = new App({
    token:         config.slack.botToken,       // xoxb-... used for all API calls
    signingSecret: config.slack.signingSecret,
    socketMode:    true,
    appToken:      config.slack.appToken,       // xapp-... used for Socket Mode handshake
    logLevel:      LogLevel.ERROR,              // suppress Bolt's verbose internal logs
  });

  // Register all message / mention event handlers
  registerSlackEventHandlers(boltApp);
  registerChannelMentionHandler(boltApp);

  // Open the WebSocket connection to Slack
  await boltApp.start();
  logger.info('✅ Slack Socket Mode connected — listening for events');

  // Start DM poller — polls every 30s for new DMs to connected users
  startDMPoller();

  // Persist workspace info so our services can look up the bot user ID
  try {
    const auth = await boltApp.client.auth.test();
    const teamId    = (auth.team_id   as string) ?? 'unknown';
    const teamName  = (auth.team      as string) ?? 'Unknown Workspace';
    const botUserId = (auth.user_id   as string) ?? '';

    await prisma.slackWorkspace.upsert({
      where:  { teamId },
      update: { teamName, botToken: config.slack.botToken, botUserId, updatedAt: new Date() },
      create: {
        teamId,
        teamName,
        botToken:  config.slack.botToken,
        botUserId,
        scope:     'socket_mode',
      },
    });

    logger.info(`Slack workspace registered: ${teamName} (${teamId}) | bot=${botUserId}`);
  } catch (err) {
    // Non-fatal — app still works, we just won't have workspace in DB
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Could not store Slack workspace info: ${msg}`);
  }

  return boltApp;
}

/**
 * Gracefully stop the Socket Mode connection (call on SIGTERM/SIGINT).
 */
export async function stopSlackApp(): Promise<void> {
  if (boltApp) {
    stopDMPoller();
    await boltApp.stop();
    boltApp = null;
    logger.info('Slack Bolt app stopped');
  }
}

