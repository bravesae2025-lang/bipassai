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
