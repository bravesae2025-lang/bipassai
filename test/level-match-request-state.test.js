import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const matching = app.slice(app.indexOf('let activeLevelMatch = null;'), app.indexOf('// ─── State', app.indexOf('let activeLevelMatch = null;')));

function harness() {
  const requests = [], loading = [], toasts = [];
  const context = vm.createContext({
    AbortController, setTimeout, myLevelSelectionPending: false, myStyleActive: false,
    selectedLevel: 'medium', inputText: { value: 'A synthetic draft.' },
    requireLevel: () => true, preflightGate: async () => true,
    activeStyleProfilePayload: () => null, currentStructureRequest: () => ({ structureMode: 'auto' }),
    currentAbortController: null, savedStyle: null,
    setLoading: value => loading.push(value), showToast: message => toasts.push(message),
    window: { bipassAuth: { getToken: async () => 'synthetic-token' } },
    fetch: (_url, options) => new Promise((resolve, reject) => requests.push({ options, resolve, reject })),
  });
  vm.runInContext(matching, context);
  return { context, requests, loading, toasts };
}
const tick = () => new Promise(resolve => setImmediate(resolve));

test('Level Matching prevents overlapping submissions before preflight finishes', async () => {
  const h = harness();
  const first = h.context.adjustLevel();
  await h.context.adjustLevel();
  await tick();
  assert.equal(h.requests.length, 1);
  assert.ok(h.requests[0].options.signal);
  h.requests[0].reject(new Error('Synthetic failure'));
  await first;
  assert.deepEqual(h.toasts, ['Synthetic failure']);
  assert.deepEqual(h.loading, [true, false]);
});

test('a cancelled request cannot publish a late result or stop a newer request', async () => {
  const h = harness();
  const old = h.context.adjustLevel();
  await tick();
  vm.runInContext('currentAbortController.abort(); currentAbortController = null; activeLevelMatch = null;', h.context);
  const newer = h.context.adjustLevel();
  await tick();
  assert.equal(h.requests.length, 2);
  assert.equal(h.requests[0].options.signal.aborted, true);
  // This intentionally ignores abort, simulating a response that arrived late.
  h.requests[0].resolve({ ok: true });
  await old;
  assert.deepEqual(h.toasts, []);
  assert.deepEqual(h.loading, [true, true]);
  h.requests[1].reject(new Error('New request failure'));
  await newer;
  assert.deepEqual(h.toasts, ['New request failure']);
  assert.deepEqual(h.loading, [true, true, false]);
});

test('profile guidance is collapsed behind a labelled native info disclosure', () => {
  const html = readFileSync(new URL('../app.html', import.meta.url), 'utf8');
  assert.match(html, /<details class="profile-sample-help">\s*<summary aria-label="Writing sample tips">/);
  assert.doesNotMatch(html.slice(html.indexOf('<div id="my-style-inputs"'), html.indexOf('id="sample-container"')), /Use 200\+/);
});
