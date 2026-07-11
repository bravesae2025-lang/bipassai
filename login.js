// ─── Redirect if already signed in ────────────────────────────
(async () => {
  const session = await window.bipassAuth.getSession();
  if (session) {
    const next = new URLSearchParams(location.search).get('next') || '/home';
    window.location.replace(next);
  }
})();

// ─── State ────────────────────────────────────────────────────
let mode = 'signin';

// ─── Elements ─────────────────────────────────────────────────
const titleEl      = document.getElementById('login-title');
const subEl        = document.getElementById('login-sub');
const usernameEl   = document.getElementById('username-input');
const passwordEl   = document.getElementById('password-input');
const submitBtn    = document.getElementById('submit-btn');
const submitLbl    = submitBtn.querySelector('.login-btn-label');
const toggleBtn    = document.getElementById('toggle-mode-btn');
const toggleText   = toggleBtn.closest('p');
const errorEl      = document.getElementById('login-error');
const successEl    = document.getElementById('login-success');
const googleBtn    = document.getElementById('google-btn');
const card         = document.querySelector('.login-card');

// ─── Toggle sign-in / sign-up ─────────────────────────────────
toggleBtn.addEventListener('click', () => {
  mode = mode === 'signin' ? 'signup' : 'signin';
  clearMessages();

  card.classList.add('login-switching');
  setTimeout(() => card.classList.remove('login-switching'), 320);

  if (mode === 'signup') {
    titleEl.textContent        = 'Create account';
    subEl.textContent          = 'Free to start — no credit card needed';
    submitLbl.textContent      = 'Create Account';
    googleBtn.innerHTML        = googleBtn.innerHTML.replace('Continue with Google', 'Sign up with Google');
    toggleText.innerHTML       = 'Already have an account? <button class="login-toggle-btn" id="toggle-mode-btn">Sign in</button>';
    document.getElementById('toggle-mode-btn').addEventListener('click', toggleBtn.onclick || (() => {}));
    usernameEl.autocomplete    = 'username';
    passwordEl.placeholder     = 'At least 8 characters';
    passwordEl.autocomplete    = 'new-password';
    usernameEl.focus();
  } else {
    titleEl.textContent        = 'Welcome back';
    subEl.textContent          = 'Sign in to continue to Bipass AI';
    submitLbl.textContent      = 'Sign In';
    googleBtn.innerHTML        = googleBtn.innerHTML.replace('Sign up with Google', 'Continue with Google');
    toggleText.innerHTML       = 'Don\'t have an account? <button class="login-toggle-btn" id="toggle-mode-btn">Create one</button>';
    document.getElementById('toggle-mode-btn').addEventListener('click', toggleBtn.onclick || (() => {}));
    usernameEl.autocomplete    = 'username';
    passwordEl.placeholder     = '••••••••';
    passwordEl.autocomplete    = 'current-password';
    usernameEl.focus();
  }

  rebindToggle();
});

function rebindToggle() {
  document.getElementById('toggle-mode-btn').addEventListener('click', () => {
    toggleBtn.click();
  });
}

// ─── Arriving from onboarding ─────────────────────────────────
// The welcome flow sends guests here with ?mode=signup after their gacha
// reveal; open in sign-up mode. The name they gave earlier is claimed with
// their reward, so we no longer collect it here.
(() => {
  if (new URLSearchParams(location.search).get('mode') === 'signup') toggleBtn.click();
})();

// ─── Submit ───────────────────────────────────────────────────
submitBtn.addEventListener('click', async () => {
  const username = usernameEl.value.trim();
  const password = passwordEl.value;
  const next     = new URLSearchParams(location.search).get('next') || '/home';

  if (!username || !password) { showError('Enter your username and password'); return; }
  if (mode === 'signup' && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    showError('Username must be 3–20 letters, numbers or underscores'); return;
  }
  if (mode === 'signup' && password.length < 8) { showError('Password must be at least 8 characters'); return; }

  clearMessages();
  setBusy(true);

  if (mode === 'signin') {
    const { error } = await window.bipassAuth.client.auth.signInWithPassword({
      email: usernameToEmail(username), password,
    });
    if (error) { showError('Wrong username or password'); setBusy(false); return; }
    window.location.replace(next);
  } else {
    // Create the account server-side (auto-confirmed), then sign straight in.
    const res  = await fetch('/auth/signup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.status === 409) { showError('That username is taken — pick another'); setBusy(false); return; }
    if (!res.ok) { showError(data.error || 'Could not create account'); setBusy(false); return; }

    const { error } = await window.bipassAuth.client.auth.signInWithPassword({
      email: data.email || usernameToEmail(username), password,
    });
    if (error) { showError('Account created — please sign in'); setBusy(false); mode = 'signin'; return; }
    window.location.replace(next);
  }
});

// Allow Enter key to submit
passwordEl.addEventListener('keydown', e => { if (e.key === 'Enter') submitBtn.click(); });
usernameEl.addEventListener('keydown', e => { if (e.key === 'Enter') passwordEl.focus(); });

// ─── Google OAuth ─────────────────────────────────────────────
document.getElementById('google-btn').addEventListener('click', () => {
  const next = new URLSearchParams(location.search).get('next') || '/home';
  window.location.href = `/auth/google?next=${encodeURIComponent(next)}`;
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
  submitBtn.disabled    = on;
  submitLbl.textContent = on ? 'Loading…' : (mode === 'signin' ? 'Sign In' : 'Create Account');
}
