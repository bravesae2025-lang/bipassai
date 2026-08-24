// ─── Settings ─────────────────────────────────────────────────

const toast = document.getElementById('toast');
let toastTimer;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

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
  const tier = bipassAccountMeta(session).tier || 'free';
  const initial = (displayName || email || '?')[0].toUpperCase();

  drawerUser.innerHTML = `
    <div class="drawer-profile-row">
      <div class="drawer-avatar">${escapeHtml(initial)}</div>
      <div class="drawer-profile">
        <span class="drawer-username">${escapeHtml(displayName || email || 'User')}</span>
        <span class="drawer-user-email">${escapeHtml(email)}</span>
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
    <span class="nav-user-email">${escapeHtml(session.user.email)}</span>
    <button class="nav-signout" id="nav-signout-btn">Sign out</button>
  `;
  document.getElementById('nav-signout-btn').addEventListener('click', () => window.bipassAuth.signOut());
}

// ─── Profile ──────────────────────────────────────────────────

function setupProfile(session) {
  const user = session.user;
  const email = user.email || '';
  let displayName = user.user_metadata?.display_name || '';
  const tier = bipassAccountMeta(user).tier || 'free';

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
  if (tierEl) tierEl.style.display = 'none';
  renderName();

  document.getElementById('settings-username-edit-btn').addEventListener('click', function startEdit() {
    const current = displayName;
    this.style.display = 'none';
    const span = document.getElementById('settings-username');
    span.outerHTML = `<input class="settings-username-input" id="settings-username-input" type="text" value="${escapeHtml(current)}" placeholder="Enter username" maxlength="30" aria-label="Username" />`;
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
      input.outerHTML = `<span class="settings-username" id="settings-username">${escapeHtml(displayName || 'Set a username')}</span>`;
      const editBtn = document.getElementById('settings-username-edit-btn');
      if (editBtn) editBtn.style.display = '';
      avatarEl.textContent = initial();
    }

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') {
        done = true;
        input.outerHTML = `<span class="settings-username" id="settings-username">${escapeHtml(current || 'Set a username')}</span>`;
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

  display(bipassAccountMeta(session).credits ?? 2000);

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
  localStorage.removeItem('bipass_pref_mode');

  const currentLevel = localStorage.getItem(LEVEL_KEY) || 'easy';
  const levelBtns = document.querySelectorAll('.settings-level-opt');
  levelBtns.forEach(btn => {
    if (btn.dataset.level === currentLevel) btn.classList.add('active');
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      localStorage.setItem(LEVEL_KEY, btn.dataset.level);
      sessionStorage.removeItem('bipass_level');
      showToast('Default level saved');
    });
  });

  const mystyleToggle = document.getElementById('pref-mystyle');
  // Writing Profile is the primary style whenever one exists. Users can still
  // opt out here, and an explicit preset choice remains active for the session.
  mystyleToggle.checked = window.BipassStyleProfile.defaultProfileEnabled(
    localStorage.getItem(MYSTYLE_KEY)
  );
  mystyleToggle.addEventListener('change', () => {
    localStorage.setItem(MYSTYLE_KEY, mystyleToggle.checked ? 'true' : 'false');
    sessionStorage.removeItem('bipass_my_style');
    showToast(mystyleToggle.checked ? 'Writing Profile on by default' : 'Writing Profile off by default');
  });
}

// ─── Workspace ────────────────────────────────────────────────

function setupWorkspace() {
  const howtoToggle = document.getElementById('pref-show-howto');
  const tickerToggle = document.getElementById('pref-show-ticker');
  const extensionTipsToggle = document.getElementById('pref-extension-tips');
  const replayTourBtn = document.getElementById('replay-tour-btn');
  const resetOnboardingBtn = document.getElementById('reset-onboarding-btn');

  howtoToggle.checked = localStorage.getItem('bipass_pref_show_howto') !== 'false';
  howtoToggle.addEventListener('change', () => {
    localStorage.setItem('bipass_pref_show_howto', String(howtoToggle.checked));
    showToast(howtoToggle.checked ? 'How-to guide enabled' : 'How-to guide hidden');
  });

  tickerToggle.checked = localStorage.getItem('ticker-dismissed') !== '1';
  tickerToggle.addEventListener('change', () => {
    localStorage.setItem('ticker-dismissed', tickerToggle.checked ? '0' : '1');
    showToast(tickerToggle.checked ? 'Scrolling tips enabled' : 'Scrolling tips hidden');
  });

  extensionTipsToggle.checked = localStorage.getItem('bipass_pref_extension_tips') !== 'false';
  extensionTipsToggle.addEventListener('change', () => {
    localStorage.setItem('bipass_pref_extension_tips', String(extensionTipsToggle.checked));
    if (!extensionTipsToggle.checked) localStorage.setItem('ext_popup_seen', '1');
    showToast(extensionTipsToggle.checked ? 'Auto Typer tips enabled' : 'Auto Typer tips hidden');
  });

  replayTourBtn.addEventListener('click', () => {
    localStorage.removeItem('bipass_tour_seen');
    replayTourBtn.textContent = 'Ready for next visit';
    replayTourBtn.disabled = true;
    showToast('Guided tour will open next visit');
  });

  resetOnboardingBtn?.addEventListener('click', () => {
    const temporaryPreferenceKeys = [
      'bipass_pref_show_howto',
      'bipass_pref_extension_tips',
      'ticker-dismissed',
      'rec-flow-collapsed',
    ];
    const savedPreferences = Object.fromEntries(
      temporaryPreferenceKeys.map(key => [key, localStorage.getItem(key)]),
    );

    // Keep the account and its saved work untouched. Only reset browser-side
    // first-run state; welcome.html runs the reward in non-claiming test mode.
    sessionStorage.setItem('bipass_onboarding_test', '1');
    sessionStorage.setItem('bipass_onboarding_test_restore', JSON.stringify(savedPreferences));
    [
      'bipass_onb',
      'bipass_onb_preview',
      'bipass_tour_seen',
      'ext_popup_seen',
      ...temporaryPreferenceKeys,
    ].forEach(key => localStorage.removeItem(key));
    sessionStorage.removeItem('bipass_autostart');

    resetOnboardingBtn.disabled = true;
    resetOnboardingBtn.classList.add('is-launching');
    resetOnboardingBtn.querySelector('span:first-child').textContent = 'Starting test…';
    window.location.assign('welcome.html?preview=1&test=1');
  });
}

// ─── Writing Profiles ─────────────────────────────────────────

async function setupMyStyle(session) {
  const loadingEl = document.getElementById('mystyle-loading');
  const emptyEl   = document.getElementById('mystyle-empty');
  const contentEl = document.getElementById('mystyle-content');
  const listEl    = document.getElementById('settings-profile-list');
  const countEl   = document.getElementById('settings-profile-count');
  const addBtn    = document.getElementById('settings-add-profile-btn');
  let styles = [];
  let activeId = null;
  let saveTimer = null;

  function saveLocal() {
    localStorage.setItem(
      'bipass_styles_v1',
      window.BipassStyleProfile.serializeProfileStore(styles, activeId),
    );
  }

  async function saveCloud() {
    const active = styles.find(style => String(style.id) === String(activeId)) || styles[0] || null;
    const { error } = await window.bipassAuth.client.from('user_styles').upsert({
      user_id: session.user.id,
      style_summary: window.BipassStyleProfile.serializeProfileStore(styles, activeId, { includeSamples: false }),
      style_prompt: active?.style_prompt || '',
      sample_count: styles.reduce((total, style) => total + (style.writing_samples?.length || 0), 0),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw error;
  }

  function persistSoon() {
    saveLocal();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveCloud().catch(() => showToast('Saved on this device; cloud sync failed')), 500);
  }

  function render() {
    loadingEl.classList.add('hidden');
    countEl.textContent = `${styles.length} / ${window.BipassStyleProfile.MAX_SAVED_STYLES}`;
    const canAdd = window.BipassStyleProfile.canCreateStyle(styles);
    addBtn.classList.toggle('hidden', !canAdd);
    const defaultToggle = document.getElementById('pref-mystyle');
    if (defaultToggle) {
      defaultToggle.disabled = styles.length === 0;
      defaultToggle.checked = styles.length > 0
        && window.BipassStyleProfile.defaultProfileEnabled(localStorage.getItem('bipass_pref_mystyle'));
    }

    if (!styles.length) {
      contentEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
      return;
    }

    emptyEl.classList.add('hidden');
    contentEl.classList.remove('hidden');
    listEl.innerHTML = styles.map((style) => {
      const analysis = window.BipassStyleProfile.readAnalysis(style);
      const traits = window.BipassStyleProfile.readTraits(style);
      const isDefault = String(style.id) === String(activeId);
      const summary = analysis?.profile?.summary || 'Profile traits are ready to use.';
      const labels = [
        analysis?.profile?.tone?.label,
        analysis?.profile?.sentenceStyle?.label,
        ...traits.slice(0, 3).map(trait => `${trait.name} · ${trait.intensity}/10`),
      ].filter(Boolean);
      return `
        <article class="settings-writing-profile ${isDefault ? 'is-default' : ''}" data-profile-id="${escapeHtml(style.id)}">
          <div class="settings-writing-profile-head">
            <input class="settings-writing-profile-name" type="text" value="${escapeHtml(style.name || '')}" placeholder="Writing profile" maxlength="30" aria-label="Writing profile name">
            ${isDefault ? '<span class="settings-default-badge">Default</span>' : ''}
          </div>
          <p class="settings-writing-profile-summary">${escapeHtml(summary)}</p>
          <div class="settings-traits">${labels.map(label => `<span class="settings-trait-chip">${escapeHtml(label)}</span>`).join('')}</div>
          <div class="settings-writing-profile-actions">
            <button class="settings-profile-default-btn" type="button" data-action="default" ${isDefault ? 'disabled' : ''}>${isDefault ? 'Used by default' : 'Make default'}</button>
            <button class="settings-profile-delete-btn" type="button" data-action="delete">Delete</button>
          </div>
        </article>`;
    }).join('');

    listEl.querySelectorAll('.settings-writing-profile-name').forEach((input) => {
      input.addEventListener('input', () => {
        const id = input.closest('[data-profile-id]').dataset.profileId;
        const style = styles.find(item => String(item.id) === String(id));
        if (style) {
          style.name = input.value.slice(0, 30);
          persistSoon();
        }
      });
    });

    listEl.querySelectorAll('[data-action="default"]').forEach((button) => {
      button.addEventListener('click', () => {
        activeId = button.closest('[data-profile-id]').dataset.profileId;
        localStorage.setItem('bipass_pref_mystyle', 'true');
        const toggle = document.getElementById('pref-mystyle');
        if (toggle) toggle.checked = true;
        sessionStorage.removeItem('bipass_my_style');
        persistSoon();
        render();
        showToast('Default writing profile saved');
      });
    });

    listEl.querySelectorAll('[data-action="delete"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.closest('[data-profile-id]').dataset.profileId;
        const style = styles.find(item => String(item.id) === String(id));
        if (!confirm(`Delete “${style?.name || 'this writing profile'}”? This cannot be undone.`)) return;
        const remaining = window.BipassStyleProfile.removeStyle(styles, id, activeId);
        styles = remaining.styles;
        activeId = remaining.activeId;
        sessionStorage.removeItem('bipass_my_style');
        saveLocal();
        render();
        try {
          await saveCloud();
          showToast('Writing profile deleted');
        } catch {
          showToast('Deleted on this device; cloud sync failed');
        }
      });
    });
  }

  try {
    const local = localStorage.getItem('bipass_styles_v1');
    if (local) {
      const parsed = window.BipassStyleProfile.readProfileStore(local);
      styles = parsed.styles;
      activeId = parsed.activeId;
    } else {
      const { data } = await window.bipassAuth.client
        .from('user_styles')
        .select('style_summary, style_prompt, sample_count, updated_at')
        .eq('user_id', session.user.id)
        .single();
      const parsed = window.BipassStyleProfile.readProfileStore(data);
      styles = parsed.styles;
      activeId = parsed.activeId;
      if (styles.length) saveLocal();
    }
    render();
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
  const deleteBtn  = document.getElementById('delete-account-btn');
  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => cancelBtn.focus());
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    lastFocused?.focus?.();
  }

  deleteBtn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const controls = [cancelBtn, confirmBtn].filter(btn => !btn.disabled);
    const nextIndex = e.shiftKey ? controls.length - 1 : 0;
    if ((e.shiftKey && document.activeElement === controls[0])
        || (!e.shiftKey && document.activeElement === controls[controls.length - 1])) {
      e.preventDefault();
      controls[nextIndex]?.focus();
    }
  });

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
      closeModal();
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
  setupWorkspace();
  await setupMyStyle(session);
  setupDangerZone();
}

init();
