// Fixed synthetic drafts only. Never load customer samples or contact detectors.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { runLevelMatching, geminiGenerator, sentences, resolveEdits } from '../level-matching.js';
import { analyzeWritingSamples, resolveLevelMatchProfile, refineWritingProfile } from '../server.js';
const P = globalThis.BipassSentencePatterns;
const corpus = JSON.parse(readFileSync(new URL('../test/fixtures/matching-drafts.json', import.meta.url)));
const profiles = JSON.parse(readFileSync(new URL('../test/fixtures/synthetic-profiles.json', import.meta.url)));
const clauses = JSON.parse(readFileSync(new URL('../test/fixtures/clause-labels.json', import.meta.url)));
const out = process.env.MATCH_EVAL_DIR || '/tmp/bipass-sentence-evaluation';
mkdirSync(out, { recursive: true });
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('Provider credential unavailable in this runtime');
const smoke = process.env.MATCH_EVAL_SMOKE === '1';
const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const results = [];
const write = (id, data) => writeFileSync(resolve(out, `${id}.json`), JSON.stringify(data, null, 2));
async function record(id, fn) {
  const start = Date.now(), usage = [], stages = [], metrics = [];
  const fetchImpl = async (...args) => {
    const response = await fetch(...args);
    if (response.ok) { const data = await response.clone().json(); usage.push(data.usageMetadata || {}); stages.push(data.candidates?.[0]?.content?.parts?.filter(p => !p.thought).map(p => p.text || '').join('')); }
    return response;
  };
  try {
    const data = await fn({ fetchImpl, metrics });
    const summary = { id, passed: true, qualityReview: 'pending', durationMs: Date.now() - start, usage, metrics };
    write(id, { ...summary, stages, ...data }); results.push(summary);
    console.log(JSON.stringify({ id, passed: true, durationMs: summary.durationMs }));
    return data;
  } catch (error) {
    const summary = { id, passed: false, error: error.message, durationMs: Date.now() - start, usage, metrics };
    write(id, { ...summary, stages }); results.push(summary); console.log(JSON.stringify(summary));
    return null;
  } finally { write('summary', results); }
}
const behaviours = [
  { id: 'beginner', level: 'easy', structureMode: 'auto' },
  { id: 'student', level: 'medium', structureMode: 'auto' },
  { id: 'custom-off', level: 'customize', structureMode: 'keep' },
  ...['balanced', 'shorter', 'connected'].map(structureStyle => ({ id: structureStyle, level: 'customize', structureMode: 'flow', structureStyle })),
];
const selected = smoke ? corpus.filter(d => d.id === 'long-clauses') : corpus;
const repeats = smoke ? 1 : 2;
const jobs = selected.flatMap(draft => behaviours.flatMap(behaviour => Array.from({ length: repeats }, (_, repeat) => ({ draft, behaviour, repeat }))));
const analysed = [];
for (const profile of smoke ? profiles.slice(0, 1) : profiles) {
  const data = await record(`analysis-${profile.id}`, async ({ fetchImpl }) => ({ samples: profile.samples, ...await analyzeWritingSamples(profile.samples, apiKey, fetchImpl) }));
  if (data) analysed.push({ ...profile, analysis: data.analysis });
}
if (!smoke) {
  await record('analysis-short', async ({ fetchImpl }) => analyzeWritingSamples([profiles[0].samples[0].split(' ').slice(0, 70).join(' ')], apiKey, fetchImpl));
  await record('analysis-clauses', async ({ fetchImpl }) => {
    const data = await analyzeWritingSamples([clauses.map(c => c.text).join(' ')], apiKey, fetchImpl);
    return { expected: clauses, ...data };
  });
  if (analysed.length) await record('refine-profile', async ({ fetchImpl }) => refineWritingProfile(analysed[0].analysis, 'Check the sentence habits again against these samples.', analysed[0].samples, apiKey, fetchImpl));
}
for (const profile of analysed) for (const draft of corpus.filter(d => ['formal', 'long-clauses', 'technical'].includes(d.id))) for (let repeat = 0; repeat < repeats; repeat++) jobs.push({ draft, repeat, behaviour: { id: `profile-${profile.id}`, level: 'customize', structureMode: 'auto', profile: profile.analysis.profile, config: profile.analysis.scores } });
if (!smoke && process.env.MATCH_EVAL_BASELINE_MODULE) for (const draft of corpus) for (const level of ['easy', 'medium']) jobs.push({ draft, repeat: 0, baseline: true, behaviour: { id: `baseline-${level}`, level, structureMode: 'flow' } });
let cursor = 0;
async function worker() {
  while (cursor < jobs.length) {
    const { draft, behaviour, repeat, baseline } = jobs[cursor++];
    await record(`${draft.id}-${behaviour.id}-${repeat}`, async ({ fetchImpl, metrics }) => {
      const module = baseline ? await import(process.env.MATCH_EVAL_BASELINE_MODULE) : { runLevelMatching, geminiGenerator };
      const generate = module.geminiGenerator({ apiKey, endpoint, fetchImpl });
      const config = behaviour.config || resolveLevelMatchProfile(behaviour.level, behaviour.level === 'customize' ? { wordLevel: 5, grammar: 0, tense: 0, punct: 0, caps: 0, spelling: 0 } : undefined);
      let wordingText = draft.text;
      const capture = async request => {
        const output = await generate(request);
        if (request.stage === 'wording' || request.prompt?.includes('Stage 1:')) {
          try { const edits = resolveEdits(request.text, output.edits, 'wording', behaviour.structureMode === 'keep' ? 'keep' : 'flow'); wordingText = globalThis.BipassMatchResult.applyChanges(request.text, edits); } catch (_) {}
        }
        return output;
      };
      const result = await module.runLevelMatching({ text: draft.text, ...behaviour, config, generate: capture, onMetric: m => metrics.push(m) });
      return { source: draft.text, wordingText, sentenceCounts: [sentences(draft.text).length, sentences(wordingText).length], remainingPhrases: draft.phrases.filter(p => wordingText.toLowerCase().includes(p.toLowerCase())), ...result };
    });
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(JSON.stringify({ complete: true, total: results.length, passed: results.filter(r => r.passed).length, out }));
if (results.some(r => !r.passed)) process.exitCode = 1;
