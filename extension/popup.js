const SUPABASE_URL  = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZXdtdWdxcnBkaHBkZnl2enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjQ3MzMsImV4cCI6MjA5NDU0MDczM30.euNVW05tZ39McxW9vvgcv527I2Pk8VeeUy1jcu21FSE';
const BIPASS_URL    = 'https://bipassai.com';

let currentText  = '';
let currentSpeed = 45;

const states = ['loading', 'login', 'upgrade', 'empty', 'list', 'ready', 'armed'];
function showState(name) {
  states.forEach(s => document.getElementById(`state-${s}`).classList.remove('active'));
  document.getElementById(`state-${name}`).classList.add('active');
}

function countWords(str) {
  return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function storeSession(data) {
  const tier = data.user?.user_metadata?.tier || 'free';
  await chrome.storage.local.set({
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    user_id:       data.user.id,
    tier,
  });
  return { access_token: data.access_token, user_id: data.user.id, tier };
}

async function refreshSession() {
  const { refresh_token } = await chrome.storage.local.get(['refresh_token']);
  if (!refresh_token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });
  if (!res.ok) return null;
  return storeSession(await res.json());
}

async function fetchResults(accessToken, userId, tier) {
  if (tier === 'free') { showState('upgrade'); return; }

  let res = await fetch(
    `${SUPABASE_URL}/rest/v1/results?user_id=eq.${userId}&order=created_at.desc`,
    { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${accessToken}` } }
  );

  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (!refreshed) { await chrome.storage.local.clear(); showState('login'); return; }
    ({ access_token: accessToken, user_id: userId, tier } = refreshed);
    if (tier === 'free') { showState('upgrade'); return; }
    res = await fetch(
      `${SUPABASE_URL}/rest/v1/results?user_id=eq.${userId}&order=created_at.desc`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${accessToken}` } }
    );
  }

  if (!res.ok) { await chrome.storage.local.clear(); showState('login'); return; }

  const rows = await res.json();
  if (!rows.length) { showState('empty'); return; }

  const list = document.getElementById('result-list');
  list.innerHTML = '';
  rows.forEach(row => {
    const item        = document.createElement('div');
    item.className    = 'result-item';
    const modeLabel   = row.mode === 'generate' ? 'Generated' : 'Humanized';
    const levelLabel  = row.level ? ` · ${row.level}` : '';
    const preview     = row.text.length > 80 ? row.text.slice(0, 80) + '…' : row.text;
    item.innerHTML = `
      <div class="result-meta">
        <span class="result-badge">${modeLabel}${levelLabel}</span>
        <span class="result-date">${formatDate(row.created_at)}</span>
      </div>
      <div class="result-preview">${preview}</div>
    `;
    item.addEventListener('click', () => selectResult(row.text, row.mode));
    list.appendChild(item);
  });
  showState('list');
}

function selectResult(text, mode) {
  currentText = text;
  const words = countWords(text);
  document.getElementById('preview-text').textContent = text;
  document.getElementById('preview-wc').textContent   = `${words} word${words !== 1 ? 's' : ''}`;
  document.getElementById('preview-mode').textContent = mode === 'generate' ? 'Generated' : 'Humanized';
  showState('ready');
}

async function init() {
  showState('loading');
  const { access_token, refresh_token, user_id, tier } = await chrome.storage.local.get(['access_token', 'refresh_token', 'user_id', 'tier']);
  if (!access_token && !refresh_token) { showState('login'); return; }
  if (!access_token) {
    const refreshed = await refreshSession();
    if (!refreshed) { showState('login'); return; }
    await fetchResults(refreshed.access_token, refreshed.user_id, refreshed.tier);
    return;
  }
  await fetchResults(access_token, user_id, tier);
}

// ── Email / password login ──────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error_description || 'Invalid email or password.'; return; }
    const session = await storeSession(data);
    await fetchResults(session.access_token, session.user_id, session.tier);
  } catch {
    errEl.textContent = 'Connection error. Try again.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});

// ── Google sign-in ──────────────────────────────────────────────
document.getElementById('google-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('login-error');
  const btn   = document.getElementById('google-btn');
  errEl.textContent = '';
  btn.disabled = true;

  try {
    const configRes = await fetch(`${BIPASS_URL}/config`);
    const { googleClientId } = await configRes.json();
    if (!googleClientId) { errEl.textContent = 'Google login not configured yet.'; return; }

    const extId       = chrome.runtime.id;
    const redirectUri = `https://${extId}.chromiumapp.org/`;

    const params = new URLSearchParams({
      client_id:     googleClientId,
      redirect_uri:  redirectUri,
      response_type: 'code',
      scope:         'openid email profile',
      access_type:   'offline',
      prompt:        'select_account',
    });

    const responseUrl = await new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, interactive: true },
        url => chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError.message)) : resolve(url)
      );
    });

    const code = new URL(responseUrl).searchParams.get('code');
    if (!code) { errEl.textContent = 'Google sign-in cancelled.'; return; }

    const exchangeRes = await fetch(`${BIPASS_URL}/auth/google/exchange-extension`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });
    const exchangeData = await exchangeRes.json();
    if (!exchangeRes.ok) { errEl.textContent = exchangeData.error || 'Google sign-in failed.'; return; }

    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_hash: exchangeData.token_hash, type: 'magiclink' }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) { errEl.textContent = verifyData.msg || 'Sign-in failed. Try again.'; return; }

    const session = await storeSession(verifyData);
    await fetchResults(session.access_token, session.user_id, session.tier);

  } catch (err) {
    errEl.textContent = err.message === 'canceled' ? 'Sign-in cancelled.' : 'Google sign-in failed.';
  } finally {
    btn.disabled = false;
  }
});

// ── Sign out ────────────────────────────────────────────────────
document.getElementById('signout-btn').addEventListener('click', async () => {
  await chrome.storage.local.clear();
  showState('login');
});

// ── Back (ready → list) ─────────────────────────────────────────
document.getElementById('back-btn').addEventListener('click', async () => {
  const { access_token, user_id, tier } = await chrome.storage.local.get(['access_token', 'user_id', 'tier']);
  await fetchResults(access_token, user_id, tier);
});

// ── Speed buttons ───────────────────────────────────────────────
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSpeed = parseInt(btn.dataset.speed);
    document.getElementById('speed-val').textContent = btn.dataset.label;
  });
});

// ── Start button ────────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', async () => {
  if (!currentText) return;
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab) return;
  try { await chrome.scripting.executeScript({ target: { tabId: activeTab.id }, files: ['content.js'] }); } catch {}
  await chrome.tabs.sendMessage(activeTab.id, { type: 'ARM', text: currentText, speed: currentSpeed });
  showState('armed');
});

// ── Cancel button ───────────────────────────────────────────────
document.getElementById('cancel-btn').addEventListener('click', async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) chrome.tabs.sendMessage(activeTab.id, { type: 'STOP' }).catch(() => {});
  showState('ready');
});

// ── Navigation ──────────────────────────────────────────────────
document.getElementById('open-bipass').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://bipassai.com/app.html' });
});
document.getElementById('open-upgrade').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://bipassai.com/plans.html' });
});

init();
