// Single synthetic check only. Reserve worst-case spend BEFORE the sole call.
// The remaining THB 8 of the approved THB 10 is reserved for a website check.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { runLevelMatching, geminiGenerator } from '../level-matching.js';

const dir = '/tmp/bipass-capped-profile-20260908';
mkdirSync(dir); // Fail closed if this check has already been started.
const drafts = JSON.parse(readFileSync(new URL('../test/fixtures/matching-drafts.json', import.meta.url)));
const profile = JSON.parse(readFileSync('/tmp/bipass-sentence-final-review-20260908/analysis-connected.json')).analysis.profile;
const source = drafts.find(d => d.id === 'long-clauses').text;
const usdToThbWithBuffer = 40, budgetThb = 2;
let calls = 0, reservedThb = 0, usage = null;
const metrics = [];
const fetchImpl = async (url, options) => {
  if (calls) throw new Error('Single-call test limit reached; no paid repair permitted');
  const body = JSON.parse(options.body);
  body.generationConfig.maxOutputTokens = 16384;
  const encoded = JSON.stringify(body);
  // UTF-8 bytes overestimate text-token count; include extra protocol overhead.
  const inputUpper = Buffer.byteLength(encoded, 'utf8') + 2048;
  reservedThb = (inputUpper * .30 + 16384 * 2.50) / 1e6 * usdToThbWithBuffer;
  if (reservedThb > budgetThb) throw new Error('Worst-case token reservation exceeds THB 2; no request sent');
  calls++;
  console.log(JSON.stringify({ calls, reservedThb, inputUpper, maxOutputTokens: 16384 }));
  return fetch(url, { ...options, body: encoded });
};
try {
  const result = await runLevelMatching({
    text: source, level: 'customize', structureMode: 'auto', profile,
    config: { wordLevel: 5, grammar: 0, tense: 0, punct: 0, caps: 0, spelling: 0 },
    generate: geminiGenerator({ apiKey: process.env.GEMINI_API_KEY,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      fetchImpl, onUsage: value => { usage = value; } }),
    onMetric: value => { metrics.push(value); if (value.validationFailed) throw new Error('Validation failed; stopping without repair'); },
  });
  const estimatedThb = usage ? ((usage.promptTokenCount || 0) * .30 + ((usage.candidatesTokenCount || 0) + (usage.thoughtsTokenCount || 0)) * 2.50) / 1e6 * usdToThbWithBuffer : null;
  const report = { validated: true, qualityReview: 'pending', calls, reservedThb, estimatedThb, usage, source, ...result, metrics };
  writeFileSync(`${dir}/result.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} catch (error) {
  const report = { validated: false, calls, reservedThb, usage, error: error.message, metrics };
  writeFileSync(`${dir}/result.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  process.exitCode = 1;
}
