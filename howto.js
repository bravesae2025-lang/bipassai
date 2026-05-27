// ─── How to Use page ──────────────────────────────────────────

async function init() {
  const session = await window.bipassAuth.getSession();

  // Nav user
  const navUser = document.getElementById('nav-user');
  if (navUser) {
    if (session) {
      navUser.innerHTML = `<span class="nav-user-email">${session.user.email}</span><button class="nav-signout" id="nav-signout-btn">Sign out</button>`;
      document.getElementById('nav-signout-btn')?.addEventListener('click', () => window.bipassAuth.signOut());
    } else {
      navUser.innerHTML = `<a class="nav-link" href="login.html">Sign in</a>`;
    }
  }

  // Drawer
  const hamburger  = document.getElementById('nav-hamburger');
  const overlay    = document.getElementById('drawer-overlay');
  const drawer     = document.getElementById('drawer');
  const closeBtn   = document.getElementById('drawer-close');
  const drawerUser = document.getElementById('drawer-user');
  const signoutBtn = document.getElementById('drawer-signout-btn');

  if (session) {
    const email = session.user.email || '';
    const displayName = session.user.user_metadata?.display_name || '';
    const tier = session.user.user_metadata?.tier || 'free';
    const tierLabel = { free: 'Free', pro: 'Pro', premium: 'Premium' }[tier] || 'Free';
    const initial = (displayName || email || '?')[0].toUpperCase();
    drawerUser.innerHTML = `
      <div class="drawer-profile-row">
        <div class="drawer-avatar">${initial}</div>
        <div class="drawer-profile">
          <span class="drawer-username">${displayName || email}</span>
          <span class="drawer-user-email">${email}</span>
          <a class="drawer-tier-badge drawer-tier-${tier}" href="plans.html">${tierLabel}</a>
        </div>
      </div>`;
  }

  function open()  { drawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('drawer-lock'); }
  function close() { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('drawer-lock'); }

  hamburger?.addEventListener('click', open);
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  if (signoutBtn) signoutBtn.addEventListener('click', () => window.bipassAuth.signOut());

  // Scroll reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-anim]').forEach(el => obs.observe(el));
}

init();
