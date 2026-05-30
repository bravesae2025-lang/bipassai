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

function setupTaglineTraveler() {
  const grid    = document.querySelector('.pricing-grid');
  const capsule = document.querySelector('.tagline-capsule');
  const typed   = capsule.querySelector('.tagline-typed');
  const slots   = [...document.querySelectorAll('.tagline-placeholder')];

  if (!grid || !capsule || !slots.length) return;

  const phrases = [
    ['Paper due tomorrow?',     'Need it done tonight?',         'One shot. One fix.'],
    ['Exam week got you?',      'Five assignments, seven days?',  'Finals mode: activated.'],
    ['Always something due?',   'Writing every other week?',      'This semester is nonstop.'],
    ['You write. A lot.',       'Make AI your year-round edge.',  'One decision. Done.'],
  ];

  let cardIdx  = 0;
  let visitIdx = 0;

  function slotRect(i) {
    const gr = grid.getBoundingClientRect();
    const sr = slots[i].getBoundingClientRect();
    return { left: sr.left - gr.left, top: sr.top - gr.top, w: sr.width, h: sr.height };
  }

  // White masks in the 16px gaps — hide capsule while sliding (page bg is #ffffff)
  function setupGapMasks() {
    const cards = [...grid.querySelectorAll('.pricing-card')];
    const gridRect = grid.getBoundingClientRect();
    cards.slice(0, -1).forEach(card => {
      const r = card.getBoundingClientRect();
      const mask = document.createElement('div');
      mask.style.cssText = [
        'position:absolute',
        'top:0',
        'height:100%',
        `left:${r.right - gridRect.left - 1}px`,
        'width:18px',
        'background:#ffffff',
        'z-index:15',
        'pointer-events:none',
      ].join(';');
      grid.appendChild(mask);
    });
  }

  // Slide to card i — animates both left AND top so Yearly's 16px offset is correct
  function place(i, animate) {
    const r = slotRect(i);
    capsule.style.transition = animate
      ? 'left 0.55s cubic-bezier(0.4,0,0.2,1), top 0.55s cubic-bezier(0.4,0,0.2,1)'
      : 'none';
    capsule.style.left   = r.left + 'px';
    capsule.style.top    = r.top  + 'px';
    capsule.style.width  = r.w    + 'px';
    capsule.style.height = '42px'; // fixed — placeholder is now height 0
  }

  function typeIn(text, done) {
    let i = 0;
    typed.textContent = '';
    (function t() {
      typed.textContent = text.slice(0, ++i);
      i < text.length ? setTimeout(t, 42) : setTimeout(done, 2000);
    })();
  }

  function deleteOut(done) {
    let len = typed.textContent.length;
    (function d() {
      if (len-- > 0) { typed.textContent = typed.textContent.slice(0, len); setTimeout(d, 22); }
      else done();
    })();
  }

  function step() {
    const phrase = phrases[cardIdx][visitIdx % phrases[cardIdx].length];
    typeIn(phrase, () => deleteOut(advance));
  }

  function advance() {
    visitIdx++;
    const isLast = cardIdx === phrases.length - 1;

    if (!isLast) {
      cardIdx++;
      place(cardIdx, true);
      setTimeout(step, 580);
    } else {
      // Loop reset: slide out right → snap to left → slide in (clipped by wrapper)
      const gridW = grid.offsetWidth;
      capsule.style.transition = 'left 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s';
      capsule.style.left    = (gridW + 20) + 'px';
      capsule.style.opacity = '0';

      setTimeout(() => {
        const r0 = slotRect(0);
        capsule.style.transition = 'none';
        capsule.style.left    = -(capsule.offsetWidth + 20) + 'px';
        capsule.style.top     = r0.top + 'px'; // snap to card 0 Y before slide-in
        capsule.style.width   = r0.w   + 'px';
        capsule.style.opacity = '0';
        cardIdx = 0;

        capsule.getBoundingClientRect();
        setTimeout(() => {
          capsule.style.transition = 'left 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s';
          capsule.style.left    = r0.left + 'px';
          capsule.style.opacity = '1';
          setTimeout(step, 520);
        }, 60);
      }, 450);
    }
  }

  // Bootstrap
  place(0, false);
  setupGapMasks();
  capsule.getBoundingClientRect();
  capsule.style.opacity = '1';
  setTimeout(step, 400);
}

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser();
  setupDrawer(session);
  setupTaglineTraveler();
}

init();

// Scroll reveal — same IntersectionObserver pattern as index.html
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('[data-anim]').forEach(el => revealObs.observe(el));
