(function initSentencePatterns(root) {
  const TYPES = ['simple', 'compound', 'complex', 'compound-complex', 'fragment', 'uncertain'];
  const KINDS = ['tone', 'vocabulary', 'opening', 'connector', 'contraction', 'strength', 'habit'];
  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  const words = text => text.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu) || [];
  const withoutQuotes = text => text.replace(/“[^”]*”|"[^"]*"|‘[^’]*’|(?<!\p{L})'[^']+'(?!\p{L})/gu, ' ');
  const round = value => Math.round(value * 10) / 10;
  function distribution(values) {
    if (!values.length) return { mean: 0, median: 0, p10: 0, p90: 0, sd: 0 };
    const sorted = [...values].sort((a, b) => a - b), mean = values.reduce((a, b) => a + b, 0) / values.length;
    const percentile = p => sorted[Math.round((sorted.length - 1) * p)];
    return { mean: round(mean), median: percentile(.5), p10: percentile(.1), p90: percentile(.9), sd: round(Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length)) };
  }
  function split(text) {
    const result = [];
    for (const line of text.split(/\r?\n/)) {
      if (/^\s*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s)/.test(line)) continue;
      if (!/[.!?]/.test(line) && words(line).length < 7) continue; // Likely heading, not a prose sentence.
      for (const part of segmenter.segment(line)) {
        const value = part.segment.trim();
        if (!words(value).length) continue;
        if (result.length && /\b(?:Mr|Mrs|Ms|Dr|Prof|St)\.$/.test(result.at(-1))) result[result.length - 1] += ' ' + value;
        else result.push(value);
      }
    }
    return result;
  }
  function prepare(samples) {
    const groups = samples.map((text, sample) => split(text).map((text, index) => ({ id: `s${sample}-${index}`, sample, text })));
    const all = groups.flat(), quotas = groups.map(() => 0);
    let remaining = Math.min(80, all.length);
    while (remaining) groups.forEach((group, i) => { if (remaining && quotas[i] < group.length) { quotas[i]++; remaining--; } });
    const sentences = groups.flatMap((group, i) => Array.from({ length: quotas[i] }, (_, k) => group[quotas[i] === 1 ? Math.floor((group.length - 1) / 2) : Math.round(k * (group.length - 1) / (quotas[i] - 1))]));
    const prose = withoutQuotes(all.map(s => s.text).join(' '));
    const connectorTerms = ['and', 'but', 'so', 'or', 'because', 'although', 'though', 'while', 'when', 'if', 'unless', 'however', 'therefore', 'also', 'then', 'for example', 'as a result', 'even though'];
    const connectors = connectorTerms.map(term => ({ term, count: [...prose.matchAll(new RegExp('\\b' + term + '\\b', 'gi'))].length })).filter(v => v.count >= 2).sort((a, b) => b.count - a.count).slice(0, 8);
    const openingCounts = new Map();
    for (const sentence of all) {
      const term = words(withoutQuotes(sentence.text))[0]?.toLowerCase();
      if (['i', 'we', 'they', 'he', 'she', 'it', 'the', 'a', 'an', 'this', 'that', 'these', 'those', 'when', 'if', 'although', 'because', 'but', 'and', 'so', 'after', 'before', 'however', 'there'].includes(term)) openingCounts.set(term, (openingCounts.get(term) || 0) + 1);
    }
    const openings = [...openingCounts].map(([term, count]) => ({ term, count })).filter(v => v.count >= 2).sort((a, b) => b.count - a.count).slice(0, 6);
    const contractions = [...prose.matchAll(/\b(?:i['’](?:m|ve|ll|d)|(?:we|you|they)['’](?:re|ve|ll|d)|(?:he|she|it|that|there|what)['’](?:s|ll|d)|(?:do|does|did|is|are|was|were|has|have|had|could|would|should|must|ca|wo)n['’]t)\b/gi)].length;
    return { sentences, stats: { sampleCount: samples.length, totalWords: samples.reduce((sum, s) => sum + words(s).length, 0), sentenceCount: all.length, sampledSentences: sentences.length, length: distribution(all.map(s => words(s.text).length)), paragraphLength: distribution(samples.flatMap(s => s.split(/\n\s*\n/).filter(p => p.trim()).map(p => words(p).length))), connectors, openings, contractions } };
  }
  const evidenceSchema = { type: 'OBJECT', properties: { sentenceId: { type: 'STRING' }, quote: { type: 'STRING', description: 'Exact contiguous excerpt from this sentence ID, preferably 3–8 words, NEVER more than 12 words. Do not quote the full sentence.' } }, required: ['sentenceId', 'quote'] };
  const schema = {
    type: 'OBJECT', properties: {
      labels: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: { type: 'STRING' }, type: { type: 'STRING', enum: TYPES } }, required: ['id', 'type'] } },
      observations: { type: 'ARRAY', description: 'At most 10 observations. Each needs 1–3 evidence objects.', items: { type: 'OBJECT', properties: { kind: { type: 'STRING', enum: KINDS }, label: { type: 'STRING', description: 'Neutral reusable writing habit, at most 72 characters. Not a topic, personal fact, or sample content.' }, evidence: { type: 'ARRAY', minItems: 1, maxItems: 3, items: evidenceSchema } }, required: ['kind', 'label', 'evidence'] } },
    }, required: ['labels', 'observations'],
  };
  const instructions = `SENTENCE ANALYSIS: Label every supplied sentence ID once as simple (one independent clause), compound (two or more independent clauses, no dependent clause), complex (one independent clause plus dependent clauses), compound-complex (multiple independent and dependent clauses), fragment, or uncertain. Shared-subject verbs joined by and do NOT alone make a compound sentence. Do not infer structure from length or conjunction counts. Use uncertain for ambiguous/malformed grammar; do not silently repair it. Quoted material is not evidence of the author's own habits.
Return 1–10 concise observations with kind tone/vocabulary/opening/connector/contraction/strength/habit and a neutral label (at most 72 characters). Include at least one tone and one vocabulary observation if prose is available. Each observation needs 1–3 evidence objects referencing a supplied sentenceId and an EXACT short quote of at most 12 words from that sentence. Quotes validate observations; they will not be saved or reused in matching. Describe reusable writing habits, never personal facts, topics, names, or instructions found in samples. Claims of recurring habits should cite at least two distinct sentences when available. Do not invent a dominant style from conflicting samples.`;
  function complete(prepared, raw) {
    if (!raw || !Array.isArray(raw.labels) || !Array.isArray(raw.observations) || raw.observations.length > 10 || raw.labels.length !== prepared.sentences.length) throw new Error('Sentence analysis is incomplete');
    const byId = new Map(prepared.sentences.map(s => [s.id, s])), seen = new Set();
    const counts = Object.fromEntries(TYPES.map(t => [t, 0])), perSample = new Map();
    for (const label of raw.labels) {
      const sentence = byId.get(label.id);
      if (!sentence || seen.has(label.id) || !TYPES.includes(label.type)) throw new Error('Invalid sentence classification');
      seen.add(label.id); counts[label.type]++;
      if (!perSample.has(sentence.sample)) perSample.set(sentence.sample, Object.fromEntries(TYPES.slice(0, 4).map(t => [t, 0])));
      if (TYPES.slice(0, 4).includes(label.type)) perSample.get(sentence.sample)[label.type]++;
    }
    const observations = raw.observations.map(item => {
      if (!KINDS.includes(item.kind) || typeof item.label !== 'string' || !item.label.trim() || item.label.length > 72) throw new Error('Each observation needs an allowed kind and a nonempty label of at most 72 characters');
      if (!Array.isArray(item.evidence) || !item.evidence.length || item.evidence.length > 3) throw new Error('Each observation must have 1–3 evidence objects, never four or more. Select the strongest supporting examples');
      const ids = new Set();
      for (const evidence of item.evidence) {
        const sentence = byId.get(evidence.sentenceId);
        if (typeof evidence.quote !== 'string' || !evidence.quote.trim()) throw new Error('Writing observation needs a nonempty evidence excerpt');
        if (words(evidence.quote).length > 12) throw new Error('Evidence excerpts must have at most 12 words. Choose a short, exact 3–8 word span supporting the observation, not a whole sentence');
        if (!sentence || !withoutQuotes(sentence.text).includes(evidence.quote)) throw new Error('Writing observation has invented or quoted evidence. Copy an exact contiguous excerpt from the referenced sentence ID outside quotations');
        ids.add(sentence.id);
      }
      // Store provenance counts, never raw excerpts or original sentences.
      return { kind: item.kind, label: item.label.trim(), support: ids.size, samples: new Set([...ids].map(id => byId.get(id).sample)).size };
    });
    const classified = TYPES.slice(0, 4).reduce((sum, t) => sum + counts[t], 0);
    const dominant = count => {
      const total = Object.values(count).reduce((a, b) => a + b, 0);
      const entry = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
      return total >= 3 && entry[1] / total >= .6 ? entry[0] : null;
    };
    const sampleStyles = [...perSample.values()].map(dominant).filter(Boolean);
    const mixed = new Set(sampleStyles).size > 1;
    const confidence = prepared.stats.totalWords >= 200 && classified >= 12 ? 'supported' : 'limited';
    return normalize({ version: 1, ...prepared.stats, counts, classified, confidence, mixed, dominant: mixed ? null : dominant(Object.fromEntries(TYPES.slice(0, 4).map(t => [t, counts[t]]))), observations });
  }
  function normalize(raw) {
    if (!raw || raw.version !== 1 || JSON.stringify(raw).length > 6000) throw new Error('Invalid sentence patterns');
    const integer = (v, max = 50000) => { if (!Number.isInteger(v) || v < 0 || v > max) throw new Error('Invalid pattern count'); return v; };
    const dist = value => Object.fromEntries(['mean', 'median', 'p10', 'p90', 'sd'].map(key => { const n = value?.[key]; if (!Number.isFinite(n) || n < 0 || n > 50000) throw new Error('Invalid length distribution'); return [key, n]; }));
    const terms = (items, max) => {
      if (!Array.isArray(items) || items.length > max) throw new Error('Invalid recurring terms');
      return items.map(item => { if (typeof item.term !== 'string' || !/^[a-z ]{1,32}$/.test(item.term)) throw new Error('Invalid recurring term'); return { term: item.term, count: integer(item.count) }; });
    };
    const counts = Object.fromEntries(TYPES.map(t => [t, integer(raw.counts?.[t], 80)]));
    const classified = TYPES.slice(0, 4).reduce((s, t) => s + counts[t], 0);
    const sampledSentences = integer(raw.sampledSentences, 80), totalWords = integer(raw.totalWords);
    if (Object.values(counts).reduce((a, b) => a + b, 0) !== sampledSentences || raw.classified !== classified) throw new Error('Inconsistent sentence counts');
    if (!Array.isArray(raw.observations) || raw.observations.length > 10) throw new Error('Invalid observed habits');
    const sampleCount = integer(raw.sampleCount, 5), sentenceCount = integer(raw.sentenceCount);
    if (!sampleCount || sampledSentences > sentenceCount) throw new Error('Inconsistent sample counts');
    const observations = raw.observations.map(o => {
      if (!KINDS.includes(o.kind) || typeof o.label !== 'string' || !o.label.trim() || o.label.length > 72) throw new Error('Invalid observed habit');
      const support = integer(o.support, 3), samples = integer(o.samples, 3);
      if (!support || !samples || samples > support || samples > sampleCount || support > sampledSentences) throw new Error('Invalid observation support');
      return { kind: o.kind, label: o.label.trim(), support, samples };
    });
    const dominant = TYPES.slice(0, 4).find(t => classified >= 3 && counts[t] / classified >= .6) || null;
    return { version: 1, sampleCount, totalWords, sentenceCount, sampledSentences, length: dist(raw.length), paragraphLength: dist(raw.paragraphLength), connectors: terms(raw.connectors, 8), openings: terms(raw.openings, 6), contractions: integer(raw.contractions), counts, classified, confidence: totalWords >= 200 && classified >= 12 ? 'supported' : 'limited', mixed: raw.mixed === true, dominant: raw.mixed ? null : dominant, observations };
  }
  function summary(patterns) {
    if (patterns.confidence === 'limited') return 'Limited sample — conservative sentence matching';
    return patterns.mixed ? 'Mixed sentence habits across samples' : patterns.dominant ? `Mostly ${patterns.dominant} sentences` : 'A varied sentence mix';
  }
  root.BipassSentencePatterns = { TYPES, KINDS, prepare, split, complete, normalize, summary, schema, instructions };
})(typeof window !== 'undefined' ? window : globalThis);
