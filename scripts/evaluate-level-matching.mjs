import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { runLevelMatching, geminiGenerator, presetBudget, sentences } from '../level-matching.js';
import { buildCustomizePrompt, resolveLevelMatchProfile } from '../server.js';

const corpus = JSON.parse(readFileSync(new URL('../test/fixtures/matching-drafts.json', import.meta.url)));
const directory = process.env.MATCH_EVAL_DIR || '/private/tmp/bipass-match-evaluation';
mkdirSync(directory, { recursive: true });
if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required');
const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const selected = process.env.MATCH_EVAL_CASE ? corpus.filter(c => c.id === process.env.MATCH_EVAL_CASE) : corpus;
const repeats = Number(process.env.MATCH_EVAL_REPEATS || 2);
const concurrency = Number(process.env.MATCH_EVAL_CONCURRENCY || 4);
if (!selected.length || !Number.isInteger(repeats) || repeats < 1 || repeats > 10 || !Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) throw new Error('Invalid evaluation selection, repeats, or concurrency');
const jobs = selected.flatMap(draft => ['easy', 'medium'].flatMap(level => ['keep', 'flow'].flatMap(structureMode => Array.from({ length: repeats }, (_, repeat) => ({ draft, level, structureMode, repeat })))));
if (process.env.MATCH_EVAL_BASELINE === '1') jobs.push(...selected.flatMap(draft => ['easy', 'medium'].map(level => ({ draft, level, baseline: true }))));
let index = 0;
const summaries = [];
async function worker() {
  while (index < jobs.length) {
    const job = jobs[index++];
    const { draft, level, structureMode = 'keep', repeat = 0 } = job;
    const id = `${draft.id}-${level}-${job.baseline ? 'baseline' : structureMode}-${repeat}`;
    const started = Date.now(), metrics = [], usage = [], stages = [];
    const fetchImpl = async (...args) => {
      const response = await fetch(...args);
      if (response.ok) { const json = await response.clone().json(); usage.push(json.usageMetadata || {}); }
      return response;
    };
    try {
      let result;
      if (job.baseline) {
        const response = await fetchImpl(endpoint, { method: 'POST', signal: AbortSignal.timeout(120000), headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY }, body: JSON.stringify({ contents: [{ parts: [{ text: buildCustomizePrompt(resolveLevelMatchProfile(level), draft.text.split(/\s+/).length) + '\n\nText:\n' + draft.text }] }], generationConfig: { temperature: 0.5, topP: 0.95, maxOutputTokens: 32768, thinkingConfig: { thinkingBudget: 8192 } } }) });
        if (!response.ok) throw new Error(`Baseline provider status ${response.status}`);
        const data = await response.json();
        if (data.candidates?.[0]?.finishReason !== 'STOP') throw new Error('Baseline incomplete');
        const annotated = data.candidates[0].content.parts.filter(p => !p.thought).map(p => p.text || '').join('').trim()
          .replace(/\s*—\s*/g, ', ').replace(/\s*–\s*/g, ', ').replace(/([A-Za-z])-([A-Za-z])/g, '$1 $2');
        result = { cleanText: annotated.replace(/\[\[([^\]|]*)\|([^\]|]*)\|([^\]]*)\]\]/g, '$2'), result: annotated };
      } else {
        const provider = geminiGenerator({ apiKey: process.env.GEMINI_API_KEY, endpoint, fetchImpl });
        const generate = async request => {
          const output = await provider(request);
          // Corpus drafts only: retain stage data in local artifacts for manual
          // meaning/simplicity review. Production telemetry never stores these.
          stages.push({ input: request.text, output });
          return output;
        };
        result = await runLevelMatching({ text: draft.text, level, config: resolveLevelMatchProfile(level), structureMode, generate, onMetric: metric => metrics.push(metric) });
      }
      const summary = { id, passed: true, qualityReview: 'pending', durationMs: Date.now() - started, changes: result.changes?.length, metrics, usage, sentenceCounts: [sentences(draft.text).length, sentences(result.cleanText).length], remainingPhrases: draft.phrases.filter(p => result.cleanText.toLowerCase().includes(p.toLowerCase())), budget: presetBudget(draft.text, level) };
      writeFileSync(resolve(directory, `${id}.json`), JSON.stringify({ ...summary, source: draft.text, stages, ...result }, null, 2));
      summaries.push(summary);
      console.log(JSON.stringify({ id, passed: true, durationMs: summary.durationMs, changes: summary.changes, remainingPhrases: summary.remainingPhrases }));
    } catch (error) {
      const summary = { id, passed: false, error: error.message, metrics, usage, durationMs: Date.now() - started };
      summaries.push(summary);
      writeFileSync(resolve(directory, `${id}.json`), JSON.stringify({ ...summary, source: draft.text, stages }, null, 2));
      console.log(JSON.stringify(summary));
    }
    writeFileSync(resolve(directory, 'summary.json'), JSON.stringify(summaries, null, 2));
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(JSON.stringify({ total: summaries.length, passed: summaries.filter(r => r.passed).length, directory }));
if (summaries.some(r => !r.passed)) process.exitCode = 1;
