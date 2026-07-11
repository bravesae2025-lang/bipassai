/* ─────────────────────────────────────────────────────────────
   Bipass AI — Onboarding controller (pre-auth gacha flow)
   Step 0: survey · Step 1: name · Step 2: gacha reward · Step 3: claimed

   Guests run steps 0-2 and sign up to claim; the reward (rolled
   server-side, HMAC-signed) waits in localStorage until they're back
   with a session. New users who signed up directly run the same flow
   post-auth and claim on the spot. No plans step — claim → /home.
───────────────────────────────────────────────────────────── */

const QS = new URLSearchParams(location.search);
const PREVIEW = QS.has('preview');
const PREVIEW_DAYS = [1, 3, 7].includes(Number(QS.get('days'))) ? Number(QS.get('days')) : null;

const STEPS = ['step-survey', 'step-name', 'step-gacha', 'step-claimed'];
// Preview mode keeps its own state so design reviews never pollute a real
// pending reward.
const ONB_KEY = PREVIEW ? 'bipass_onb_preview' : 'bipass_onb';
const RARITY = { 1: 'r-common', 3: 'r-rare', 7: 'r-legend' };
const CREDITS = 2000;

let current = 0;
let authed = false;
let countdownTimer = null;
let gachaInitialized = false;
let rollPromise = null;

// ── Pending-reward state (survives the signup round-trip) ─────
function loadOnb() {
  try { return JSON.parse(localStorage.getItem(ONB_KEY)) || {}; } catch (_) { return {}; }
}
function saveOnb(patch) {
  const s = Object.assign(loadOnb(), patch);
  try { localStorage.setItem(ONB_KEY, JSON.stringify(s)); } catch (_) {}
  return s;
}
function clearOnb() {
  try { localStorage.removeItem(ONB_KEY); } catch (_) {}
}

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

  syncDots(index);
  current = index;
}

// Show a step with no exit transition (used by the boot deep-links).
function showStepImmediate(index) {
  STEPS.forEach((id, idx) => {
    const el = document.getElementById(id);
    if (!el) return;
    const active = idx === index;
    el.hidden = !active;
    el.classList.toggle('is-current', active);
  });
  current = index;
  syncDots(index);
  onStepEnter(index);
}

function syncDots(index) {
  document.querySelectorAll('.onb-dot').forEach((d, i) => {
    d.classList.toggle('is-active', i === index);
    d.classList.toggle('is-done', i < index);
  });
}

function onStepEnter(index) {
  if (index === 2 && !gachaInitialized) initGacha();
  if (index === 3) document.body.classList.add('is-claimed');
}

// ── Step 0 · Survey ────────────────────────────────────────────
function setupSurvey() {
  const chips = document.querySelectorAll('.onb-chip');
  const cont  = document.getElementById('survey-continue');
  const saved = loadOnb().source;

  chips.forEach(chip => {
    if (saved && chip.dataset.source === saved) { chip.classList.add('is-selected'); cont.disabled = false; }
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      saveOnb({ source: chip.dataset.source });
      cont.disabled = false;
    });
  });

  cont.addEventListener('click', () => goToStep(1));
  document.getElementById('survey-skip').addEventListener('click', () => goToStep(1));
}

// ── Step 1 · Name ──────────────────────────────────────────────
function setupName() {
  const input = document.getElementById('name-input');
  const cont  = document.getElementById('name-continue');
  const saved = loadOnb().name;
  if (saved) { input.value = saved; cont.disabled = false; }

  input.addEventListener('input', () => { cont.disabled = !input.value.trim(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); cont.click(); }
  });
  cont.addEventListener('click', () => {
    saveOnb({ name: input.value.trim().slice(0, 40) });
    goToStep(2);
  });
  document.getElementById('name-skip').addEventListener('click', () => goToStep(2));
}

// ── "How it works" popup (holds the drop rates) ────────────────
function setupInfo() {
  const btn   = document.getElementById('gacha-info-btn');
  const pop   = document.getElementById('gacha-info-pop');
  const close = document.getElementById('gacha-info-close');
  if (!btn || !pop) return;

  const open  = () => { pop.hidden = false; };
  const shut  = () => { pop.hidden = true; };

  btn.addEventListener('click', open);
  close?.addEventListener('click', shut);
  pop.addEventListener('click', e => { if (e.target === pop) shut(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) shut(); });
}

// ── Step 2 · Gacha ─────────────────────────────────────────────

// Server-side roll: the browser only learns the result + a signed token it
// can't tamper with. A stored roll is reused so refreshing never rerolls;
// rolls older than the 48h claim window are discarded.
function getRoll() {
  if (rollPromise) return rollPromise;
  rollPromise = (async () => {
    const s = loadOnb();
    const fresh = s.rolledAt && Date.now() - s.rolledAt < 169200000; // 47h — under the server's 48h TTL
    if (s.days && fresh && (s.token || PREVIEW)) return { days: s.days, token: s.token || null };

    if (PREVIEW) {
      const days = PREVIEW_DAYS || 3;
      saveOnb({ days, token: null, rolledAt: Date.now(), revealed: false });
      return { days, token: null };
    }
    try {
      const res = await fetch('/api/roll-reward', { method: 'POST' });
      const { days, token } = await res.json();
      if (![1, 3, 7].includes(days) || !token) throw new Error('bad roll');
      saveOnb({ days, token, rolledAt: Date.now(), revealed: false });
      return { days, token };
    } catch (_) {
      // If the roll can't be fetched, promise only the default so the
      // reveal never shows more than the claim will grant.
      saveOnb({ days: 3, token: null, rolledAt: Date.now(), revealed: false });
      return { days: 3, token: null };
    }
  })();
  return rollPromise;
}

function switchPhase(id) {
  ['gacha-spin-phase', 'gacha-result-phase'].forEach(pid => {
    const el = document.getElementById(pid);
    const active = pid === id;
    el.hidden = !active;
    el.classList.toggle('phase-in', active);
  });
}

function initGacha() {
  gachaInitialized = true;
  getRoll(); // start rolling while they eye the reel

  // Already revealed (e.g. came back mid-flow) → skip straight to the result.
  if (loadOnb().revealed) {
    getRoll().then(({ days }) => showResult(days, { quiet: true }));
    return;
  }

  // The reel is on screen from the first second, cards drifting, needle armed.
  setupReel();

  document.getElementById('gacha-open').addEventListener('click', async () => {
    const { days } = await getRoll();
    setWinnerCard(days);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showResult(days, { quiet: true });
      return;
    }
    // Cinema mode: titles fall away, the reel zooms, then the spin rips.
    stopIdle();
    document.getElementById('gacha-spin-phase').classList.add('is-spinning');
    await spinReel(days);
    showResult(days);
  }, { once: true });
}

// ── Reel engine ────────────────────────────────────────────────
// The strip of reward cards is built and visible the moment the step opens:
// mostly 3-day with 1-days sprinkled in and the occasional gold flashing by
// for tension. The real winner is swapped into a fixed slot near the end of
// the run right before the spin (it sits far off-screen, so the swap is
// invisible).
const REEL_TOTAL = 56, REEL_WIN = 48;
let reel = null; // shared state between the idle drift and the spin

function cardHTML(days) {
  return `<span class="gacha-card-days">${days}</span>` +
         `<span class="gacha-card-unit">${days === 1 ? 'DAY' : 'DAYS'}</span>` +
         `<span class="gacha-card-label">PRO PASS</span>`;
}

function setupReel() {
  const wrap   = document.getElementById('gacha-reel-wrap');
  const track  = document.getElementById('gacha-track');
  const needle = document.getElementById('gacha-needle');

  track.innerHTML = '';
  for (let i = 0; i < REEL_TOTAL; i++) {
    const r = Math.random() * 100;
    const days = r < 74 ? 3 : (r < 90 ? 1 : 7);
    const el = document.createElement('div');
    el.className = `gacha-card ${RARITY[days]}`;
    el.innerHTML = cardHTML(days);
    track.appendChild(el);
  }

  const cw  = track.children[0].getBoundingClientRect().width;
  const gap = parseFloat(getComputedStyle(track).gap) || 12;
  reel = {
    wrap, track, needle,
    cw, unit: cw + gap,
    centre: wrap.getBoundingClientRect().width / 2,
    x: 0, lastIdx: null, idleRaf: null,
  };
  reel.lastIdx = idxAt(0);

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) idleDrift();
}

function idxAt(x) { return Math.floor((x + reel.centre) / reel.unit); }

// Move the track and fire a needle tick whenever a card boundary crosses it.
function setTrackX(x) {
  reel.x = x;
  reel.track.style.transform = `translate3d(${-x}px, 0, 0)`;
  const idx = idxAt(x);
  if (idx !== reel.lastIdx && idx >= 0) {
    reel.lastIdx = idx;
    reel.needle.classList.remove('tick');
    void reel.needle.offsetWidth;
    reel.needle.classList.add('tick');
  }
}

// Gentle conveyor sway while the reel waits — alive, but going nowhere.
function idleDrift() {
  const SPEED = 11;                 // px/s
  const RANGE = reel.unit * 5;      // sway across ~5 cards, then turn back
  let dir = 1, prev = null;
  function frame(ts) {
    if (prev !== null) {
      let x = reel.x + dir * SPEED * ((ts - prev) / 1000);
      if (x >= RANGE) { x = RANGE; dir = -1; }
      if (x <= 0)     { x = 0;     dir = 1; }
      setTrackX(x);
    }
    prev = ts;
    reel.idleRaf = requestAnimationFrame(frame);
  }
  reel.idleRaf = requestAnimationFrame(frame);
}

function stopIdle() {
  if (reel && reel.idleRaf) cancelAnimationFrame(reel.idleRaf);
}

function setWinnerCard(days) {
  if (!reel) return;
  const el = reel.track.children[REEL_WIN];
  el.className = `gacha-card ${RARITY[days]}`;
  el.innerHTML = cardHTML(days);
}

// CS:GO-style spin: rAF-driven ease-out quint so the needle ticks slow down
// naturally with the reel, plus a near-miss jitter and a friction catch-back.
// Starts from wherever the idle drift left the track.
function spinReel(winnerDays) {
  return new Promise(resolve => {
    const startX = reel.x;
    // Land just off-centre (±40% of a card) so it never looks robotic.
    const jitter = (Math.random() * 0.8 - 0.4) * reel.cw;
    const target = REEL_WIN * reel.unit + reel.cw / 2 - reel.centre + jitter;

    const DURATION = 6400;
    let t0 = null;

    function frame(ts) {
      if (t0 === null) t0 = ts;
      const p = Math.min(1, (ts - t0) / DURATION);
      const eased = 1 - Math.pow(1 - p, 5);
      setTrackX(startX + (target - startX) * eased);

      if (p < 1) { requestAnimationFrame(frame); return; }

      // Friction catch-back: the reel gives a few px back, like it snagged.
      reel.track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      reel.track.style.transform = `translate3d(${-(target - 9)}px, 0, 0)`;

      setTimeout(() => {
        reel.track.children[REEL_WIN].classList.add('is-winner');
        reel.track.classList.add('is-settled');
        setTimeout(resolve, 1000); // let the pulse land, hold the beat
      }, 430);
    }
    requestAnimationFrame(frame);
  });
}

function showResult(days, opts = {}) {
  saveOnb({ revealed: true });
  document.body.classList.add('is-revealing');

  const name = (loadOnb().name || '').trim();
  const eyebrow = document.getElementById('gacha-result-eyebrow');
  if (days === 7) {
    eyebrow.textContent = name ? `${name} — legendary drop` : 'Legendary drop';
    eyebrow.classList.add('is-gold');
  } else {
    eyebrow.textContent = name ? `${name}, you unboxed` : 'You unboxed';
  }

  const card = document.getElementById('gacha-won-card');
  card.classList.add(RARITY[days]);
  document.getElementById('gacha-won-days').textContent = days;
  document.getElementById('gacha-won-unit').textContent = days === 1 ? 'DAY' : 'DAYS';

  const flare = document.getElementById('gacha-flare');
  flare.classList.add(days === 7 ? 'flare-gold' : days === 1 ? 'flare-common' : 'flare-ink', 'is-on');

  switchPhase('gacha-result-phase');

  if (!opts.quiet) {
    fireBurst(days === 7
      ? ['#b8892b', '#e9c664', '#f7e6ae', '#0d0d0d']
      : ['#0d0d0d', '#3d3d3d', '#5a5a5a', '#7a7a7a']);
  }
  animateCount(document.getElementById('gacha-credits'), 0, CREDITS, 1100);

  const btn = document.getElementById('gacha-claim-btn');
  btn.innerHTML = (authed ? 'Claim my reward' : 'Sign up to claim your reward') +
    ' <span class="onb-btn-arrow">→</span>';
  btn.addEventListener('click', () => {
    if (PREVIEW) { showClaimed(Date.now() + days * 86400000); return; }
    if (authed) { claimReward(); return; }
    window.location.href = 'login.html?mode=signup';
  });
}

// ── Claim ──────────────────────────────────────────────────────
async function claimReward() {
  const btn = document.getElementById('gacha-claim-btn');
  if (btn) btn.classList.add('is-loading');

  const s = loadOnb();
  try {
    const token = await window.bipassAuth.getToken();
    const res = await fetch('/api/init-credits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rewardToken: s.token || null,
        firstName:   s.name || null,
        source:      s.source || null,
      }),
    });
    if (!res.ok) throw new Error('claim failed');
    const data = await res.json();

    if (data.alreadyInit) { clearOnb(); window.location.replace('/home'); return; }

    // Refresh the session so the new metadata (free_pass_until +
    // signup_welcome_shown) lands in the token — otherwise /home reads
    // stale data and could bounce back here.
    try { await window.bipassAuth.refreshSession(); } catch (_) {}

    clearOnb();
    showClaimed(data.passExpiresAt || null);
  } catch (_) {
    if (btn) btn.classList.remove('is-loading');
    toast('Something went wrong — try again.');
  }
}

function showClaimed(expiresAt) {
  if (current !== 3) showStepImmediate(3);
  document.body.classList.add('is-claimed');
  fireBurst();

  const el = document.getElementById('claimed-countdown');
  if (expiresAt) {
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
  }

  const go = () => window.location.replace(PREVIEW ? 'welcome.html?preview' : '/home');
  document.getElementById('claimed-continue').addEventListener('click', go, { once: true });
  if (!PREVIEW) setTimeout(go, 3200);
}

// ── Count-up (cubic ease-out, same feel as the app's counter) ──
function animateCount(el, from, to, duration) {
  if (!el) return;
  const t0 = performance.now();
  function step(now) {
    const p = Math.min(1, (now - t0) / duration);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * ease).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Coin / confetti burst (canvas) ─────────────────────────────
function fireBurst(colors) {
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
  const COLORS = colors || ['#0d0d0d', '#3d3d3d', '#5a5a5a', '#7a7a7a'];  // dark — visible on the light bg
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
  setupSurvey();
  setupName();
  setupInfo();

  if (!PREVIEW) {
    const session = await window.bipassAuth.getSession();
    authed = !!session;

    if (session) {
      // Already onboarded → straight to the tool (no repeat, no loop).
      if (session.user.user_metadata?.signup_welcome_shown) {
        window.location.replace('/home');
        return;
      }
      // Back from signup with a rolled reward waiting → claim it now.
      const s = loadOnb();
      if (s.days && s.token) {
        showStepImmediate(3);
        claimReward();
        return;
      }
      // Authed but never rolled (signed up directly, or a new browser) →
      // run the flow here; the gacha CTA claims on the spot.
    }
  }

  // Guest who already saw their reward → don't make them redo the flow.
  if (loadOnb().revealed) {
    showStepImmediate(2);
    return;
  }

  syncDots(0);
})();
