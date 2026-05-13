import { BACKEND_URL } from '../utils/config';

export interface SettingsResponse {
  autoDraftEnabled: boolean;
}

/**
 * Fetches current app settings from backend.
 */
export async function getSettings(): Promise<SettingsResponse> {
  const res = await fetch(`${BACKEND_URL}/settings`);
  if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`);
  const json = await res.json();
  return json.data as SettingsResponse;
}

/**
 * Enables automatic draft generation.
 */
export async function startAutoDraft(): Promise<SettingsResponse> {
  const res = await fetch(`${BACKEND_URL}/settings/auto-draft/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to start auto-draft: ${res.status}`);
  const json = await res.json();
  return json.data as SettingsResponse;
}

/**
 * Disables automatic draft generation.
 */
export async function stopAutoDraft(): Promise<SettingsResponse> {
  const res = await fetch(`${BACKEND_URL}/settings/auto-draft/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to stop auto-draft: ${res.status}`);
  const json = await res.json();
  return json.data as SettingsResponse;
}

export interface GenerateDraftPayload {
  subject: string;
  sender: string;
  senderEmail: string;
  body: string;
  threadId: string;
  userId?: string;
}

export interface GenerateDraftResponse {
  draftId: string;
  threadId: string;
  aiReplyPreview: string;
}

/**
 * Sends email context to backend to generate an AI draft.
 * Works independently of auto-draft toggle.
 */
export async function generateDraft(
  payload: GenerateDraftPayload,
): Promise<GenerateDraftResponse> {
  const res = await fetch(`${BACKEND_URL}/generate-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as GenerateDraftResponse;
}

/**
 * Checks if the backend is reachable.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
