import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBillingMeta,
  hasAcceptedPurchaseTerms,
  hasActivePass,
  isValidExtensionRedirect,
  sanitizeNextPath,
  usernameToEmail,
  validateSignupInput,
  verifyRewardToken,
} from '../server.js';

test('purchase checkout requires explicit acceptance of the current terms', () => {
  assert.equal(hasAcceptedPurchaseTerms({ termsAccepted: true, termsVersion: '2026-07-22' }), true);
  assert.equal(hasAcceptedPurchaseTerms({ termsAccepted: false, termsVersion: '2026-07-22' }), false);
  assert.equal(hasAcceptedPurchaseTerms({ termsAccepted: true, termsVersion: 'old-version' }), false);
  assert.equal(hasAcceptedPurchaseTerms({}), false);
});

test('sanitizeNextPath keeps safe same-site paths', () => {
  assert.equal(sanitizeNextPath('/home'), '/home');
  assert.equal(sanitizeNextPath('/plans.html?from=login#annual'), '/plans.html?from=login#annual');
});

test('sanitizeNextPath rejects external and malformed destinations', () => {
  for (const value of ['https://evil.example', '//evil.example/path', '/\\evil.example', 'relative/path', '', null]) {
    assert.equal(sanitizeNextPath(value), '/home');
  }
});

test('extension OAuth only accepts Chrome identity redirect origins', () => {
  assert.equal(isValidExtensionRedirect('https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/'), true);
  assert.equal(isValidExtensionRedirect('https://evil.example/.chromiumapp.org/'), false);
  assert.equal(isValidExtensionRedirect('https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/callback'), false);
  assert.equal(isValidExtensionRedirect('http://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/'), false);
});

test('usernameToEmail normalizes usernames consistently', () => {
  assert.equal(usernameToEmail('  Example.User  '), 'example.user@users.bipassai.com');
});

test('signup validation accepts a valid account and rejects bad usernames or weak passwords', () => {
  assert.equal(validateSignupInput({ username: 'student_123', password: 'eightchars' }), null);
  assert.match(validateSignupInput({ username: 'ab', password: 'eightchars' }), /3–20/);
  assert.match(validateSignupInput({ username: 'bad name', password: 'eightchars' }), /letters, numbers or underscores/);
  assert.match(validateSignupInput({ username: 'student_123', password: 'short' }), /at least 8/);
  assert.match(validateSignupInput({}), /Username/);
});

test('billing authorization only trusts server-controlled app metadata', () => {
  const forged = {
    user_metadata: { tier: 'annual', plan_expires_at: Date.now() + 86_400_000 },
    app_metadata: {},
  };
  assert.deepEqual(getBillingMeta(forged), {});
  assert.equal(hasActivePass(forged), false);
});

test('hasActivePass accepts current paid or free passes and rejects expired passes', () => {
  assert.equal(hasActivePass({ app_metadata: { tier: 'monthly', plan_expires_at: Date.now() + 10_000 } }), true);
  assert.equal(hasActivePass({ app_metadata: { free_pass_until: Date.now() + 10_000 } }), true);
  assert.equal(hasActivePass({ app_metadata: { tier: 'monthly', plan_expires_at: Date.now() - 10_000 } }), false);
  assert.equal(hasActivePass({ app_metadata: { free_pass_until: Date.now() - 10_000 } }), false);
});

test('reward verification fails closed for malformed or forged tokens', () => {
  assert.equal(verifyRewardToken(undefined), null);
  assert.equal(verifyRewardToken('3.bad.signature'), null);
  assert.equal(verifyRewardToken(`7.${Date.now()}.forged`), null);
});
