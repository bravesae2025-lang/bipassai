// ─── How to Use page ──────────────────────────────────────────

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function setupGuideFilm() {
  const video = document.getElementById('howto-guide-video');
  const button = document.getElementById('howto-film-toggle');
  if (!video || !button) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userPaused = reduceMotion;
  let inView = true;

  function syncButton() {
    const paused = video.paused;
    button.classList.toggle('is-paused', paused);
    button.setAttribute('aria-label', paused ? 'Play walkthrough' : 'Pause walkthrough');
    button.title = paused ? 'Play walkthrough' : 'Pause walkthrough';
  }

  function syncPlayback() {
    if (userPaused || !inView) {
      video.pause();
      syncButton();
      return;
    }
    video.play().catch(() => {
      userPaused = true;
      syncButton();
    });
  }

  button.addEventListener('click', () => {
    userPaused = !video.paused;
    if (userPaused) video.pause();
    else syncPlayback();
    syncButton();
  });
  video.addEventListener('play', syncButton);
  video.addEventListener('pause', syncButton);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.18 }).observe(video);
  }

  syncPlayback();
  syncButton();
}

async function init() {
  const session = await window.bipassAuth.getSession();

  // Nav user
  const navUser = document.getElementById('nav-user');
  if (navUser) {
    if (session) {
      navUser.innerHTML = `<span class="nav-user-email">${escapeHtml(session.user.email)}</span><button class="nav-signout" id="nav-signout-btn">Sign out</button>`;
      document.getElementById('nav-signout-btn')?.addEventListener('click', () => window.bipassAuth.signOut());
    } else {
      navUser.innerHTML = `<a class="nav-link" href="/login.html">Sign in</a>`;
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
    const tier = bipassAccountMeta(session).tier || 'free';
    const initial = (displayName || email || '?')[0].toUpperCase();
    drawerUser.innerHTML = `
      <div class="drawer-profile-row">
        <div class="drawer-avatar">${escapeHtml(initial)}</div>
        <div class="drawer-profile">
          <span class="drawer-username">${escapeHtml(displayName || email)}</span>
          <span class="drawer-user-email">${escapeHtml(email)}</span>
        </div>
      </div>`;
  }

  function open()  { drawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('drawer-lock'); }
  function close() { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('drawer-lock'); }

  hamburger?.addEventListener('click', open);
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  if (signoutBtn) signoutBtn.addEventListener('click', () => window.bipassAuth.signOut());

  bipassSetupPlanStatus(session);

  // Scroll reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-anim]').forEach(el => obs.observe(el));
}

setupGuideFilm();
init();
