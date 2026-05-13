/**
 * Plasmo Content Script — Gmail AI Assistant
 *
 * Self-contained: NO external imports.
 * Event delegation via document.addEventListener → survives all Gmail re-renders.
 * Button identified by stable ID attribute.
 */

export const config = {
  matches: ['https://mail.google.com/*'],
  run_at: 'document_idle',
};

// ─── Config ────────────────────────────────────────────────────

const BUTTON_ID   = 'gmail-ai-reply-btn';
const BUTTON_ATTR = 'data-gmail-ai-btn';
const TOAST_ID    = 'gmail-ai-toast';
const BACKEND_URL = 'http://localhost:3000';

// ─── Toast ─────────────────────────────────────────────────────

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
  document.getElementById(TOAST_ID)?.remove();
  const colors: Record<string, string> = { success: '#16a34a', error: '#dc2626', info: '#2563eb' };
  const el = document.createElement('div');
  el.id = TOAST_ID;
  Object.assign(el.style, {
    position: 'fixed', bottom: '28px', right: '28px', zIndex: '2147483647',
    backgroundColor: colors[type], color: '#fff', padding: '12px 20px',
    borderRadius: '8px', fontSize: '14px', fontWeight: '600',
    fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: '360px',
    lineHeight: '1.4', pointerEvents: 'none', opacity: '1',
    transition: 'opacity 0.3s ease',
  });
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 350); }, 4000);
}

// ─── Email Extraction ──────────────────────────────────────────

function getThreadId() {
  const hash = window.location.hash;
  const parts = hash.replace('#', '').split('/');
  const id = parts[parts.length - 1] ?? '';
  console.log('[Gmail AI] Thread ID:', id, '| hash:', hash);
  return id;
}

function extractEmailData() {
  console.log('[Gmail AI] Extracting email data...');
  const subjectEl = document.querySelector('h2.hP') ?? document.querySelector('.ha h2');
  const subject = subjectEl?.textContent?.trim() ?? document.title.replace(/\s*[-]\s*Gmail$/, '').trim() ?? '(No Subject)';
  console.log('[Gmail AI] Subject:', subject);
  const senderEl = document.querySelector('.gD[email]') ?? document.querySelector('[email][name]') ?? document.querySelector('.go');
  const sender = senderEl?.getAttribute('name') ?? senderEl?.textContent?.trim() ?? 'Unknown';
  const senderEmail = senderEl?.getAttribute('email') ?? senderEl?.getAttribute('data-hovercard-id') ?? sender;
  console.log('[Gmail AI] Sender:', sender, senderEmail);
  const bodyEls = Array.from(document.querySelectorAll<HTMLElement>('.a3s.aiL, .a3s'));
  const bodyEl = bodyEls[bodyEls.length - 1] ?? null;
  let body = bodyEl?.innerText?.trim() ?? '';
  body = body.split('\n').filter((l: string) => !l.trim().startsWith('>')).join('\n').trim();
  if (!body) body = bodyEl?.textContent?.trim() ?? '(No body)';
  console.log('[Gmail AI] Body length:', body.length);
  const threadId = getThreadId();
  return { subject, sender, senderEmail, body, threadId };
}

// ─── Button State ───────────────────────────────────────────────

function setBtn(state: 'loading' | 'success' | 'idle'): void {
  const btn = document.getElementById(BUTTON_ID);
  if (!btn) return;
  btn.setAttribute('data-ai-state', state);
  if (state === 'loading') {
    btn.innerHTML = '<span style="font-size:14px">⏳</span><span>Generating…</span>';
    btn.style.backgroundColor = '#1557b0';
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.8';
  } else if (state === 'success') {
    btn.innerHTML = '<span style="font-size:14px">✅</span><span>Draft Created</span>';
    btn.style.backgroundColor = '#16a34a';
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '1';
  } else {
    btn.innerHTML = '<span style="font-size:14px;line-height:1">✨</span><span>AI Reply</span>';
    btn.style.backgroundColor = '#1a73e8';
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
  }
}

// ─── Click Handler ─────────────────────────────────────────────

async function handleClick() {
  console.log('[Gmail AI] ==== AI Reply CLICKED ====');
  console.log('[Gmail AI] URL:', window.location.href);

  const btn = document.getElementById(BUTTON_ID);
  if (btn && btn.getAttribute('data-ai-state') === 'loading') {
    console.log('[Gmail AI] Already generating, skip');
    return;
  }

  setBtn('loading');

  try {
    const data = extractEmailData();

    if (!data.threadId) throw new Error('No thread ID in URL — is an email open?');
    if (!data.body || data.body === '(No body)') throw new Error('Email body not found');

    const payload = {
      subject: data.subject,
      sender: data.sender,
      senderEmail: data.senderEmail,
      body: data.body,
      threadId: data.threadId,
    };

    console.log('[Gmail AI] Sending to backend:', JSON.stringify(payload).slice(0, 200));

    const res = await fetch(`${BACKEND_URL}/generate-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('[Gmail AI] Response status:', res.status);
    const text = await res.text();
    console.log('[Gmail AI] Response body:', text.slice(0, 300));

    if (!res.ok) throw new Error(`Backend error ${res.status}: ${text.slice(0, 150)}`);

    const json = JSON.parse(text);
    console.log('[Gmail AI] Draft created:', json);

    setBtn('success');
    showToast('✅ AI Draft Created! Check your Drafts folder.', 'success');
    setTimeout(() => setBtn('idle'), 4000);

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Gmail AI] ERROR:', msg);
    showToast('❌ Failed: ' + msg, 'error');
    setBtn('idle');
  }
}

// ─── Event Delegation ──────────────────────────────────────────
// Capture-phase listener on document — fires even if Gmail stops propagation.
// Matches the button by ID or BUTTON_ATTR regardless of DOM re-renders.

document.addEventListener('click', function(e) {
  const target = e.target as HTMLElement | null;
  if (!target) return;
  const btn = (target as HTMLElement).closest('#' + BUTTON_ID + ', [' + BUTTON_ATTR + ']') as HTMLElement | null;
  if (btn) {
    console.log('[Gmail AI] Delegated click caught on document');
    e.preventDefault();
    e.stopImmediatePropagation();
    handleClick();
  }
}, true);

// ─── Toolbar Detection ─────────────────────────────────────────

function findToolbar() {
  const ghTm = document.querySelector('div[gh="tm"]');
  if (ghTm) { console.log('[Gmail AI] Toolbar: div[gh="tm"]'); return ghTm; }

  for (const tb of Array.from(document.querySelectorAll('[role="toolbar"]'))) {
    if (
      tb.querySelector('[data-tooltip="Archive"],[aria-label="Archive"]') ||
      tb.querySelector('[data-tooltip="Delete"],[aria-label="Delete"]')
    ) {
      console.log('[Gmail AI] Toolbar: role=toolbar');
      return tb;
    }
  }

  for (const sel of ['[data-tooltip="More"]','[aria-label="More"]','[data-tooltip="More options"]']) {
    const more = document.querySelector(sel);
    if (!more) continue;
    let node = more.parentElement;
    for (let i = 0; i < 6 && node; i++) {
      if (node.querySelectorAll('[data-tooltip]').length >= 3) {
        console.log('[Gmail AI] Toolbar: More-button walk depth', i);
        return node;
      }
      node = node.parentElement;
    }
  }

  const archive = document.querySelector('[data-tooltip="Archive"],[aria-label="Archive"]');
  if (archive) {
    let node = archive.parentElement;
    for (let i = 0; i < 6 && node; i++) {
      if (node.querySelectorAll('[data-tooltip],[aria-label]').length >= 3) {
        console.log('[Gmail AI] Toolbar: Archive-button walk depth', i);
        return node;
      }
      node = node.parentElement;
    }
  }

  console.warn('[Gmail AI] Toolbar NOT found');
  return null;
}

// ─── Injection ─────────────────────────────────────────────────

function isEmailOpen() {
  const hash = window.location.hash;
  if (!hash.includes('/')) return false;
  const id = hash.split('/').pop() ?? '';
  return id.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(id);
}

function removeButton() {
  document.getElementById(BUTTON_ID)?.remove();
}

function buildButton() {
  const btn = document.createElement('div');
  btn.id = BUTTON_ID;
  btn.setAttribute(BUTTON_ATTR, 'true');
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  btn.setAttribute('data-ai-state', 'idle');
  btn.setAttribute('aria-label', 'AI Reply');
  Object.assign(btn.style, {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '5px', padding: '0 14px', height: '32px', borderRadius: '4px',
    backgroundColor: '#1a73e8', color: '#ffffff', fontSize: '13px',
    fontWeight: '600', fontFamily: '"Google Sans",Roboto,Arial,sans-serif',
    cursor: 'pointer', marginLeft: '8px', userSelect: 'none', flexShrink: '0',
    transition: 'background-color 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    pointerEvents: 'auto', position: 'relative', zIndex: '9',
  });
  btn.innerHTML = '<span style="font-size:14px;line-height:1">✨</span><span>AI Reply</span>';

  // Direct listener (backup to delegation)
  btn.addEventListener('click', function(e) {
    console.log('[Gmail AI] Direct click on button');
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  }, true);

  btn.addEventListener('mouseenter', () => { if (btn.getAttribute('data-ai-state') === 'idle') btn.style.backgroundColor = '#1557b0'; });
  btn.addEventListener('mouseleave', () => { if (btn.getAttribute('data-ai-state') === 'idle') btn.style.backgroundColor = '#1a73e8'; });
  btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } });

  return btn;
}

function tryInject() {
  if (document.getElementById(BUTTON_ID)) return true;
  if (!isEmailOpen()) return false;
  const toolbar = findToolbar();
  if (!toolbar) return false;
  const btn = buildButton();
  const more = toolbar.querySelector('[data-tooltip="More"],[aria-label="More"],[data-tooltip="More options"]');
  if (more) { more.insertAdjacentElement('afterend', btn); console.log('[Gmail AI] ✅ Injected after More'); }
  else       { toolbar.appendChild(btn);                   console.log('[Gmail AI] ✅ Injected at end of toolbar'); }
  return true;
}

// ─── Bootstrap ─────────────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastUrl = location.href;

function scheduleInject(ms = 400) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!tryInject()) {
      setTimeout(tryInject, 600);
      setTimeout(tryInject, 1500);
      setTimeout(tryInject, 3000);
    }
  }, ms);
}

function onUrlChange() {
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  console.log('[Gmail AI] URL changed:', location.href);
  removeButton();
  scheduleInject(350);
}

function bootstrap() {
  console.log('[Gmail AI] Content script bootstrapped | URL:', location.href);
  tryInject();
  scheduleInject(500);
  setTimeout(tryInject, 1200);
  setTimeout(tryInject, 2500);
  setTimeout(tryInject, 5000);

  new MutationObserver(() => {
    onUrlChange();
    if (isEmailOpen() && !document.getElementById(BUTTON_ID)) scheduleInject(250);
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener('hashchange', () => { console.log('[Gmail AI] hashchange:', location.hash); removeButton(); scheduleInject(350); });
  window.addEventListener('popstate',   () => { removeButton(); scheduleInject(350); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
