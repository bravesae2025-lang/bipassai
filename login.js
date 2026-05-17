// ─── Redirect if already signed in ────────────────────────────
(async () => {
  const session = await window.bipassAuth.getSession();
  if (session) {
    const next = new URLSearchParams(location.search).get('next') || 'app.html';
    window.location.replace(next);
  }
})();

// ─── State ────────────────────────────────────────────────────
let mode = 'signin'; // 'signin' | 'signup'

// ─── Elements ─────────────────────────────────────────────────
const titleEl    = document.getElementById('login-title');
const subEl      = document.getElementById('login-sub');
const emailEl    = document.getElementById('email-input');
const passwordEl = document.getElementById('password-input');
const submitBtn  = document.getElementById('submit-btn');
const submitLbl  = submitBtn.querySelector('.login-btn-label');
const toggleBtn  = document.getElementById('toggle-mode-btn');
const errorEl    = document.getElementById('login-error');
const successEl  = document.getElementById('login-success');

// ─── Toggle sign-in / sign-up ─────────────────────────────────
toggleBtn.addEventListener('click', () => {
  mode = mode === 'signin' ? 'signup' : 'signin';
  clearMessages();

  if (mode === 'signup') {
    titleEl.textContent   = 'Create account';
    subEl.textContent     = 'Join Bipass AI — it\'s free to start';
    submitLbl.textContent = 'Create Account';
    toggleBtn.textContent = 'Sign in instead';
    passwordEl.placeholder = 'At least 8 characters';
    passwordEl.autocomplete = 'new-password';
  } else {
    titleEl.textContent   = 'Welcome back';
    subEl.textContent     = 'Sign in to continue to Bipass AI';
    submitLbl.textContent = 'Sign In';
    toggleBtn.textContent = 'Create one';
    passwordEl.placeholder = '••••••••';
    passwordEl.autocomplete = 'current-password';
  }
});

// ─── Submit ───────────────────────────────────────────────────
submitBtn.addEventListener('click', async () => {
  const email    = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) { showError('Enter your email and password'); return; }
  if (mode === 'signup' && password.length < 8) { showError('Password must be at least 8 characters'); return; }

  clearMessages();
  setBusy(true);

  if (mode === 'signin') {
    const { error } = await window.bipassAuth.client.auth.signInWithPassword({ email, password });
    if (error) { showError(error.message); setBusy(false); return; }
    const next = new URLSearchParams(location.search).get('next') || 'app.html';
    window.location.replace(next);
  } else {
    const { error } = await window.bipassAuth.client.auth.signUp({ email, password });
    setBusy(false);
    if (error) { showError(error.message); return; }
    showSuccess('Check your email for a confirmation link, then sign in.');
  }
});

// Allow Enter key to submit
passwordEl.addEventListener('keydown', e => { if (e.key === 'Enter') submitBtn.click(); });
emailEl.addEventListener('keydown', e => { if (e.key === 'Enter') passwordEl.focus(); });

// ─── Google OAuth ─────────────────────────────────────────────
document.getElementById('google-btn').addEventListener('click', async () => {
  clearMessages();
  const next = new URLSearchParams(location.search).get('next') || '/app.html';
  const { error } = await window.bipassAuth.client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + next },
  });
  if (error) showError(error.message);
});

// ─── Helpers ──────────────────────────────────────────────────
function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
  successEl.classList.add('hidden');
}

function showSuccess(msg) {
  successEl.textContent = msg;
  successEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
}

function clearMessages() {
  errorEl.classList.add('hidden');
  successEl.classList.add('hidden');
}

function setBusy(on) {
  submitBtn.disabled = on;
  submitLbl.textContent = on ? 'Loading…' : (mode === 'signin' ? 'Sign In' : 'Create Account');
}
