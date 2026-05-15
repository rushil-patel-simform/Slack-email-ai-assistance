/**
 * Slack REST routes (non-Bolt):
 *   GET  /slack/install          → redirect to Slack OAuth install page
 *   GET  /slack/oauth/callback   → handle OAuth code exchange
 *   GET  /slack/settings         → read auto-reply setting
 *   POST /slack/auto-reply/start → enable auto-reply
 *   POST /slack/auto-reply/stop  → disable auto-reply
 *   GET  /slack/workspaces       → list installed workspaces
 *   GET  /slack/replies          → recent AI reply log
 */
import { Router, Request, Response, NextFunction } from 'express';
import { buildInstallUrl, buildUserConnectUrl, handleOAuthCallback, handleUserConnectCallback } from '../auth/slackOAuth';
import { prisma } from '../../db/prismaClient';
import {
  getSlackSettings,
  enableAutoReply,
  disableAutoReply,
} from '../services/slackSettingsService';
import { getAllWorkspaces } from '../services/slackWorkspaceService';
import { getRecentReplies } from '../services/slackMessageService';
import { logger } from '../../utils/logger';

const router = Router();

// GET /slack/install
router.get('/install', (_req: Request, res: Response) => {
  const url = buildInstallUrl();
  logger.info('Redirecting to Slack OAuth install URL');
  res.redirect(url);
});

// GET /slack/connect  — personal user OAuth (grants user token so bot replies AS you)
router.get('/connect', (_req: Request, res: Response) => {
  const url = buildUserConnectUrl();
  logger.info('Redirecting to Slack user connect URL');
  res.redirect(url);
});

// GET /slack/oauth/callback  — handles BOTH bot install and user connect callbacks
router.get('/oauth/callback', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const code = req.query['code'] as string | undefined;
    if (!code) {
      res.status(400).json({ success: false, error: 'Missing code parameter' });
      return;
    }

    // Try user connect first (has user_scope), fall back to bot install
    try {
      const { teamId, slackUserId } = await handleUserConnectCallback(code);
      res.status(200).send(`
        <html><body style="font-family:sans-serif;padding:40px;text-align:center">
          <h2>✅ Connected!</h2>
          <p>Your personal Slack account is now linked.</p>
          <p>The AI assistant will now auto-reply to your DMs and channel messages on your behalf.</p>
          <p><b>Team:</b> ${teamId} &nbsp;|&nbsp; <b>Your Slack ID:</b> ${slackUserId}</p>
          <p>You can close this tab.</p>
        </body></html>
      `);
    } catch {
      // Fallback to bot install callback
      const { teamId, teamName } = await handleOAuthCallback(code);
      res.status(200).json({
        success: true,
        message: `Slack workspace "${teamName}" connected successfully! Now visit /slack/connect to link your personal account.`,
        data: { teamId, teamName },
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /slack/settings
router.get('/settings', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await getSlackSettings();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
});

// POST /slack/auto-reply/start
router.post('/auto-reply/start', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await enableAutoReply();
    res.json({ success: true, message: 'Slack auto-reply enabled', data: settings });
  } catch (err) { next(err); }
});

// POST /slack/auto-reply/stop
router.post('/auto-reply/stop', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await disableAutoReply();
    res.json({ success: true, message: 'Slack auto-reply disabled', data: settings });
  } catch (err) { next(err); }
});

// GET /slack/workspaces
router.get('/workspaces', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workspaces = await getAllWorkspaces();
    res.json({ success: true, data: workspaces });
  } catch (err) { next(err); }
});

// GET /slack/replies
router.get('/replies', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt((req.query['limit'] as string) ?? '50', 10);
    const replies = await getRecentReplies(limit);
    res.json({ success: true, data: replies });
  } catch (err) { next(err); }
});

// GET /slack/drafts — list pending AI drafts
router.get('/drafts', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = (req.query['status'] as string) ?? 'pending';
    const limit  = parseInt((req.query['limit'] as string) ?? '20', 10);
    const drafts = await prisma.slackDraft.findMany({
      where:   { status },
      orderBy: { createdAt: 'desc' },
      take:    limit,
    });
    res.json({ success: true, data: drafts });
  } catch (err) { next(err); }
});

// PATCH /slack/drafts/:id — mark draft as sent or dismissed
router.patch('/drafts/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };
    if (!['sent', 'dismissed'].includes(status)) {
      res.status(400).json({ success: false, error: 'status must be "sent" or "dismissed"' });
      return;
    }
    const draft = await prisma.slackDraft.update({ where: { id }, data: { status, updatedAt: new Date() } });
    res.json({ success: true, data: draft });
  } catch (err) { next(err); }
});

export default router;
