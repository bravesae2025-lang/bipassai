// Read-only report for synthetic evaluation artifacts. Validation is not a
// substitute for separate human review of meaning or sentence-style quality.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('Usage: node scripts/summarize-sentence-evaluation.mjs <run-directory>');
const read = name => JSON.parse(readFileSync(resolve(dir, `${name}.json`), 'utf8'));
const rows = read('summary');
const groups = {};
let densityMet = 0, densityShortfalls = 0;
for (const row of rows) {
  if (!row.passed || !row.metrics.some(m => m.stage === 'wording')) continue;
  const result = read(row.id), policy = result.appliedStructure?.style || result.structureMode;
  const group = groups[policy] ||= { validated: 0, sourceSentences: 0, wordingSentences: 0, remainingDifficultPhrases: 0 };
  group.validated++;
  group.sourceSentences += result.sentenceCounts[0];
  group.wordingSentences += result.sentenceCounts[1];
  group.remainingDifficultPhrases += result.remainingPhrases.length;
  const mechanical = row.metrics.find(m => m.stage === 'mechanics' && m.budget);
  if (mechanical) {
    const count = mechanical.edits + mechanical.existingMistakes;
    if (count >= mechanical.budget.min && count <= mechanical.budget.max) densityMet++;
    else densityShortfalls++;
  }
}
const usage = rows.flatMap(row => row.usage);
const latency = rows.filter(row => row.passed).map(row => row.durationMs).sort((a, b) => a - b);
console.log(JSON.stringify({
  completion: existsSync(resolve(dir, 'completion.json')) ? read('completion') : null,
  tokens: usage.reduce((sum, item) => sum + (item.totalTokenCount || 0), 0),
  providerResponses: usage.length,
  validatedJobsWithRepair: rows.filter(row => row.passed && row.metrics.some(m => m.repaired)).length,
  stageValidationFailures: rows.flatMap(row => row.metrics).filter(m => m.validationFailed).length,
  medianMs: latency[Math.floor(latency.length * .5)], p90Ms: latency[Math.floor(latency.length * .9)],
  presetDensity: { withinRange: densityMet, shortfallOrPreexistingExcess: densityShortfalls },
  groups,
  failures: rows.filter(row => !row.passed).map(({ id, error }) => ({ id, error })),
  qualityReview: 'Separate manual review required; sentence counts are not clause classifications.',
}));
