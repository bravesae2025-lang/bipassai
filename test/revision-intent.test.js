import test from 'node:test';
import assert from 'node:assert/strict';
import '../revision-intent.js';

const { classifyRevisionIntent } = globalThis.BipassRevisionIntent;

test('revision comments route level requests and preserve or select the level', () => {
  assert.deepEqual(classifyRevisionIntent('Run level matching again', 'hard'), {
    kind: 'level', level: 'hard',
  });
  assert.deepEqual(classifyRevisionIntent('Change this to Beginner level', 'hard'), {
    kind: 'level', level: 'easy',
  });
  assert.deepEqual(classifyRevisionIntent('match this to student level please', 'easy'), {
    kind: 'level', level: 'medium',
  });
  assert.equal(classifyRevisionIntent('can you re level mathing this', 'medium').kind, 'level');
});

test('wording and sentence feedback stays with the focused editor', () => {
  for (const comment of [
    'Fix the awkward second sentence only',
    'Make the wording less repetitive',
    'Correct the spelling of accommodation',
    'Shorten paragraph three',
    'Make this sound less robotic',
  ]) {
    assert.equal(classifyRevisionIntent(comment, 'medium').kind, 'edit');
  }
});
