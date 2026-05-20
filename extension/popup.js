const SUPABASE_URL  = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZXdtdWdxcnBkaHBkZnl2enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjQ3MzMsImV4cCI6MjA5NDU0MDczM30.euNVW05tZ39McxW9vvgcv527I2Pk8VeeUy1jcu21FSE';

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

async function fetchResults(accessToken, userId, tier) {
  if (tier === 'free') { showState('upgrade'); return; }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/results?user_id=eq.${userId}&order=created_at.desc`,
    {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    // Token may be expired — force re-login
    await chrome.storage.local.clear();
    showState('login');
    return;
  }

  const rows = await res.json();

  if (!rows.length) { showState('empty'); return; }

  const list = document.getElementById('result-list');
  list.innerHTML = '';
  rows.forEach(row => {
    const item = document.createElement('div');
    item.className = 'result-item';

    const modeLabel = row.mode === 'generate' ? 'Generated' : 'Humanized';
    const levelLabel = row.level ? ` · ${row.level}` : '';
    const preview = row.text.length > 80 ? row.text.slice(0, 80) + '…' : row.text;

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
  const { access_token, user_id, tier } = await chrome.storage.local.get(['access_token', 'user_id', 'tier']);
  if (!access_token) { showState('login'); return; }
  await fetchResults(access_token, user_id, tier);
}

// Login form
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
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error_description || data.msg || 'Invalid email or password.';
      return;
    }

    const tier = data.user?.user_metadata?.tier || 'free';
    await chrome.storage.local.set({
      access_token: data.access_token,
      user_id:      data.user.id,
      tier,
    });

    await fetchResults(data.access_token, data.user.id, tier);

  } catch {
    errEl.textContent = 'Connection error. Try again.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});

// Sign out
document.getElementById('signout-btn').addEventListener('click', async () => {
  await chrome.storage.local.clear();
  showState('login');
});

// Back button (ready → list)
document.getElementById('back-btn').addEventListener('click', async () => {
  const { access_token, user_id, tier } = await chrome.storage.local.get(['access_token', 'user_id', 'tier']);
  await fetchResults(access_token, user_id, tier);
});

// Speed buttons
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSpeed = parseInt(btn.dataset.speed);
    document.getElementById('speed-val').textContent = btn.dataset.label;
  });
});

// Start button
document.getElementById('start-btn').addEventListener('click', async () => {
  if (!currentText) return;

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['content.js'],
    });
  } catch {}

  await chrome.tabs.sendMessage(activeTab.id, {
    type: 'ARM',
    text: currentText,
    speed: currentSpeed,
  });

  showState('armed');
});

// Cancel button
document.getElementById('cancel-btn').addEventListener('click', async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    chrome.tabs.sendMessage(activeTab.id, { type: 'STOP' }).catch(() => {});
  }
  showState('ready');
});

// Navigation links
document.getElementById('open-bipass').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://bipassai.com/app.html' });
});
document.getElementById('open-upgrade').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://bipassai.com/plans.html' });
});
document.getElementById('forgot-link').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://bipassai.com/login.html' });
});

init();
