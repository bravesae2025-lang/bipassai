// ─── Bipass AI — Auth module ───────────────────────────────────
// Replace the two values below with your Supabase project credentials.
// Get them from: supabase.com → your project → Settings → API

const SUPABASE_URL  = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZXdtdWdxcnBkaHBkZnl2enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjQ3MzMsImV4cCI6MjA5NDU0MDczM30.euNVW05tZ39McxW9vvgcv527I2Pk8VeeUy1jcu21FSE';

const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// Username auth: map a username to its synthetic Supabase email. Keep this
// normalization identical to usernameToEmail() in server.js.
const USERNAME_EMAIL_DOMAIN = 'users.bipassai.com';
function usernameToEmail(username) {
  return `${String(username).trim().toLowerCase()}@${USERNAME_EMAIL_DOMAIN}`;
}

// Profile fields remain in user_metadata, while credits and pass status live
// in server-controlled app_metadata. App values win during the legacy
// migration window.
function bipassAccountMeta(subject) {
  const user = subject?.user || subject || {};
  return { ...(user.user_metadata || {}), ...(user.app_metadata || {}) };
}

function bipassSafeNext(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/home';
  try {
    const parsed = new URL(value, window.location.origin);
    return parsed.origin === window.location.origin
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : '/home';
  } catch {
    return '/home';
  }
}

window.bipassAuth = {
  client: _sb,

  async getSession() {
    const { data: { session } } = await _sb.auth.getSession();
    return session;
  },

  // Call on protected pages — redirects to login if not signed in
  async requireAuth() {
    const session = await this.getSession();
    if (!session) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace('login.html?next=' + next);
      return null;
    }
    return session;
  },

  async signOut() {
    await _sb.auth.signOut();
    window.location.replace('/login.html');
  },

  // Returns current access token for API calls
  async getToken() {
    const session = await this.getSession();
    return session?.access_token || null;
  },

  // Force-refresh the Supabase session and return fresh credit balance
  async refreshCredits() {
    const { data: { session } } = await _sb.auth.refreshSession();
    if (!session) return null;
    return bipassAccountMeta(session).credits ?? 2000;
  },

  // Force-refresh the full session (gets latest user_metadata including tier)
  async refreshSession() {
    const { data: { session } } = await _sb.auth.refreshSession();
    return session;
  },
};

// Active-pass check (UX gate — server re-checks authoritatively).
// True if a paid plan is active OR the free signup pass is still valid.
function bipassHasActivePass(session) {
  const m = bipassAccountMeta(session);
  const now = Date.now();
  const paidActive = m.tier && m.tier !== 'free' && (!m.plan_expires_at || now < m.plan_expires_at);
  const freeTrial  = m.free_pass_until && now < m.free_pass_until;
  return !!(paidActive || freeTrial);
}

// Shared plan status widget — call on any page that has #drawer-plan
function bipassSetupPlanStatus(session) {
  const m = bipassAccountMeta(session);
  const now = Date.now();
  const tier = m.tier || 'free';

  const paidActive  = tier !== 'free' && tier !== 'trial' && (!m.plan_expires_at || now < m.plan_expires_at);
  const trialActive = !paidActive && m.free_pass_until && now < m.free_pass_until;
  const hasPlan = paidActive || trialActive;

  const PLAN_NAMES = {
    day: 'Day Pass', weekly: 'Weekly Pass',
    monthly: 'Monthly Pass', annual: 'Annual Pass',
    pro: 'Pro Plan', premium: 'Premium Plan', trial: 'Free Trial',
  };
  const planName = trialActive ? 'Free Trial' : (PLAN_NAMES[tier] || tier);
  const expiresAt = trialActive ? m.free_pass_until : m.plan_expires_at;

  let expiryStr = 'Active';
  if (expiresAt) {
    const d = new Date(expiresAt);
    expiryStr = 'Expires ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const drawerEl = document.getElementById('drawer-plan');
  if (drawerEl) {
    if (hasPlan) {
      drawerEl.innerHTML = `
        <div class="drawer-plan-card drawer-plan-card--active">
          <div class="drawer-plan-card-top">
            <span class="drawer-plan-dot"></span>
            <span class="drawer-plan-card-name">${planName}</span>
          </div>
          <div class="drawer-plan-card-expiry">${expiryStr}</div>
        </div>`;
    } else {
      drawerEl.innerHTML = `
        <div class="drawer-plan-card drawer-plan-card--none">
          <span class="drawer-plan-dot drawer-plan-dot--none"></span>
          <span class="drawer-plan-card-name--none">No active plan</span>
        </div>`;
    }
  }

  // On plans.html — the on-page status card below the heading
  const pageEl = document.getElementById('plans-current-plan');
  if (pageEl) {
    if (hasPlan) {
      pageEl.innerHTML = `
        <div class="plan-status-card plan-status-card--active">
          <div class="plan-status-top">
            <span class="plan-status-dot"></span>
            <span class="plan-status-name">${planName}</span>
          </div>
          <div class="plan-status-expiry">${expiryStr}</div>
        </div>`;
    } else {
      pageEl.innerHTML = `
        <div class="plan-status-card plan-status-card--none">
          <span class="plan-status-dot plan-status-dot--none"></span>
          <span class="plan-status-name--none">No active plan</span>
        </div>`;
    }
  }
}
