// ─── Settings ─────────────────────────────────────────────────

const toast = document.getElementById('toast');
let toastTimer;

function showToast(msg, duration = 2500) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 250);
  }, duration);
}

// ─── Drawer ───────────────────────────────────────────────────

function setupDrawer(session) {
  const hamburger  = document.getElementById('nav-hamburger');
  const overlay    = document.getElementById('drawer-overlay');
  const drawer     = document.getElementById('drawer');
  const closeBtn   = document.getElementById('drawer-close');
  const drawerUser = document.getElementById('drawer-user');
  const signoutBtn = document.getElementById('drawer-signout-btn');

  const email = session.user.email || '';
  const displayName = session.user.user_metadata?.display_name || '';
  const tier = session.user.user_metadata?.tier || 'free';
  const tierLabel = { free: 'Free', pro: 'Pro', premium: 'Premium' }[tier] || 'Free';
  const initial = (displayName || email || '?')[0].toUpperCase();

  drawerUser.innerHTML = `
    <div class="drawer-profile-row">
      <div class="drawer-avatar">${initial}</div>
      <div class="drawer-profile">
        <span class="drawer-username">${displayName || email || 'User'}</span>
        <span class="drawer-user-email">${email}</span>
        <a class="drawer-tier-badge drawer-tier-${tier}" href="plans.html">${tierLabel}</a>
      </div>
    </div>
  `;

  function open()  { drawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('drawer-lock'); }
  function close() { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('drawer-lock'); }

  hamburger.addEventListener('click', open);
  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  if (signoutBtn) signoutBtn.addEventListener('click', () => window.bipassAuth.signOut());
}

// ─── Nav user ─────────────────────────────────────────────────

async function setupNavUser(session) {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;
  navUser.innerHTML = `
    <span class="nav-user-email">${session.user.email}</span>
    <button class="nav-signout" id="nav-signout-btn">Sign out</button>
  `;
  document.getElementById('nav-signout-btn').addEventListener('click', () => window.bipassAuth.signOut());
}

// ─── Profile ──────────────────────────────────────────────────

function setupProfile(session) {
  const user = session.user;
  const email = user.email || '';
  let displayName = user.user_metadata?.display_name || '';
  const tier = user.user_metadata?.tier || 'free';
  const tierLabel = { free: 'Free', pro: 'Pro', premium: 'Premium' }[tier] || 'Free';

  const avatarEl = document.getElementById('settings-avatar');
  const emailEl  = document.getElementById('settings-email');
  const tierEl   = document.getElementById('settings-tier');

  function initial() { return (displayName || email || '?')[0].toUpperCase(); }

  function renderName() {
    document.getElementById('settings-username').textContent = displayName || 'Set a username';
    avatarEl.textContent = initial();
  }

  avatarEl.textContent = initial();
  emailEl.textContent  = email;
  tierEl.textContent   = tierLabel;
  tierEl.className     = `drawer-tier-badge drawer-tier-${tier}`;
  renderName();

  document.getElementById('settings-username-edit-btn').addEventListener('click', function startEdit() {
    const current = displayName;
    this.style.display = 'none';
    const span = document.getElementById('settings-username');
    span.outerHTML = `<input class="settings-username-input" id="settings-username-input" type="text" value="${current}" placeholder="Enter username" maxlength="30" />`;
    const input = document.getElementById('settings-username-input');
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
          showToast('Name saved');
        } catch { showToast('Could not save name'); }
      }
      input.outerHTML = `<span class="settings-username" id="settings-username">${displayName || 'Set a username'}</span>`;
      const editBtn = document.getElementById('settings-username-edit-btn');
      if (editBtn) editBtn.style.display = '';
      avatarEl.textContent = initial();
    }

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') {
        done = true;
        input.outerHTML = `<span class="settings-username" id="settings-username">${current || 'Set a username'}</span>`;
        const editBtn = document.getElementById('settings-username-edit-btn');
        if (editBtn) editBtn.style.display = '';
      }
    });
    input.addEventListener('blur', save);
  });
}

// ─── Credits ──────────────────────────────────────────────────

function setupCredits(session) {
  const numEl     = document.getElementById('settings-credits');
  const refreshBtn = document.getElementById('settings-refresh-btn');

  function display(n) {
    numEl.textContent = typeof n === 'number' ? n.toLocaleString() : '—';
  }

  display(session.user.user_metadata?.credits ?? 5000);

  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '…';
    try {
      const credits = await window.bipassAuth.refreshCredits();
      display(credits);
      showToast('Refreshed');
    } catch { showToast('Could not refresh'); }
    finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '↻';
    }
  });
}

// ─── Defaults ─────────────────────────────────────────────────

function setupDefaults() {
  const LEVEL_KEY   = 'bipass_pref_level';
  const MYSTYLE_KEY = 'bipass_pref_mystyle';

  const currentLevel = localStorage.getItem(LEVEL_KEY) || 'easy';
  const levelBtns = document.querySelectorAll('.settings-level-opt');
  levelBtns.forEach(btn => {
    if (btn.dataset.level === currentLevel) btn.classList.add('active');
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      localStorage.setItem(LEVEL_KEY, btn.dataset.level);
      showToast('Default level saved');
    });
  });

  const mystyleToggle = document.getElementById('pref-mystyle');
  mystyleToggle.checked = localStorage.getItem(MYSTYLE_KEY) === 'true';
  mystyleToggle.addEventListener('change', () => {
    localStorage.setItem(MYSTYLE_KEY, mystyleToggle.checked ? 'true' : 'false');
    showToast(mystyleToggle.checked ? 'My Style on by default' : 'My Style off by default');
  });
}

// ─── My Style ─────────────────────────────────────────────────

async function setupMyStyle(session) {
  const loadingEl = document.getElementById('mystyle-loading');
  const emptyEl   = document.getElementById('mystyle-empty');
  const contentEl = document.getElementById('mystyle-content');
  const traitsEl  = document.getElementById('settings-traits');
  const promptEl  = document.getElementById('settings-style-prompt');
  const clearBtn  = document.getElementById('clear-style-btn');

  try {
    const { data } = await window.bipassAuth.client
      .from('user_styles')
      .select('style_summary, style_prompt')
      .eq('user_id', session.user.id)
      .single();

    loadingEl.classList.add('hidden');

    if (!data) {
      emptyEl.classList.remove('hidden');
      return;
    }

    contentEl.classList.remove('hidden');

    let traits = [];
    try { traits = JSON.parse(data.style_summary); } catch { traits = [data.style_summary]; }
    traitsEl.innerHTML = traits.map(t => `<span class="settings-trait-chip">${typeof t === 'string' ? t : t.name}</span>`).join('');
    promptEl.textContent = data.style_prompt;

    clearBtn.addEventListener('click', async () => {
      if (!confirm('Clear your style profile? This cannot be undone.')) return;
      try {
        await window.bipassAuth.client
          .from('user_styles')
          .delete()
          .eq('user_id', session.user.id);
        contentEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        showToast('Style profile cleared');
      } catch { showToast('Could not clear style'); }
    });
  } catch {
    loadingEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
  }
}

// ─── Danger Zone ──────────────────────────────────────────────

function setupDangerZone() {
  document.getElementById('signout-btn').addEventListener('click', () => window.bipassAuth.signOut());

  const modal      = document.getElementById('delete-modal');
  const cancelBtn  = document.getElementById('delete-modal-cancel');
  const confirmBtn = document.getElementById('delete-modal-confirm');

  document.getElementById('delete-account-btn').addEventListener('click', () => modal.classList.remove('hidden'));
  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting…';
    try {
      const token = await window.bipassAuth.getToken();
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      await window.bipassAuth.client.auth.signOut();
      window.location.replace('login.html');
    } catch {
      showToast('Could not delete account — try again');
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Yes, Delete';
      modal.classList.add('hidden');
    }
  });
}

// ─── Init ─────────────────────────────────────────────────────

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser(session);
  setupDrawer(session);
  bipassSetupPlanStatus(session);
  setupProfile(session);
  setupCredits(session);
  setupDefaults();
  await setupMyStyle(session);
  setupDangerZone();
}

init();
