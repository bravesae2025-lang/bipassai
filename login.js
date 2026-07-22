// ─── State and elements ───────────────────────────────────────────────────
let mode = 'signin';

const form             = document.getElementById('login-form');
const titleEl          = document.getElementById('login-title');
const subEl            = document.getElementById('login-sub');
const usernameEl       = document.getElementById('username-input');
const passwordEl       = document.getElementById('password-input');
const confirmField     = document.getElementById('confirm-password-field');
const confirmPasswordEl = document.getElementById('confirm-password-input');
const submitBtn        = document.getElementById('submit-btn');
const submitLbl        = submitBtn.querySelector('.login-btn-label');
const toggleBtn        = document.getElementById('toggle-mode-btn');
const toggleCopy       = document.getElementById('toggle-mode-copy');
const errorEl          = document.getElementById('login-error');
const successEl        = document.getElementById('login-success');
const googleBtn        = document.getElementById('google-btn');
const googleBtnLabel   = document.getElementById('google-btn-label');
const card             = document.querySelector('.login-card');

function nextPath() {
  const requested = new URLSearchParams(location.search).get('next');
  if (typeof bipassSafeNext === 'function') return bipassSafeNext(requested);
  return '/home';
}

// ─── Sign-in / sign-up mode ─────────────────────────────────────────
function setMode(nextMode, animate = false) {
  mode = nextMode === 'signup' ? 'signup' : 'signin';
  clearMessages();

  if (animate) {
    card.classList.remove('login-switching');
    void card.offsetWidth;
    card.classList.add('login-switching');
    setTimeout(() => card.classList.remove('login-switching'), 320);
  }

  const signingUp = mode === 'signup';
  titleEl.textContent = signingUp ? 'Create account' : 'Welcome back';
  subEl.textContent = signingUp
    ? 'Free to start — no credit card needed'
    : 'Sign in to continue to Bipass AI';
  submitLbl.textContent = signingUp ? 'Create Account' : 'Sign In';
  googleBtnLabel.textContent = signingUp ? 'Sign up with Google' : 'Continue with Google';
  toggleCopy.textContent = signingUp ? 'Already have an account?' : 'Don\'t have an account?';
  toggleBtn.textContent = signingUp ? 'Sign in' : 'Create one';
  passwordEl.placeholder = signingUp ? 'At least 8 characters' : '••••••••';
  passwordEl.autocomplete = signingUp ? 'new-password' : 'current-password';
  confirmField.hidden = !signingUp;
  confirmPasswordEl.disabled = !signingUp;
  confirmPasswordEl.required = signingUp;
  if (!signingUp) confirmPasswordEl.value = '';
  document.title = signingUp ? 'Create Account — Bipass AI' : 'Bipass AI — Sign In';
}

toggleBtn.addEventListener('click', () => {
  setMode(mode === 'signin' ? 'signup' : 'signin', true);
  usernameEl.focus();
});

// ─── Submit ─────────────────────────────────────────────────────────────────
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitBtn.disabled) return;

  const username = usernameEl.value.trim();
  const password = passwordEl.value;
  const confirmPassword = confirmPasswordEl.value;

  if (!username || !password) {
    showError('Enter your username and password');
    (!username ? usernameEl : passwordEl).focus();
    return;
  }
  if (mode === 'signup' && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    showError('Username must be 3–20 letters, numbers or underscores');
    usernameEl.focus();
    return;
  }
  if (mode === 'signup' && password.length < 8) {
    showError('Password must be at least 8 characters');
    passwordEl.focus();
    return;
  }
  if (mode === 'signup' && !confirmPassword) {
    showError('Type your password again to confirm it');
    confirmPasswordEl.focus();
    return;
  }
  if (mode === 'signup' && password !== confirmPassword) {
    showError('Passwords do not match');
    confirmPasswordEl.focus();
    return;
  }
  if (!window.bipassAuth?.client?.auth) {
    showError('Sign-in service did not load. Refresh the page and try again.');
    return;
  }

  clearMessages();
  setBusy(true);

  try {
    if (mode === 'signin') {
      const { error } = await window.bipassAuth.client.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      });
      if (error) {
        showError('Wrong username or password');
        return;
      }
      window.location.replace(nextPath());
      return;
    }

    // Username accounts use an internal email identifier and are confirmed by
    // the server, so there is no email-confirmation step for the user.
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 409) {
      showError('That username is taken — pick another');
      usernameEl.focus();
      return;
    }
    if (response.status === 429) {
      showError('Too many account attempts. Wait a moment and try again.');
      return;
    }
    if (!response.ok) {
      showError(data.error || 'Could not create account. Try again.');
      return;
    }

    const { error } = await window.bipassAuth.client.auth.signInWithPassword({
      email: data.email || usernameToEmail(username),
      password,
    });
    if (error) {
      setMode('signin');
      showSuccess('Account created. Please sign in with your new password.');
      passwordEl.focus();
      return;
    }
    window.location.replace(nextPath());
  } catch (error) {
    console.error('Authentication request failed:', error);
    showError('Could not connect to the sign-in service. Check your connection and try again.');
  } finally {
    setBusy(false);
  }
});

usernameEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    passwordEl.focus();
  }
});

passwordEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && mode === 'signup') {
    event.preventDefault();
    confirmPasswordEl.focus();
  }
});

// ─── Google OAuth ──────────────────────────────────────────────────────────
googleBtn.addEventListener('click', () => {
  window.location.href = `/auth/google?next=${encodeURIComponent(nextPath())}`;
});

// ─── Helpers and initial state ──────────────────────────────────────────────────
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  successEl.classList.add('hidden');
}

function showSuccess(message) {
  successEl.textContent = message;
  successEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
}

function clearMessages() {
  errorEl.classList.add('hidden');
  successEl.classList.add('hidden');
}

function setBusy(on) {
  submitBtn.disabled = on;
  submitBtn.setAttribute('aria-busy', String(on));
  submitLbl.textContent = on ? 'Loading…' : (mode === 'signin' ? 'Sign In' : 'Create Account');
}

const params = new URLSearchParams(location.search);
setMode(params.get('mode') === 'signup' ? 'signup' : 'signin');

const authErrors = {
  google_denied: 'Google sign-in was cancelled.',
  invalid_state: 'That Google sign-in link expired. Please try again.',
  oauth_failed: 'Google sign-in could not be completed. Please try again.',
  missing_token: 'That sign-in link is incomplete. Please try again.',
  auth_failed: 'That sign-in link expired or was already used. Please try again.',
};
if (authErrors[params.get('error')]) showError(authErrors[params.get('error')]);

(async () => {
  try {
    const session = await window.bipassAuth?.getSession();
    if (session) window.location.replace(nextPath());
  } catch (error) {
    console.error('Could not check the current session:', error);
    showError('Sign-in service did not load. Refresh the page and try again.');
  }
})();
