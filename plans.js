async function setupNavUser() {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;
  const session = await window.bipassAuth.getSession();
  if (session) {
    navUser.innerHTML = `<span class="nav-user-email">${session.user.email}</span><button class="nav-signout" id="nav-signout-btn">Sign out</button>`;
    document.getElementById('nav-signout-btn').addEventListener('click', () => window.bipassAuth.signOut());
  } else {
    navUser.innerHTML = `<a class="nav-link" href="login.html">Sign in</a>`;
  }
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
  const tier = session ? (session.user.user_metadata?.tier || 'free') : 'free';
  const tierLabel = { free: 'Free', pro: 'Pro', premium: 'Premium' }[tier] || 'Free';
  const initials = () => (displayName || email || '?')[0].toUpperCase();

  function renderProfile() {
    drawerUser.innerHTML = `
      <div class="drawer-profile-row">
        <div class="drawer-avatar" id="drawer-avatar">${initials()}</div>
        <div class="drawer-profile">
          <div class="drawer-username-row">
            <span class="drawer-username" id="drawer-username">${displayName || 'Set a username'}</span>
            <button class="drawer-username-edit-btn" id="drawer-username-edit-btn" aria-label="Edit username">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
          <span class="drawer-user-email">${email}</span>
          <a class="drawer-tier-badge drawer-tier-${tier}" href="plans.html">${tierLabel}</a>
        </div>
      </div>
    `;
    document.getElementById('drawer-username-edit-btn').addEventListener('click', startEdit);
  }

  function startEdit() {
    const current = displayName;
    document.getElementById('drawer-username-edit-btn').style.display = 'none';
    document.getElementById('drawer-username').outerHTML = `<input class="drawer-username-input" id="drawer-username-input" type="text" value="${current}" placeholder="Enter username" maxlength="30" />`;
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

function setupTaglineTypers() {
  const SPEED_TYPE   = 42;
  const SPEED_DELETE = 22;
  const PAUSE_AFTER  = 2200;
  const PAUSE_NEXT   = 350;

  document.querySelectorAll('.pricing-tagline[data-questions]').forEach((el, cardIndex) => {
    const questions = JSON.parse(el.dataset.questions);
    const span = el.querySelector('.tagline-typed');
    let phraseIndex = 0;
    let charIndex   = 0;
    let deleting    = false;

    function tick() {
      const phrase = questions[phraseIndex];
      if (!deleting) {
        charIndex++;
        span.textContent = phrase.slice(0, charIndex);
        if (charIndex === phrase.length) {
          deleting = true;
          setTimeout(tick, PAUSE_AFTER);
          return;
        }
        setTimeout(tick, SPEED_TYPE);
      } else {
        charIndex--;
        span.textContent = phrase.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % questions.length;
          setTimeout(tick, PAUSE_NEXT);
          return;
        }
        setTimeout(tick, SPEED_DELETE);
      }
    }

    setTimeout(tick, cardIndex * 900);
  });
}

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser();
  setupDrawer(session);
  setupTaglineTypers();
}

init();

// Scroll reveal — same IntersectionObserver pattern as index.html
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('[data-anim]').forEach(el => revealObs.observe(el));
