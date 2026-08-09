import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3000';
const cdpUrl = process.env.CDP_URL || 'http://127.0.0.1:9222';
const blogPaths = readdirSync(resolve(root, 'blog'))
  .filter((name) => name.endsWith('.html') && name !== 'index.html')
  .map((name) => `/blog/${name}`);
const paths = [
  '/', '/home', '/login.html', '/login.html?mode=signup', '/about.html', '/turnitin.html', '/howto.html',
  '/plans.html', '/privacy.html', '/terms.html', '/blog/', ...blogPaths,
];
const viewports = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  { name: 'short-desktop', width: 1184, height: 654, deviceScaleFactor: 1, mobile: false },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 1, mobile: true },
];
const issues = [];
let sequence = 0;

function connect(url) {
  return new Promise((resolveConnection, reject) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    const listeners = new Set();
    socket.addEventListener('open', () => {
      resolveConnection({
        socket,
        onEvent(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        send(method, params = {}) {
          const id = ++sequence;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((resolveResult, rejectResult) => pending.set(id, { resolveResult, rejectResult }));
        },
      });
    });
    socket.addEventListener('error', reject);
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (message.id && pending.has(message.id)) {
        const { resolveResult, rejectResult } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) rejectResult(new Error(message.error.message));
        else resolveResult(message.result);
      } else {
        for (const listener of listeners) listener(message);
      }
    });
  });
}

function waitForEvent(client, method, timeoutMs = 10_000) {
  return new Promise((resolveEvent, reject) => {
    const timeout = setTimeout(() => { stop(); reject(new Error(`Timed out waiting for ${method}`)); }, timeoutMs);
    const stop = client.onEvent((message) => {
      if (message.method !== method) return;
      clearTimeout(timeout);
      stop();
      resolveEvent(message.params);
    });
  });
}

for (const viewport of viewports) {
  const target = await fetch(`${cdpUrl}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then((res) => res.json());
  const client = await connect(target.webSocketDebuggerUrl);
  const pageIssues = [];
  client.onEvent((message) => {
    if (message.method === 'Runtime.exceptionThrown') {
      pageIssues.push(`exception: ${message.params.exceptionDetails?.text || 'unknown exception'}`);
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      const text = message.params.args?.map((arg) => arg.value || arg.description || '').join(' ');
      pageIssues.push(`console: ${text}`);
    }
    if (message.method === 'Log.entryAdded' && message.params.entry?.level === 'error') {
      pageIssues.push(`log: ${message.params.entry.text}`);
    }
    if (message.method === 'Network.loadingFailed') {
      const url = message.params.requestId;
      if (!message.params.canceled) pageIssues.push(`request failed (${url}): ${message.params.errorText}`);
    }
  });

  await Promise.all([
    client.send('Page.enable'),
    client.send('Runtime.enable'),
    client.send('Log.enable'),
    client.send('Network.enable'),
    client.send('Emulation.setDeviceMetricsOverride', viewport),
    client.send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    }),
  ]);

  for (const path of paths) {
    pageIssues.length = 0;
    const loaded = waitForEvent(client, 'Page.loadEventFired');
    const navigation = await client.send('Page.navigate', { url: `${baseUrl}${path}` });
    if (navigation.errorText) pageIssues.push(`navigation: ${navigation.errorText}`);
    await loaded;
    await new Promise((resolveWait) => setTimeout(resolveWait, 350));

    const { result } = await client.send('Runtime.evaluate', {
      expression: `({
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        bodyLength: document.body?.innerText?.trim().length || 0,
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        readyState: document.readyState
      })`,
      returnByValue: true,
    });
    const state = result.value;
    if (!state.title) pageIssues.push('empty document title');
    if (!state.bodyLength) pageIssues.push('empty page body');
    if (state.readyState !== 'complete') pageIssues.push(`readyState is ${state.readyState}`);
    if (state.scrollWidth > state.innerWidth + 1) {
      pageIssues.push(`horizontal overflow: ${state.scrollWidth}px document in ${state.innerWidth}px viewport`);
    }

    if (path === '/login.html' || path === '/login.html?mode=signup') {
      const shouldStartInSignup = path.includes('mode=signup');
      if (!shouldStartInSignup) {
        const { result: signinResult } = await client.send('Runtime.evaluate', {
          expression: `(() => {
            const field = document.getElementById('confirm-password-field');
            const confirm = document.getElementById('confirm-password-input');
            return {
              fieldVisible: field ? getComputedStyle(field).display !== 'none' : false,
              confirmDisabled: confirm?.disabled,
            };
          })()`,
          returnByValue: true,
        });
        if (signinResult.value.fieldVisible || !signinResult.value.confirmDisabled) {
          pageIssues.push('confirm-password field is visible or enabled during sign in');
        }
      }
      if (!shouldStartInSignup) {
        await client.send('Runtime.evaluate', {
          expression: `document.getElementById('toggle-mode-btn').click()`,
        });
      }

      const { result: signupResult } = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const field = document.getElementById('confirm-password-field');
          const confirm = document.getElementById('confirm-password-input');
          const password = document.getElementById('password-input');
          return {
            title: document.getElementById('login-title')?.textContent,
            fieldVisible: field ? getComputedStyle(field).display !== 'none' : false,
            confirmEnabled: confirm ? !confirm.disabled : false,
            confirmAutocomplete: confirm?.autocomplete,
            passwordAutocomplete: password?.autocomplete,
            legalNoticeVisible: !document.getElementById('signup-legal')?.hidden,
            formTag: document.getElementById('login-form')?.tagName,
            pageCanScroll: document.scrollingElement.scrollHeight <= innerHeight
              || getComputedStyle(document.body).overflowY !== 'hidden',
          };
        })()`,
        returnByValue: true,
      });
      const signup = signupResult.value;
      if (signup.title !== 'Create account') pageIssues.push('signup mode title is incorrect');
      if (!signup.fieldVisible || !signup.confirmEnabled) pageIssues.push('confirm-password field is not enabled and visible');
      if (signup.confirmAutocomplete !== 'new-password' || signup.passwordAutocomplete !== 'new-password') {
        pageIssues.push('signup password autocomplete attributes are incorrect');
      }
      if (!signup.legalNoticeVisible) pageIssues.push('signup legal notice is not visible');
      if (signup.formTag !== 'FORM') pageIssues.push('login controls are not in a semantic form');
      if (!signup.pageCanScroll) pageIssues.push('signup actions can be clipped on a short viewport');

      await client.send('Runtime.evaluate', {
        expression: `(() => {
          document.getElementById('username-input').value = 'browser_test_user';
          document.getElementById('password-input').value = 'correct-password';
          document.getElementById('confirm-password-input').value = 'different-password';
          document.getElementById('login-form').requestSubmit();
        })()`,
      });
      await new Promise((resolveWait) => setTimeout(resolveWait, 50));
      const { result: mismatchResult } = await client.send('Runtime.evaluate', {
        expression: `({
          error: document.getElementById('login-error')?.textContent,
          buttonEnabled: !document.getElementById('submit-btn')?.disabled,
        })`,
        returnByValue: true,
      });
      if (mismatchResult.value.error !== 'Passwords do not match') {
        pageIssues.push('mismatched passwords were not rejected');
      }
      if (!mismatchResult.value.buttonEnabled) pageIssues.push('validation left the submit button disabled');

      // Simulate an account that the server created successfully followed by a
      // transient automatic-sign-in failure. No real account/network request
      // is made; this verifies the user gets a usable sign-in form afterward.
      await client.send('Runtime.evaluate', {
        expression: `(() => {
          window.__auditFetch = window.fetch;
          window.__auditSignIn = window.bipassAuth.client.auth.signInWithPassword;
          window.fetch = async (input, options) => String(input) === '/auth/signup'
            ? new Response(JSON.stringify({ ok: true, email: 'browser_test_user@users.bipassai.com' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            : window.__auditFetch(input, options);
          window.bipassAuth.client.auth.signInWithPassword = async () => ({ error: { message: 'simulated' } });
          document.getElementById('confirm-password-input').value = 'correct-password';
          document.getElementById('login-form').requestSubmit();
        })()`,
      });
      await new Promise((resolveWait) => setTimeout(resolveWait, 100));
      const { result: recoveryResult } = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const state = {
            title: document.getElementById('login-title')?.textContent,
            success: document.getElementById('login-success')?.textContent,
            confirmHidden: getComputedStyle(document.getElementById('confirm-password-field')).display === 'none',
            buttonEnabled: !document.getElementById('submit-btn')?.disabled,
          };
          window.fetch = window.__auditFetch;
          window.bipassAuth.client.auth.signInWithPassword = window.__auditSignIn;
          delete window.__auditFetch;
          delete window.__auditSignIn;
          return state;
        })()`,
        returnByValue: true,
      });
      const recovery = recoveryResult.value;
      if (recovery.title !== 'Welcome back' || !recovery.confirmHidden) {
        pageIssues.push('post-signup recovery did not return to the sign-in form');
      }
      if (recovery.success !== 'Account created. Please sign in with your new password.') {
        pageIssues.push('post-signup recovery did not show the account-created message');
      }
      if (!recovery.buttonEnabled) pageIssues.push('post-signup recovery left the submit button disabled');
    }
    for (const issue of new Set(pageIssues)) issues.push(`${viewport.name} ${path}: ${issue}`);
  }

  client.socket.close();
  await fetch(`${cdpUrl}/json/close/${target.id}`);
}

const apiChecks = [
  {
    name: 'config', path: '/config', options: {}, status: 200,
    headers: {
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-frame-options': 'DENY',
    },
  },
  { name: 'public browser asset', path: '/app.js', options: {}, status: 200 },
  { name: 'private server source', path: '/server.js', options: {}, status: 404 },
  { name: 'encoded private server source', path: '/%73erver.js', options: {}, status: 404 },
  { name: 'private dependency source', path: '/node_modules/express/index.js', options: {}, status: 404 },
  { name: 'invalid signup', path: '/auth/signup', options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, status: 400 },
  {
    name: 'protected analyze',
    path: '/api/analyze',
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ samples: ['Writing sample '.repeat(50)] }),
    },
    status: 401,
  },
  { name: 'removed direct plan activation', path: '/api/activate-plan', options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"plan":"annual"}' }, status: 404 },
  { name: 'protected account deletion', path: '/api/account', options: { method: 'DELETE' }, status: 401 },
];
for (const check of apiChecks) {
  const response = await fetch(`${baseUrl}${check.path}`, check.options);
  if (response.status !== check.status) {
    issues.push(`API ${check.name}: expected ${check.status}, received ${response.status}`);
  }
  for (const [name, expected] of Object.entries(check.headers || {})) {
    const received = response.headers.get(name);
    if (received !== expected) {
      issues.push(`API ${check.name}: expected ${name}=${expected}, received ${received || 'none'}`);
    }
  }
}

if (issues.length) {
  console.error(`Browser audit failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`Browser audit passed: ${paths.length} routes at ${viewports.length} viewport sizes.`);
}
