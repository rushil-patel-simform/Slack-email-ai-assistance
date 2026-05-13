import { prisma } from '../db/prismaClient';
import { refreshAccessToken } from './googleOAuth';
import { logger } from '../utils/logger';

export interface OAuthTokenRecord {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: Date;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Upserts OAuth tokens for a user in the database.
 */
export async function upsertOAuthTokens(
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scope: string;
  },
): Promise<OAuthTokenRecord> {
  return prisma.oAuthTokens.upsert({
    where: { userId },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
    },
    create: {
      userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
    },
  }) as Promise<OAuthTokenRecord>;
}

/**
 * Retrieves valid OAuth tokens for a user, auto-refreshing if expired.
 */
export async function getValidTokens(userId: string): Promise<OAuthTokenRecord> {
  const tokens = (await prisma.oAuthTokens.findUnique({ where: { userId } })) as OAuthTokenRecord | null;
  if (!tokens) throw new Error(`No OAuth tokens found for user: ${userId}`);

  const isExpired = new Date() >= tokens.expiresAt;

  if (isExpired) {
    logger.info(`Access token expired for user ${userId}, refreshing...`);
    const { accessToken, expiresAt } = await refreshAccessToken(tokens.refreshToken);

    const updated = (await prisma.oAuthTokens.update({
      where: { userId },
      data: { accessToken, expiresAt },
    })) as OAuthTokenRecord;

    logger.info(`Access token refreshed for user ${userId}`);
    return updated;
  }

  return tokens;
}

/**
 * Returns all users who have connected their Gmail accounts.
 */
export async function getAllConnectedUsers(): Promise<string[]> {
  const records = await prisma.oAuthTokens.findMany({ select: { userId: true } });
  return records.map((r: { userId: string }) => r.userId);
}
