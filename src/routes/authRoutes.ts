import { Router, Request, Response, NextFunction } from 'express';
import { getAuthorizationUrl, exchangeCodeForTokens, getAuthenticatedClient, getGoogleUserInfo } from '../auth/googleOAuth';
import { upsertOAuthTokens } from '../auth/tokenService';
import { prisma } from '../db/prismaClient';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /auth/google
 * Redirects the user to Google's OAuth2 consent screen.
 */
router.get('/google', (_req: Request, res: Response) => {
  const url = getAuthorizationUrl();
  logger.info('Redirecting to Google OAuth2 consent screen');
  res.redirect(url);
});

/**
 * GET /auth/google/callback
 * Handles the OAuth2 callback from Google.
 * Exchanges the authorization code for tokens and stores them.
 */
router.get('/google/callback', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, error } = req.query;

    if (error) {
      logger.warn('Google OAuth error', { error });
      res.status(400).json({ success: false, error: `OAuth error: ${error}` });
      return;
    }

    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, error: 'Missing authorization code' });
      return;
    }

    const tokens = await exchangeCodeForTokens(code);

    // Get user info from Google
    const auth = getAuthenticatedClient(tokens.accessToken, tokens.refreshToken);
    const userInfo = await getGoogleUserInfo(auth);

    // Upsert user in DB
    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: { name: userInfo.name },
      create: {
        email: userInfo.email,
        name: userInfo.name,
      },
    });

    // Store tokens
    await upsertOAuthTokens(user.id, tokens);

    logger.info(`User authenticated: ${user.email} (id: ${user.id})`);

    res.status(200).json({
      success: true,
      message: 'Gmail account connected successfully!',
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
