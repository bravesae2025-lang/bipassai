import test from 'node:test';
import assert from 'node:assert/strict';

// This file runs in its own test worker. All upstream requests are mocked;
// no account, live model, or real billing service is contacted.
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
process.env.GEMINI_API_KEY = 'test-only';
const { app, creditsForText } = await import('../server.js');
const handler = app._router.stack.find(layer => layer.route?.path === '/api/adjust-level').route.stack[0].handle;
const user = { id: 'test-user', app_metadata: { tier: 'monthly', credits: 10000, bipass_billing_migrated: true } };

async function request(body, outputs) {
  const originalFetch = globalThis.fetch;
  let calls = 0, writes = [];
  globalThis.fetch = async (url, options = {}) => {
    if (url.includes('generativelanguage')) {
      const output = outputs[calls++];
      if (output === 'unavailable') return new Response('{}', { status: 503 });
      return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(output) }] } }] });
    }
    if (options.method === 'HEAD') return new Response(null, { headers: { 'content-range': '0-0/0' } });
    if (options.method === 'PUT') writes.push(JSON.parse(options.body));
    return Response.json(user);
  };
  try {
    const response = await new Promise((resolve, reject) => {
      const res = { statusCode: 200, writableEnded: false, on() {}, status(code) { this.statusCode = code; return this; }, json(data) { this.writableEnded = true; resolve({ status: this.statusCode, data }); } };
      handler({ body, headers: { authorization: 'Bearer test-only' } }, res, reject);
    });
    return { ...response, calls, writes };
  } finally { globalThis.fetch = originalFetch; }
}
const empty = { edits: [], existingMistakes: [], shortfall: '' };
const wording = { ...empty, edits: [{ original: 'utilize', replacement: 'use', occurrence: 1, category: 'word' }] };

test('automatic preset and Custom policies resolve before generation and charge once', async () => {
  for (const [level, structureMode, structureStyle, expected] of [
    ['easy', 'auto', undefined, 'beginner'], ['medium', 'auto', undefined, 'student'],
    ['customize', 'keep', undefined, 'keep'], ...['balanced', 'shorter', 'connected'].map(s => ['customize', 'flow', s, s]),
  ]) {
    const result = await request({ text: 'We utilize tools.', level, structureMode, structureStyle }, [wording, empty]);
    assert.equal(result.status, 200);
    assert.equal(result.data.appliedStructure.style, expected);
    assert.equal(result.data.structureMode, structureMode === 'keep' ? 'keep' : 'flow');
    assert.equal(result.writes.length, 1);
  }
});
test('contradictory Custom style combinations fail before generation or charging', async () => {
  for (const settings of [
    { level: 'medium', structureMode: 'auto', structureStyle: 'shorter' },
    { level: 'easy', structureMode: 'flow', structureStyle: 'balanced' },
    { level: 'customize', structureMode: 'auto' },
    { level: 'customize', structureMode: 'keep', structureStyle: 'connected' },
    { level: 'customize', structureMode: 'flow', structureStyle: null },
  ]) {
    const result = await request({ text: 'We utilize tools.', ...settings }, []);
    assert.equal(result.status, 400);
    assert.equal(result.calls, 0);
    assert.equal(result.writes.length, 0);
  }
});
test('My Level auto handles legacy and v4 profiles without allowing a Custom style override', async () => {
  const legacy = { summary: 'Direct voice.', tone: { label: 'Direct', evidence: 'Clear statements.' }, sentenceStyle: { label: 'Short', evidence: 'Compact sentences.' }, strengths: [], habits: [] };
  const P = globalThis.BipassSentencePatterns;
  const prepared = P.prepare(['We read short books. '.repeat(20)]);
  const current = { ...legacy, sentencePatterns: P.complete(prepared, { labels: prepared.sentences.map(s => ({ id: s.id, type: 'simple' })), observations: [] }) };
  for (const [styleProfile, style, mode] of [[legacy, 'keep', 'keep'], [current, 'profile', 'flow']]) {
    const result = await request({ text: 'We utilize tools.', level: 'customize', structureMode: 'auto', styleProfile }, [wording, empty]);
    assert.equal(result.status, 200);
    assert.equal(result.data.appliedStructure.style, style);
    assert.equal(result.data.structureMode, mode);
    assert.equal(result.data.profileApplied, true);
    assert.equal(result.writes.length, 1);
  }
  const invalid = await request({ text: 'We utilize tools.', level: 'customize', structureMode: 'flow', structureStyle: 'balanced', styleProfile: current }, []);
  assert.equal(invalid.status, 400);
  assert.equal(invalid.writes.length, 0);
});

test('adjust-level defaults to keep and charges exactly once after both validated stages', async () => {
  const result = await request({ text: 'We utilize tools.', level: 'medium' }, [wording, empty]);
  assert.equal(result.status, 200);
  assert.equal(result.data.cleanText, 'We use tools.');
  assert.equal(result.data.structureMode, 'keep');
  assert.equal(result.calls, 2);
  assert.equal(result.writes.length, 1);
  assert.equal(result.data.creditsUsed, creditsForText('We utilize tools.', 'level'));
  assert.equal(result.writes[0].app_metadata.credits, 10000 - result.data.creditsUsed);
});

test('invalid explicit structure values never generate or charge', async () => {
  for (const structureMode of [null, 'invalid', 1]) {
    const result = await request({ text: 'We utilize tools.', level: 'medium', structureMode }, []);
    assert.equal(result.status, 400);
    assert.equal(result.calls, 0);
    assert.equal(result.writes.length, 0);
  }
});

test('persistent malformed output returns retryable failure with no charge', async () => {
  const malformed = { ...empty, edits: [{ original: 'invented', replacement: 'use', occurrence: 1, category: 'word' }] };
  const result = await request({ text: 'We utilize tools.', level: 'medium' }, [malformed, malformed]);
  assert.equal(result.status, 502);
  assert.equal(result.data.retryable, true);
  assert.equal(result.calls, 2);
  assert.equal(result.writes.length, 0);
});

test('second-stage repair has a single shared allowance and still charges only once', async () => {
  const bad = { ...empty, edits: [{ original: 'tools.', replacement: 'tools!', occurrence: 1, category: 'punct' }] };
  const result = await request({ text: 'We utilize tools.', level: 'medium', structureMode: 'flow' }, [wording, bad, empty]);
  assert.equal(result.status, 200);
  assert.equal(result.calls, 3);
  assert.equal(result.writes.length, 1);
});

test('provider outage does not trigger repair or charge', async () => {
  const result = await request({ text: 'We utilize tools.', level: 'medium' }, ['unavailable']);
  assert.equal(result.status, 502);
  assert.equal(result.calls, 1);
  assert.equal(result.writes.length, 0);
});

test('candidate-based preset output produces canonical records and one charge', async () => {
  const text = 'The children read books after school every day.';
  const result = await request({ text, level: 'easy' }, [empty, { editIds: [0], existingMistakes: [], shortfall: '' }]);
  assert.equal(result.status, 200);
  assert.equal(result.data.cleanText, 'The childern read books after school every day.');
  assert.equal(result.data.changes[0].original, 'children');
  assert.equal(result.writes.length, 1);
});

test('persistent invented candidate IDs fail without a charge', async () => {
  const invalid = { editIds: [99999], existingMistakes: [], shortfall: '' };
  const result = await request({ text: 'We read books after school every day.', level: 'easy' }, [empty, invalid, invalid]);
  assert.equal(result.status, 502);
  assert.equal(result.calls, 3);
  assert.equal(result.writes.length, 0);
  assert.equal(result.data.retryable, true);
});
