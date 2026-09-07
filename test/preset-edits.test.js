import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { presetEditPalette, selectedPresetEdits } from '../preset-edits.js';
import { protectedText, resolveEdits, runLevelMatching } from '../level-matching.js';
const corpus = JSON.parse(readFileSync(new URL('./fixtures/matching-drafts.json', import.meta.url)));

test('every preset candidate in the fixed corpus is an exact safe source edit', () => {
  let count = 0;
  for (const draft of corpus) {
    const { candidates } = presetEditPalette(draft.text, protectedText(draft.text));
    for (const candidate of candidates) {
      assert.equal(draft.text.slice(candidate.start, candidate.end), candidate.original);
      const resolved = resolveEdits(draft.text, [candidate], 'mechanics');
      assert.equal(resolved.length, 1);
      count++;
    }
  }
  assert.ok(count > 100);
});

test('palette leaves quotes, names, numbers, negations and unfamiliar technical words alone', () => {
  const text = 'Mary Jones said “The school was useful.” Photosynthesis uses chlorophyll. The report has not changed since 2020.';
  const { candidates } = presetEditPalette(text, protectedText(text));
  assert.deepEqual(candidates.map(c => c.original), ['report']);
});

test('preset selection rejects unknown IDs, duplicates and overlapping choices', () => {
  const text = 'The children read books, every day.';
  const { candidates } = presetEditPalette(text, protectedText(text));
  assert.throws(() => selectedPresetEdits({ editIds: [999] }, candidates));
  assert.throws(() => selectedPresetEdits({ editIds: [0, 0] }, candidates));
  const books = candidates.filter(c => c.original.startsWith('books'));
  assert.throws(() => resolveEdits(text, selectedPresetEdits({ editIds: books.map(c => c.id) }, candidates), 'mechanics'));
});

test('presets select candidates and count recognized prior slips toward the target', async () => {
  const text = 'The children read books after school every day.';
  const metrics = [];
  const result = await runLevelMatching({ text, level: 'easy', config: {}, onMetric: m => metrics.push(m), generate: async ({ candidates, schema }) => {
    if (!candidates) return { edits: [], existingMistakes: [], shortfall: '' };
    assert.ok(schema.required.includes('editIds'));
    return { editIds: [candidates.find(c => c.original === 'children').id], existingMistakes: [], shortfall: '' };
  } });
  assert.match(result.cleanText, /childern/);
  let selected = false;
  const again = await runLevelMatching({ text: result.cleanText, level: 'easy', config: {}, generate: async ({ candidates, knownExistingMistakes }) => {
    if (!candidates) return { edits: [], existingMistakes: [], shortfall: '' };
    assert.equal(knownExistingMistakes.length, 1);
    selected = true;
    return { editIds: [], existingMistakes: [], shortfall: '' };
  } });
  assert.equal(selected, true);
  assert.equal(again.cleanText, result.cleanText);
});
