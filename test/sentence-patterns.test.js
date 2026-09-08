import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../sentence-patterns.js';
import '../style-profile.js';
import { normalizeStyleAnalysis, normalizeWritingProfile, analyzeWritingSamples } from '../server.js';
const P = globalThis.BipassSentencePatterns;
const fixtures = JSON.parse(readFileSync(new URL('./fixtures/clause-labels.json', import.meta.url)));
function labelled(samples, type = 'simple') {
  const prepared = P.prepare(samples);
  return { prepared, raw: { labels: prepared.sentences.map(s => ({ id: s.id, type })), observations: [] } };
}
test('clause fixture IDs preserve hand-labelled distinctions without conjunction heuristics', () => {
  const prepared = P.prepare([fixtures.map(f => f.text).join(' ')]);
  assert.equal(prepared.sentences.length, fixtures.length);
  const patterns = P.complete(prepared, { labels: prepared.sentences.map((s, i) => ({ id: s.id, type: fixtures[i].type })), observations: [] });
  assert.deepEqual(patterns.counts, { simple: 2, compound: 2, complex: 1, 'compound-complex': 1, fragment: 2, uncertain: 1 });
  assert.equal(patterns.confidence, 'limited');
  assert.match(P.instructions, /Shared-subject verbs/);
});
test('sampling is bounded, deterministic and evenly distributed across all samples', () => {
  const samples = [Array.from({ length: 150 }, (_, i) => `We read book number ${i}.`).join(' '), 'They read short books. They choose long books.'];
  const a = P.prepare(samples), b = P.prepare(samples);
  assert.deepEqual(a, b);
  assert.equal(a.sentences.length, 80);
  assert.equal(a.stats.sentenceCount, 152);
  assert.ok(a.sentences.some(s => s.id === 's0-0'));
  assert.ok(a.sentences.some(s => s.id === 's0-149'));
  assert.equal(a.sentences.filter(s => s.sample === 1).length, 2);
});
test('counts and recurring terms are measured across all samples, excluding quoted habits', () => {
  const p = P.prepare(["We don't stop, but we rest. We don't rush, but we keep going. The writer said, \"However however I'm I'm.\""]);
  assert.equal(p.stats.contractions, 2);
  assert.deepEqual(p.stats.connectors, [{ term: 'but', count: 2 }]);
  assert.ok(p.stats.openings.some(o => o.term === 'we' && o.count === 2));
});
test('classifications and observations reject missing IDs, duplicates and invented evidence', () => {
  const { prepared, raw } = labelled(['We read books. They read stories.']);
  for (const labels of [[], [raw.labels[0], raw.labels[0]], [{ id: 'invented', type: 'simple' }, raw.labels[1]]]) assert.throws(() => P.complete(prepared, { ...raw, labels }));
  const observation = { kind: 'vocabulary', label: 'Everyday words', evidence: [{ sentenceId: 's0-0', quote: 'read books' }] };
  const valid = P.complete(prepared, { ...raw, observations: [observation] });
  assert.deepEqual(valid.observations[0], { kind: 'vocabulary', label: 'Everyday words', support: 1, samples: 1 });
  assert.ok(!JSON.stringify(valid).includes('read books'));
  assert.throws(() => P.complete(prepared, { ...raw, observations: [{ ...observation, evidence: [{ sentenceId: 's0-0', quote: 'invented evidence' }] }] }));
  assert.throws(() => P.normalize({ ...valid, observations: [{ ...valid.observations[0], support: 0 }] }));
  assert.throws(() => P.normalize({ ...valid, sentenceCount: 0 }));
  assert.match(P.schema.properties.observations.description, /At most 10/);
  assert.equal(P.schema.properties.observations.items.properties.evidence.minItems, 1);
  assert.equal(P.schema.properties.observations.items.properties.evidence.maxItems, 3);
  assert.throws(() => P.complete(prepared, { ...raw, observations: [{ ...observation, evidence: Array(4).fill(observation.evidence[0]) }] }), /1–3 evidence/);
});
test('short and conflicting samples produce conservative or mixed estimates', () => {
  const short = labelled(['We read books. '.repeat(15)]);
  assert.equal(P.complete(short.prepared, short.raw).confidence, 'limited');
  const long = labelled(['We carefully read the interesting books and talk about the ideas in our small group each evening. '.repeat(12)]);
  assert.equal(P.complete(long.prepared, long.raw).confidence, 'supported');
  const mixed = labelled(['We read books. '.repeat(8), 'We read because it helps. '.repeat(8)]);
  mixed.raw.labels.forEach(l => { if (l.id.startsWith('s1')) l.type = 'complex'; });
  const value = P.complete(mixed.prepared, mixed.raw);
  assert.equal(value.mixed, true);
  assert.equal(value.dominant, null);
});
test('v4 survives server/client storage, score refinement and result snapshots without samples in sync', () => {
  const { prepared, raw } = labelled(['We read useful books every evening. '.repeat(20)]);
  const sentencePatterns = P.complete(prepared, raw);
  const profile = { summary: 'Direct writing.', tone: { label: 'Direct', evidence: 'Plain claims.' }, sentenceStyle: { label: 'Simple sentences', evidence: 'Observed clauses.' }, strengths: [], habits: [], sentencePatterns };
  const analysis = normalizeStyleAnalysis({ scores: { wordLevel: 5, grammar: 1, tense: 0, punct: 0, caps: 0, spelling: 0 }, evidence: {}, profile });
  assert.equal(analysis.version, 4);
  const C = globalThis.BipassStyleProfile;
  const style = { id: 'test', name: 'Test', style_summary: C.serializeSummary([], analysis), writing_samples: ['private original sample'] };
  assert.equal(C.readAnalysis(style).version, 4);
  assert.deepEqual(C.resultSnapshot(style).styleProfile.sentencePatterns, sentencePatterns);
  assert.ok(!C.serializeProfileStore([style], 'test', { includeSamples: false }).includes('private original sample'));
  assert.throws(() => normalizeWritingProfile({ ...profile, sentencePatterns: { ...sentencePatterns, classified: 900 } }, { strict: true }));
  assert.throws(() => normalizeStyleAnalysis({ ...analysis, profile: { ...profile, sentencePatterns: undefined } }), /incomplete/);
  assert.equal(C.readAnalysis({ style_analysis: { ...analysis, profile: { ...profile, sentencePatterns: undefined } } }), null);
});
test('truncated profile analysis fails instead of replacing a profile', async () => {
  await assert.rejects(analyzeWritingSamples(['We read books. '.repeat(30)], 'test', async () => Response.json({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: '{}' }] } }] })), /incomplete/i);
});

test('profile analysis repairs overlong evidence once without weakening validation', async () => {
  const samples = ['We read interesting books together every evening and talk about the different ideas with our friends. '.repeat(15)];
  const { raw } = labelled(samples);
  const observation = kind => ({ kind, label: kind === 'tone' ? 'Direct' : 'Everyday vocabulary', evidence: [{ sentenceId: 's0-0', quote: 'We read interesting books' }] });
  raw.observations = [observation('tone'), observation('vocabulary')];
  const profile = { summary: 'Direct writing.', tone: { label: 'Direct', evidence: 'Plain statements.' }, sentenceStyle: { label: 'Simple', evidence: 'Direct clauses.' }, strengths: [], habits: [] };
  let calls = 0;
  const result = await analyzeWritingSamples(samples, 'test', async (_url, request) => {
    const sentenceAnalysis = structuredClone(raw);
    if (!calls++) sentenceAnalysis.observations[0].evidence[0].quote = samples[0].split(' ').slice(0, 15).join(' ');
    else assert.match(JSON.parse(request.body).contents.at(-1).parts[0].text, /at most 12 words/);
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ profile, scores: { wordLevel: 4, grammar: 0, tense: 0, punct: 0, caps: 0, spelling: 0 }, evidence: {}, sentenceAnalysis }) }] } }] });
  });
  assert.equal(calls, 2);
  assert.equal(result.analysis.version, 4);
  assert.ok(!JSON.stringify(result.analysis).includes('We read interesting books'));
});

test('persistent malformed profile records fail after two calls and outages do not retry', async () => {
  let calls = 0;
  await assert.rejects(analyzeWritingSamples(['We read books. '.repeat(30)], 'test', async () => {
    calls++;
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{}' }] } }] });
  }));
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(analyzeWritingSamples(['We read books. '.repeat(30)], 'test', async () => { calls++; return Response.json({ error: { message: 'Unavailable' } }, { status: 503 }); }), /Unavailable/);
  assert.equal(calls, 1);
});
