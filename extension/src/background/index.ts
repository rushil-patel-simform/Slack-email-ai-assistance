/**
 * Plasmo Background Service Worker
 *
 * Handles extension lifecycle events and acts as a message broker
 * between the popup and the content script.
 */

import { BACKEND_URL } from '../utils/config';

// ── Extension install / startup ────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Gmail AI] Extension installed');
  // Open the Gmail tab on first install so the content script loads
});

// ── Message handler ────────────────────────────────────────────
// Allows popup and content scripts to send API requests through the
// background worker (needed if content-script CSP blocks fetch to localhost)
chrome.runtime.onMessage.addListener(
  (
    message: { type: string; payload?: unknown },
    _sender,
    sendResponse: (r: unknown) => void,
  ) => {
    if (message.type === 'API_REQUEST') {
      handleApiRequest(message.payload as ApiRequest)
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err) => sendResponse({ ok: false, error: (err as Error).message }));
      return true; // keep channel open for async response
    }
  },
);

interface ApiRequest {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
}

async function handleApiRequest(req: ApiRequest): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}${req.path}`, {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    body: req.body ? JSON.stringify(req.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
