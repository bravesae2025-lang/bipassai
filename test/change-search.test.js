import test from 'node:test';
import assert from 'node:assert/strict';
import '../change-search.js';

const { containsWords, countOccurrences, displayQuery, sameWords, tokenize } = globalThis.BipassChangeSearch;

test('change search matches exact complete words, not similar substrings', () => {
  assert.equal(sameWords('to', 'ti'), false);
  assert.equal(sameWords('time', 'ti'), false);
  assert.equal(sameWords('to', 'to'), true);
  assert.equal(sameWords('To,', 'to'), true);
  assert.equal(containsWords('has been changed', 'has'), true);
  assert.equal(containsWords('time has changed', 'ti'), false);
});

test('change search compares only the text explicitly passed as the replacement', () => {
  const original = 'ti';
  const replacement = 'to';
  assert.equal(containsWords(replacement, 'ti'), false);
  assert.equal(sameWords(original, 'ti'), true);
});

test('occurrence count uses exact word and phrase boundaries', () => {
  const text = 'To go today is to move toward home. Today, we go to school.';
  assert.equal(countOccurrences(text, 'to'), 3);
  assert.equal(countOccurrences(text, 'today'), 2);
  assert.equal(countOccurrences(text, 'to go'), 1);
  assert.equal(countOccurrences(text, 'ti'), 0);
});

test('search normalization handles punctuation, case and apostrophes cleanly', () => {
  assert.deepEqual(tokenize("DON’T, don't."), ["don't", "don't"]);
  assert.equal(sameWords("don’t", "don't"), true);
  assert.equal(displayQuery('  Student-Level!  '), 'student level');
});
