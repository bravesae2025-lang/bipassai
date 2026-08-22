const toast = document.getElementById('toast');
let toastTimer;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function setupDrawer(session) {
  const hamburger  = document.getElementById('nav-hamburger');
  const overlay    = document.getElementById('drawer-overlay');
  const drawer     = document.getElementById('drawer');
  const closeBtn   = document.getElementById('drawer-close');
  const drawerUser = document.getElementById('drawer-user');
  const signoutBtn = document.getElementById('drawer-signout-btn');

  const email = session ? session.user.email : '';
  let displayName = session ? (session.user.user_metadata?.display_name || '') : '';
  const tier = session ? (bipassAccountMeta(session).tier || 'free') : 'free';
  const initials = () => (displayName || email || '?')[0].toUpperCase();

  function renderProfile() {
    drawerUser.innerHTML = `
      <div class="drawer-profile-row">
        <div class="drawer-avatar" id="drawer-avatar">${escapeHtml(initials())}</div>
        <div class="drawer-profile">
          <div class="drawer-username-row">
            <span class="drawer-username" id="drawer-username">${escapeHtml(displayName || 'Set a username')}</span>
            <button class="drawer-username-edit-btn" id="drawer-username-edit-btn" aria-label="Edit username">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
          <span class="drawer-user-email">${escapeHtml(email)}</span>
        </div>
      </div>
    `;
    document.getElementById('drawer-username-edit-btn').addEventListener('click', startEdit);
  }

  function startEdit() {
    const current = displayName;
    document.getElementById('drawer-username-edit-btn').style.display = 'none';
    document.getElementById('drawer-username').outerHTML = `<input class="drawer-username-input" id="drawer-username-input" type="text" value="${escapeHtml(current)}" placeholder="Enter username" maxlength="30" aria-label="Username" />`;
    const input = document.getElementById('drawer-username-input');
    input.focus();
    input.select();

    let done = false;
    async function save() {
      if (done) return;
      done = true;
      const newName = input.value.trim();
      if (newName && newName !== current) {
        try {
          await window.bipassAuth.client.auth.updateUser({ data: { display_name: newName } });
          displayName = newName;
        } catch {}
      }
      renderProfile();
    }
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') { done = true; renderProfile(); }
    });
    input.addEventListener('blur', save);
  }

  renderProfile();

  function openDrawer()  { drawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('drawer-lock'); }
  function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('drawer-lock'); }

  hamburger.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  if (signoutBtn) signoutBtn.addEventListener('click', () => window.bipassAuth.signOut());
}

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser(session);
  setupDrawer(session);
  bipassSetupPlanStatus(session);
  loadHistory(session);
}

async function setupNavUser(session) {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;
  navUser.innerHTML = `<span class="nav-user-email">${escapeHtml(session.user.email)}</span><button class="nav-signout" id="nav-signout-btn">Sign out</button>`;
  document.getElementById('nav-signout-btn').addEventListener('click', () => window.bipassAuth.signOut());
}

// ─── State ────────────────────────────────────────────────────

let allResults  = [];
let filterMode  = '';
let filterQuery = '';
let searchTimer = null;
const HISTORY_LIMIT = 20;

function normalizeResultMode(mode) {
  return ['level', 'generate', 'own'].includes(mode) ? mode : 'level';
}

function resultModeLabel(mode) {
  return mode === 'generate' ? 'Generated' : mode === 'own' ? 'Uploaded' : 'Level Matched';
}

// ─── Card builder ─────────────────────────────────────────────

function buildCard(item) {
  const text = String(item.text ?? '');
  const mode = normalizeResultMode(String(item.mode ?? ''));
  const level = String(item.level ?? '');
  const id = String(item.id ?? '');
  const div = document.createElement('div');
  div.className = 'history-item';
  div.dataset.id = id;
  div.innerHTML = `
    <div class="history-item-meta">
      <span class="history-badge">${resultModeLabel(mode)} · ${escapeHtml(level)}</span>
      <span class="history-date">${formatDate(item.created_at)}</span>
    </div>
    <p class="history-preview">${escapeHtml(text.slice(0, 200))}${text.length > 200 ? '…' : ''}</p>
    <div class="history-actions">
      <button class="history-btn history-btn-copy" data-text="${escapeHtml(text)}">Copy</button>
      <button class="history-btn history-btn-load" data-id="${escapeHtml(id)}" data-text="${escapeHtml(text)}" data-mode="${escapeHtml(mode)}">Open in editor</button>
      <button class="history-btn history-btn-delete" data-id="${escapeHtml(id)}">Delete</button>
    </div>
  `;
  return div;
}

function bindCardActions(container) {
  if (container.dataset.actionsBound === 'true') return;
  container.dataset.actionsBound = 'true';
  container.addEventListener('click', async e => {
    const copyBtn   = e.target.closest('.history-btn-copy');
    const loadBtn   = e.target.closest('.history-btn-load');
    const deleteBtn = e.target.closest('.history-btn-delete');

    if (copyBtn) {
      await navigator.clipboard.writeText(copyBtn.dataset.text).catch(() => {});
      showToast('Copied');
    }

    if (loadBtn) {
      sessionStorage.setItem('bipass_result', loadBtn.dataset.text);
      sessionStorage.setItem('bipass_mode', normalizeResultMode(loadBtn.dataset.mode));
      sessionStorage.setItem('bipass_result_id', loadBtn.dataset.id);
      sessionStorage.removeItem('bipass_applied_profile');
      window.location.href = 'editor.html';
    }

    if (deleteBtn) {
      if (!window.confirm('Delete this saved result?')) return;
      const id = deleteBtn.dataset.id;
      const { error } = await window.bipassAuth.client.from('results').delete().eq('id', id);
      if (!error) {
        if (sessionStorage.getItem('bipass_result_id') === id) {
          sessionStorage.removeItem('bipass_result_id');
        }
        allResults = allResults.filter(r => String(r.id) !== String(id));
        renderFiltered();
      }
    }
  });
}

// ─── Filter + render ──────────────────────────────────────────

function renderFiltered() {
  const q = filterQuery.toLowerCase();
  const filtered = allResults.filter(item => {
    const modeMatch  = !filterMode || item.mode === filterMode;
    const queryMatch = !q || String(item.text ?? '').toLowerCase().includes(q);
    return modeMatch && queryMatch;
  });

  const listEl    = document.getElementById('history-list');
  const emptyEl   = document.getElementById('history-empty-search');
  const subEl     = document.getElementById('history-sub');

  listEl.innerHTML = '';
  filtered.forEach(item => listEl.appendChild(buildCard(item)));
  bindCardActions(listEl);

  emptyEl.classList.toggle('hidden', filtered.length > 0 || allResults.length === 0);

  if (allResults.length === 0) {
    subEl.textContent = `0 / ${HISTORY_LIMIT} saved results — match a draft to save your first result.`;
  } else if (allResults.length >= HISTORY_LIMIT) {
    subEl.textContent = `${HISTORY_LIMIT} / ${HISTORY_LIMIT} saved results — History full. Delete one to create another.`;
  } else if (filtered.length === allResults.length) {
    subEl.textContent = `${allResults.length} / ${HISTORY_LIMIT} saved results`;
  } else {
    subEl.textContent = `Showing ${filtered.length} of ${allResults.length} · ${allResults.length} / ${HISTORY_LIMIT} saved`;
  }
}

// ─── Load + wire controls ─────────────────────────────────────

async function loadHistory(session) {
  const subEl = document.getElementById('history-sub');

  const { data, error } = await window.bipassAuth.client
    .from('results')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) { subEl.textContent = 'Failed to load history.'; return; }
  if (!data || data.length === 0) {
    subEl.textContent = `0 / ${HISTORY_LIMIT} saved results — match a draft to save your first result.`;
    return;
  }

  allResults = data.map(item => ({ ...item, mode: normalizeResultMode(item.mode) }));
  renderFiltered();

  // Show controls
  document.getElementById('history-controls').style.display = '';

  // Search input
  const searchInput = document.getElementById('history-search');
  const clearBtn    = document.getElementById('history-search-clear');
  const clearAllBtn = document.getElementById('history-clear-all');

  searchInput.addEventListener('input', () => {
    filterQuery = searchInput.value;
    clearBtn.classList.toggle('hidden', !filterQuery);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderFiltered, 200);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterQuery = '';
    clearBtn.classList.add('hidden');
    renderFiltered();
    searchInput.focus();
  });

  clearAllBtn.addEventListener('click', async () => {
    if (!window.confirm(`Clear all ${allResults.length} saved results? This cannot be undone.`)) return;

    clearAllBtn.disabled = true;
    clearAllBtn.textContent = 'Clearing…';
    const { error } = await window.bipassAuth.client
      .from('results')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      clearAllBtn.disabled = false;
      clearAllBtn.textContent = 'Clear history';
      showToast('History could not be cleared');
      return;
    }

    allResults = [];
    filterMode = '';
    filterQuery = '';
    sessionStorage.removeItem('bipass_result_id');
    document.getElementById('history-controls').style.display = 'none';
    renderFiltered();
    showToast('History cleared');
  });

  // Mode pills
  document.querySelectorAll('.history-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.history-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterMode = btn.dataset.mode;
      renderFiltered();
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
