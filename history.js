const toast = document.getElementById('toast');
let toastTimer;

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser(session);
  loadHistory(session);
}

async function setupNavUser(session) {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;
  navUser.innerHTML = `<span class="nav-user-email">${session.user.email}</span><button class="nav-signout" id="nav-signout-btn">Sign out</button>`;
  document.getElementById('nav-signout-btn').addEventListener('click', () => window.bipassAuth.signOut());
}

async function loadHistory(session) {
  const subEl  = document.getElementById('history-sub');
  const listEl = document.getElementById('history-list');

  const { data, error } = await window.bipassAuth.client
    .from('results')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) { subEl.textContent = 'Failed to load history.'; return; }
  if (!data || data.length === 0) {
    subEl.textContent = 'No saved results yet — humanize some text first.';
    return;
  }

  subEl.textContent = `${data.length} saved result${data.length !== 1 ? 's' : ''}`;

  listEl.innerHTML = data.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-item-meta">
        <span class="history-badge">${item.mode === 'generate' ? 'Generated' : 'Humanized'} · ${item.level}</span>
        <span class="history-date">${formatDate(item.created_at)}</span>
      </div>
      <p class="history-preview">${escapeHtml(item.text.slice(0, 200))}${item.text.length > 200 ? '…' : ''}</p>
      <div class="history-actions">
        <button class="history-btn history-btn-copy" data-text="${escapeAttr(item.text)}">Copy</button>
        <button class="history-btn history-btn-load" data-text="${escapeAttr(item.text)}" data-mode="${item.mode}">Open in editor</button>
        <button class="history-btn history-btn-delete" data-id="${item.id}">Delete</button>
      </div>
    </div>
  `).join('');

  listEl.addEventListener('click', async e => {
    const copyBtn   = e.target.closest('.history-btn-copy');
    const loadBtn   = e.target.closest('.history-btn-load');
    const deleteBtn = e.target.closest('.history-btn-delete');

    if (copyBtn) {
      await navigator.clipboard.writeText(copyBtn.dataset.text).catch(() => {});
      showToast('Copied');
    }

    if (loadBtn) {
      sessionStorage.setItem('bipass_result', loadBtn.dataset.text);
      sessionStorage.setItem('bipass_mode', loadBtn.dataset.mode);
      window.location.href = 'editor.html';
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const { error } = await window.bipassAuth.client.from('results').delete().eq('id', id);
      if (!error) {
        deleteBtn.closest('.history-item').remove();
        const remaining = document.querySelectorAll('.history-item').length;
        subEl.textContent = `${remaining} saved result${remaining !== 1 ? 's' : ''}`;
        if (remaining === 0) subEl.textContent = 'No saved results yet — humanize some text first.';
      }
    }
  });
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 200);
  }, 2200);
}

init();
