import test from 'node:test';
import assert from 'node:assert/strict';
import '../change-search.js';

const { containsWords, countOccurrences, displayQuery, startsWithWords, tokenize } = globalThis.BipassChangeSearch;

test('change search matches word prefixes without matching unrelated words', () => {
  assert.equal(startsWithWords('to', 'ti'), false);
  assert.equal(startsWithWords('time', 'ti'), true);
  assert.equal(startsWithWords('referred', 'ref'), true);
  assert.equal(startsWithWords('referee', 'ref'), true);
  assert.equal(startsWithWords('preferred', 'ref'), false);
  assert.equal(containsWords('has been referred', 'ref'), true);
  assert.equal(containsWords('we prefer this', 'ref'), false);
});

test('change search compares only the text explicitly passed as the replacement', () => {
  const original = 'ti';
  const replacement = 'to';
  assert.equal(containsWords(replacement, 'ti'), false);
  assert.equal(startsWithWords(original, 'ti'), true);
});

test('occurrence count includes every matching word prefix', () => {
  const text = 'Refer referred referee reference. We prefer a different word.';
  assert.equal(countOccurrences(text, 'ref'), 4);
  assert.equal(countOccurrences(text, 'refer'), 4);
  assert.equal(countOccurrences(text, 'referr'), 1);
  assert.equal(countOccurrences(text, 'prefer'), 1);
  assert.equal(countOccurrences(text, 'ti'), 0);
});

test('multi-word searches apply prefix matching to each word', () => {
  const text = 'Referred students reviewed references. Referees stood nearby.';
  assert.equal(countOccurrences(text, 'ref stu'), 1);
  assert.equal(countOccurrences(text, 'referr st'), 1);
  assert.equal(countOccurrences(text, 'ref rev'), 0);
});

test('search normalization handles punctuation, case and apostrophes cleanly', () => {
  assert.deepEqual(tokenize("DON’T, don't."), ["don't", "don't"]);
  assert.equal(startsWithWords("don’t", "don't"), true);
  assert.equal(displayQuery('  Student-Level!  '), 'student level');
});
