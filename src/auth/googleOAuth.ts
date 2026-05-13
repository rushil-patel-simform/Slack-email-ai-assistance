import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

/**
 * Creates and returns a configured Google OAuth2 client.
 */
export function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri,
  );
}

/**
 * Generates the Google OAuth2 authorization URL.
 */
export function getAuthorizationUrl(): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [...config.google.scopes],
    prompt: 'consent', // Force refresh_token to be returned every time
  });
}

/**
 * Exchanges an authorization code for access + refresh tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
}> {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) throw new Error('No access token received from Google');
  if (!tokens.refresh_token) throw new Error('No refresh token received. Re-authorize with prompt=consent');

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
    scope: tokens.scope ?? config.google.scopes.join(' '),
  };
}

/**
 * Gets an authenticated OAuth2 client using stored tokens.
 * Automatically refreshes expired access tokens.
 */
export function getAuthenticatedClient(accessToken: string, refreshToken: string): OAuth2Client {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2Client;
}

/**
 * Fetches the authenticated user's Google profile info.
 */
export async function getGoogleUserInfo(oauth2Client: OAuth2Client): Promise<{
  email: string;
  name: string | null;
}> {
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  if (!data.email) throw new Error('Could not retrieve user email from Google');

  return {
    email: data.email,
    name: data.name ?? null,
  };
}

/**
 * Refreshes the access token using the refresh token.
 * Returns the new access token and its expiry date.
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token');
  }

  return {
    accessToken: credentials.access_token,
    expiresAt: new Date(credentials.expiry_date ?? Date.now() + 3600 * 1000),
  };
}
