/**
 * Gmail AI Assistant — Content Script
 *
 * Injects an "AI Reply" button into every open Gmail email thread.
 * Uses MutationObserver to handle Gmail's SPA navigation.
 *
 * This runs independently of the auto-draft toggle.
 * Manual drafting is ALWAYS available.
 */

import { generateDraft, GenerateDraftPayload } from '../services/apiService';

// ─── Constants ────────────────────────────────────────────────
const BUTTON_ID_PREFIX = 'gmail-ai-reply-btn';
const INJECTED_ATTR = 'data-ai-btn-injected';
const TOAST_ID = 'gmail-ai-toast';

// ─── Toast ─────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
  const existing = document.getElementById(TOAST_ID);
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = TOAST_ID;

  const colors = { success: '#16a34a', error: '#dc2626', info: '#2563eb' };

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: colors[type],
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    zIndex: '99999',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    fontWeight: '500',
    lineHeight: '1.5',
    maxWidth: '320px',
    transition: 'opacity 0.3s',
  } as Partial<CSSStyleDeclaration>);

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ─── Email Extraction ──────────────────────────────────────────

interface ExtractedEmail {
  subject: string;
  sender: string;
  senderEmail: string;
  body: string;
  threadId: string;
}

/**
 * Extracts the threadId from the current Gmail URL.
 * Gmail URLs look like: https://mail.google.com/mail/u/0/#inbox/FMfcgzQbfzXkJGhvqrXKRmSmVCFGKlKm
 */
function extractThreadIdFromUrl(): string {
  const hash = window.location.hash;
  const parts = hash.split('/');
  return parts[parts.length - 1] ?? '';
}

/**
 * Finds the closest open email thread and extracts its content.
 */
function extractEmailFromThread(replyArea: Element): ExtractedEmail | null {
  try {
    // Walk up to find the email thread container
    let container: Element | null = replyArea;
    while (container && !container.classList.contains('h7') && !container.getAttribute('data-message-id')) {
      container = container.parentElement;
    }

    // Get the expanded message — try multiple Gmail DOM selectors
    const messageEl =
      document.querySelector('[data-message-id]') ??
      document.querySelector('.a3s') ??
      document.querySelector('.ii.gt');

    // Subject: from page title or subject element
    const subjectEl = document.querySelector('h2.hP') ?? document.querySelector('[data-thread-perm-id]');
    const subject = subjectEl?.textContent?.trim() ?? document.title.replace(' - Gmail', '').trim();

    // Sender: from the "from" field of the latest message
    const senderEl =
      document.querySelector('.gD') ??
      document.querySelector('[email]') ??
      document.querySelector('.go');

    const sender = senderEl?.getAttribute('name') ?? senderEl?.textContent?.trim() ?? 'Unknown';
    const senderEmail =
      senderEl?.getAttribute('email') ??
      senderEl?.getAttribute('data-hovercard-id') ??
      sender;

    // Body text — get latest visible message
    const bodyEl =
      messageEl?.querySelector('.a3s') ??
      messageEl ??
      document.querySelector('.a3s.aiL') ??
      document.querySelector('.ii.gt div');

    // Strip quoted text (lines starting with ">") to avoid re-replying to old content
    let body = (bodyEl as HTMLElement | null)?.innerText?.trim() ?? '';
    body = body
      .split('\n')
      .filter((line: string) => !line.trim().startsWith('>'))
      .join('\n')
      .trim();

    if (!body) body = bodyEl?.textContent?.trim() ?? '(No body)';

    const threadId = extractThreadIdFromUrl();

    return { subject, sender, senderEmail, body, threadId };
  } catch (err) {
    console.error('[Gmail AI] Failed to extract email:', err);
    return null;
  }
}

// ─── Button Creation ───────────────────────────────────────────

function createAIReplyButton(replyArea: Element): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.id = `${BUTTON_ID_PREFIX}-${Date.now()}`;
  btn.textContent = '✨ AI Reply';

  Object.assign(btn.style, {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
    marginLeft: '8px',
    height: '32px',
    verticalAlign: 'middle',
    transition: 'background-color 0.2s, opacity 0.2s',
  } as Partial<CSSStyleDeclaration>);

  btn.addEventListener('mouseenter', () => {
    btn.style.backgroundColor = '#1557b0';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.backgroundColor = '#1a73e8';
  });

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const emailData = extractEmailFromThread(replyArea);
    if (!emailData) {
      showToast('❌ Could not extract email content', 'error');
      return;
    }

    if (!emailData.threadId) {
      showToast('❌ Could not find thread ID', 'error');
      return;
    }

    // Update button state
    btn.textContent = '⏳ Generating...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
      const payload: GenerateDraftPayload = {
        subject: emailData.subject,
        sender: emailData.sender,
        senderEmail: emailData.senderEmail,
        body: emailData.body,
        threadId: emailData.threadId,
      };

      await generateDraft(payload);
      showToast('✅ AI Draft Created — check Gmail Drafts!', 'success');
      btn.textContent = '✅ Draft Created';

      setTimeout(() => {
        btn.textContent = '✨ AI Reply';
        btn.disabled = false;
        btn.style.opacity = '1';
      }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`❌ Error: ${msg}`, 'error');
      btn.textContent = '✨ AI Reply';
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  });

  return btn;
}

// ─── Injection ─────────────────────────────────────────────────

/**
 * Finds reply toolbars in open Gmail threads and injects the AI Reply button.
 * Uses multiple selectors to handle different Gmail layouts.
 */
function injectAIButtons(): void {
  // Multiple Gmail selectors for reply areas — Gmail changes its DOM periodically
  const replyAreaSelectors = [
    '.ams.bkH',         // Bottom reply area
    '.btC',             // Reply button row
    '.nH.ar9.T-I-J3',  // Reply toolbar
    '[data-tooltip="Reply"]', // Reply icon button parent
  ];

  for (const selector of replyAreaSelectors) {
    const replyAreas = document.querySelectorAll(selector);

    replyAreas.forEach((replyArea) => {
      // Skip if already injected
      if (replyArea.getAttribute(INJECTED_ATTR) === 'true') return;

      // Find the actual toolbar to inject into
      const toolbar = replyArea.closest('.nH') ?? replyArea.parentElement ?? replyArea;

      // Double check for existing button
      if (toolbar.querySelector(`[id^="${BUTTON_ID_PREFIX}"]`)) return;

      try {
        const btn = createAIReplyButton(replyArea);
        replyArea.setAttribute(INJECTED_ATTR, 'true');
        replyArea.appendChild(btn);
      } catch (err) {
        console.error('[Gmail AI] Failed to inject button:', err);
      }
    });
  }

  // Also inject near the main reply button at the bottom of threads
  injectNearReplyButton();
}

/**
 * Injects the AI Reply button near Gmail's native Reply button.
 * This covers the bottom-of-thread reply area.
 */
function injectNearReplyButton(): void {
  // Look for reply button containers at the bottom of email threads
  const replyButtonContainers = document.querySelectorAll(
    '.bAq, .aDh, [gh="mtb"]',
  );

  replyButtonContainers.forEach((container) => {
    if (container.getAttribute(INJECTED_ATTR) === 'true') return;
    if (container.querySelector(`[id^="${BUTTON_ID_PREFIX}"]`)) return;

    const btn = createAIReplyButton(container);
    container.setAttribute(INJECTED_ATTR, 'true');
    container.appendChild(btn);
  });
}

// ─── MutationObserver ──────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced injection — avoids flooding on rapid DOM mutations.
 */
function debouncedInject(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    injectAIButtons();
  }, 400);
}

/**
 * Starts observing Gmail's DOM for dynamic content changes.
 */
function startObserver(): void {
  const observer = new MutationObserver((mutations) => {
    const relevant = mutations.some((m) =>
      Array.from(m.addedNodes).some(
        (n) => n.nodeType === Node.ELEMENT_NODE,
      ),
    );
    if (relevant) debouncedInject();
  });

  const target = document.querySelector('[role="main"]') ?? document.body;
  observer.observe(target, { childList: true, subtree: true });
}

/**
 * Handles Gmail SPA route changes by re-running injection.
 */
function watchRouteChanges(): void {
  let lastUrl = window.location.href;

  const urlObserver = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      // Wait for new content to render
      setTimeout(injectAIButtons, 800);
      setTimeout(injectAIButtons, 1500);
    }
  });

  urlObserver.observe(document.body, { childList: true, subtree: true });
}

// ─── Bootstrap ─────────────────────────────────────────────────

function bootstrap(): void {
  // Initial injection attempts
  setTimeout(injectAIButtons, 1000);
  setTimeout(injectAIButtons, 2000);
  setTimeout(injectAIButtons, 4000);

  // Watch for dynamic content
  startObserver();
  watchRouteChanges();

  console.log('[Gmail AI Assistant] Content script active ✓');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
