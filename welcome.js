/* ─────────────────────────────────────────────────────────────
   Bipass AI — First-run onboarding controller
   Step 0: survey  ·  Step 1: free-gift reveal  ·  Step 2: plans
───────────────────────────────────────────────────────────── */

const PREVIEW = new URLSearchParams(location.search).has('preview');

const STEPS = ['step-survey', 'step-gift', 'step-plans'];
let current = 0;
let selectedSource = null;
let countdownTimer = null;
let giftInitialized = false;

// ── Toast ──────────────────────────────────────────────────────
let _toastTimer;
function toast(msg) {
  const el = document.getElementById('onb-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 250);
  }, 2400);
}

// ── Step navigation ────────────────────────────────────────────
function goToStep(index) {
  if (index === current) return;
  const outEl = document.getElementById(STEPS[current]);
  const inEl  = document.getElementById(STEPS[index]);
  if (!inEl) return;

  outEl.classList.remove('is-current');
  outEl.classList.add('is-leaving');
  setTimeout(() => {
    outEl.hidden = true;
    outEl.classList.remove('is-leaving');
    inEl.hidden = false;
    // reflow so the enter animation replays
    void inEl.offsetWidth;
    inEl.classList.add('is-current');
    onStepEnter(index);
  }, 340);

  // progress dots
  document.querySelectorAll('.onb-dot').forEach((d, i) => {
    d.classList.toggle('is-active', i === index);
    d.classList.toggle('is-done', i < index);
  });

  current = index;
}

function onStepEnter(index) {
  // Intensify the dot-grid background on the plans step.
  document.body.classList.toggle('is-plans', index === 2);
  if (index === 1 && !giftInitialized) initGift();
}

// ── Step 0 · Survey ────────────────────────────────────────────
function setupSurvey() {
  const chips = document.querySelectorAll('.onb-chip');
  const cont  = document.getElementById('survey-continue');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      selectedSource = chip.dataset.source;
      cont.disabled = false;
    });
  });

  cont.addEventListener('click', () => { saveSource(selectedSource); goToStep(1); });
  document.getElementById('survey-skip').addEventListener('click', () => { saveSource(null); goToStep(1); });
}

// Persist the answer to the user's Supabase profile (fire-and-forget).
function saveSource(source) {
  if (PREVIEW || !source) return;
  try {
    window.bipassAuth.client.auth.updateUser({
      data: { signup_source: source, signup_source_at: Date.now() },
    });
  } catch (_) {}
}

// ── Step 1 · Free-gift reveal ──────────────────────────────────
async function initGift() {
  giftInitialized = true;
  fireBurst();

  let expiresAt = Date.now() + 86400000; // fallback: 24h

  if (!PREVIEW) {
    try {
      const token = await window.bipassAuth.getToken();
      const res = await fetch('/api/init-credits', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.passExpiresAt) expiresAt = data.passExpiresAt;
      // Refresh the client session so the new metadata (free_pass_until +
      // signup_welcome_shown) lands in the token — otherwise /home and the plan
      // status widgets read stale data ("No active plan") and /home could loop.
      try { await window.bipassAuth.refreshSession(); } catch (_) {}
    } catch (_) {}
  }

  // Live countdown
  const el = document.getElementById('gift-countdown');
  function tick() {
    const remaining = expiresAt - Date.now();
    if (!el) return;
    if (remaining <= 0) { el.textContent = 'Expired'; clearInterval(countdownTimer); return; }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  tick();
  clearInterval(countdownTimer);
  countdownTimer = setInterval(tick, 1000);

  document.getElementById('gift-continue').addEventListener('click', () => goToStep(2), { once: true });
}

// ── Step 2 · Plans ─────────────────────────────────────────────
function setupPlans() {
  document.querySelectorAll('.onb-plan').forEach(btn => {
    btn.addEventListener('click', () => activatePlan(btn.dataset.plan, btn));
  });
  document.getElementById('plans-skip').addEventListener('click', () => {
    window.location.replace('/home');
  });
}

async function activatePlan(plan, btn) {
  if (PREVIEW) { toast('Preview mode — checkout disabled'); return; }
  const token = await window.bipassAuth.getToken();
  if (!token) return;

  btn.classList.add('is-loading');
  try {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) throw new Error('Failed');
    const { url } = await res.json();
    window.location.href = url;
  } catch {
    btn.classList.remove('is-loading');
    toast('Something went wrong. Try again.');
  }
}

// ── Coin / confetti burst (canvas, monochrome) ─────────────────
function fireBurst() {
  const canvas = document.getElementById('onb-burst-canvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function size() {
    canvas.width  = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.4;
  const COLORS = ['#0d0d0d', '#3d3d3d', '#5a5a5a', '#7a7a7a'];  // dark — visible on the light bg
  const N = 130;
  const parts = [];
  for (let i = 0; i < N; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 4 + Math.random() * 11;
    parts.push({
      x: cx, y: cy,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: 4 + Math.random() * 6,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
      shape: Math.random() < 0.5 ? 'rect' : 'circle',
    });
  }

  let raf;
  function frame() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = false;
    for (const p of parts) {
      p.vy += 0.24;          // gravity
      p.vx *= 0.99;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.life -= 0.008;
      if (p.life <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    if (alive) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
  frame();
  window.addEventListener('resize', size, { once: true });
}

// ── Boot ───────────────────────────────────────────────────────
(async function init() {
  // Preview mode skips the auth gate entirely so the design can be reviewed.
  if (!PREVIEW) {
    const session = await window.bipassAuth.requireAuth();
    if (!session) return;
    // Already onboarded → straight to the tool (no repeat, no loop).
    if (session.user.user_metadata?.signup_welcome_shown) {
      window.location.replace('/home');
      return;
    }
  }

  setupSurvey();
  setupPlans();

  // Progress dots reflect the starting step.
  document.querySelectorAll('.onb-dot').forEach((d, i) => d.classList.toggle('is-active', i === 0));
})();
