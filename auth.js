// ─── Bipass AI — Auth module ───────────────────────────────────
// Replace the two values below with your Supabase project credentials.
// Get them from: supabase.com → your project → Settings → API

const SUPABASE_URL  = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZXdtdWdxcnBkaHBkZnl2enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjQ3MzMsImV4cCI6MjA5NDU0MDczM30.euNVW05tZ39McxW9vvgcv527I2Pk8VeeUy1jcu21FSE';

const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

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
    window.location.replace('login.html');
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
    return session.user.user_metadata?.credits ?? 5000;
  },
};

// Shared plan status widget — call on any page that has #drawer-plan
function bipassSetupPlanStatus(session) {
  const tier = session?.user?.user_metadata?.tier || 'free';
  const expiresAt = session?.user?.user_metadata?.plan_expires_at;
  const hasPlan = tier !== 'free';

  const PLAN_NAMES = {
    day: 'Day Pass', weekly: 'Weekly Pass',
    monthly: 'Monthly Pass', annual: 'Annual Pass',
    pro: 'Pro Plan', premium: 'Premium Plan',
  };
  const planName = PLAN_NAMES[tier] || tier;

  let expiryStr = '';
  if (expiresAt) {
    const d = new Date(expiresAt);
    expiryStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
          ${expiryStr ? `<div class="drawer-plan-card-expiry">Expires ${expiryStr}</div>` : ''}
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
          ${expiryStr ? `<div class="plan-status-expiry">Expires ${expiryStr}</div>` : ''}
        </div>`;
    } else {
      pageEl.innerHTML = `
        <div class="plan-status-card plan-status-card--none">
          <span class="plan-status-dot plan-status-dot--none"></span>
          <span class="plan-status-name--none">No active plan</span>
        </div>`;
    }
  }

  // Red border on credit cards when no plan (plans.html only)
  if (!hasPlan) {
    document.querySelectorAll('.credit-card').forEach(el => el.classList.add('credit-card--locked'));
  }
}
