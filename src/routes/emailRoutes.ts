import { Router, Request, Response, NextFunction } from 'express';
import { getAuthenticatedClient } from '../auth/googleOAuth';
import { getValidTokens } from '../auth/tokenService';
import { fetchUnreadEmails, parseGmailMessage } from '../gmail/gmailService';

const router = Router();

/**
 * GET /emails/unread?userId=xxx
 * Returns the list of unread emails for a given user.
 */
router.get('/unread', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'Missing userId query parameter' });
      return;
    }

    const tokens = await getValidTokens(userId);
    const auth = getAuthenticatedClient(tokens.accessToken, tokens.refreshToken);
    const rawMessages = await fetchUnreadEmails(auth, 10);
    const parsed = rawMessages.map(parseGmailMessage).filter(Boolean);

    res.json({
      success: true,
      data: {
        count: parsed.length,
        emails: parsed,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
