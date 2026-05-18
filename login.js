// ─── Redirect if already signed in ────────────────────────────
(async () => {
  const session = await window.bipassAuth.getSession();
  if (session) {
    const next = new URLSearchParams(location.search).get('next') || 'app.html';
    window.location.replace(next);
  }
})();

// ─── State ────────────────────────────────────────────────────
let mode = 'signin';

// ─── Elements ─────────────────────────────────────────────────
const titleEl      = document.getElementById('login-title');
const subEl        = document.getElementById('login-sub');
const nameField    = document.getElementById('name-field');
const nameEl       = document.getElementById('name-input');
const emailEl      = document.getElementById('email-input');
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
    googleBtn.textContent      = '';
    googleBtn.innerHTML        = googleBtn.innerHTML.replace('Continue with Google', 'Sign up with Google');
    toggleText.innerHTML       = 'Already have an account? <button class="login-toggle-btn" id="toggle-mode-btn">Sign in</button>';
    document.getElementById('toggle-mode-btn').addEventListener('click', toggleBtn.onclick || (() => {}));
    passwordEl.placeholder     = 'At least 8 characters';
    passwordEl.autocomplete    = 'new-password';
    nameField.classList.remove('hidden');
    nameEl.focus();
  } else {
    titleEl.textContent        = 'Welcome back';
    subEl.textContent          = 'Sign in to continue to Bipass AI';
    submitLbl.textContent      = 'Sign In';
    googleBtn.innerHTML        = googleBtn.innerHTML.replace('Sign up with Google', 'Continue with Google');
    toggleText.innerHTML       = 'Don\'t have an account? <button class="login-toggle-btn" id="toggle-mode-btn">Create one</button>';
    document.getElementById('toggle-mode-btn').addEventListener('click', toggleBtn.onclick || (() => {}));
    passwordEl.placeholder     = '••••••••';
    passwordEl.autocomplete    = 'current-password';
    nameField.classList.add('hidden');
    emailEl.focus();
  }

  rebindToggle();
});

function rebindToggle() {
  document.getElementById('toggle-mode-btn').addEventListener('click', () => {
    toggleBtn.click();
  });
}

// ─── Submit ───────────────────────────────────────────────────
submitBtn.addEventListener('click', async () => {
  const name     = nameEl.value.trim();
  const email    = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) { showError('Enter your email and password'); return; }
  if (mode === 'signup' && password.length < 8) { showError('Password must be at least 8 characters'); return; }
  if (mode === 'signup' && !name) { showError('Enter your first name'); return; }

  clearMessages();
  setBusy(true);

  if (mode === 'signin') {
    const { error } = await window.bipassAuth.client.auth.signInWithPassword({ email, password });
    if (error) { showError(error.message); setBusy(false); return; }
    const next = new URLSearchParams(location.search).get('next') || 'app.html';
    window.location.replace(next);
  } else {
    const { error } = await window.bipassAuth.client.auth.signUp({
      email,
      password,
      options: { data: { first_name: name } },
    });
    setBusy(false);
    if (error) { showError(error.message); return; }
    showSuccess('Account created! Check your email to confirm, then sign in.');
  }
});

// Allow Enter key to submit
passwordEl.addEventListener('keydown', e => { if (e.key === 'Enter') submitBtn.click(); });
emailEl.addEventListener('keydown', e => { if (e.key === 'Enter') passwordEl.focus(); });
nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') emailEl.focus(); });

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
  submitBtn.disabled    = on;
  submitLbl.textContent = on ? 'Loading…' : (mode === 'signin' ? 'Sign In' : 'Create Account');
}
