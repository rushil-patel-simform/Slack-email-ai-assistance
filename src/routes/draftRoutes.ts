import { Router, Request, Response, NextFunction } from 'express';
import { getAuthenticatedClient } from '../auth/googleOAuth';
import { getValidTokens } from '../auth/tokenService';
import { listDrafts } from '../gmail/gmailService';
import { prisma } from '../db/prismaClient';

const router = Router();

/**
 * GET /drafts?userId=xxx
 * Returns Gmail drafts and internal draft logs for a user.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'Missing userId query parameter' });
      return;
    }

    const tokens = await getValidTokens(userId);
    const auth = getAuthenticatedClient(tokens.accessToken, tokens.refreshToken);

    const [gmailDrafts, draftLogs] = await Promise.all([
      listDrafts(auth),
      prisma.draftLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    res.json({
      success: true,
      data: {
        gmailDraftCount: gmailDrafts.length,
        draftLogs,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
