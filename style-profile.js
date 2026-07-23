(function initStyleProfile(root) {
  const SCORE_KEYS = ['wordLevel', 'grammar', 'tense', 'punct', 'caps', 'spelling'];
  const TRAIT_ALIASES = {
    wordLevel: ['vocabulary', 'word level', 'reading level'],
    grammar:   ['grammar'],
    tense:     ['tense', 'verb'],
    punct:     ['punctuation', 'punct', 'comma', 'period'],
    caps:      ['capital'],
    spelling:  ['spelling', 'typo', 'spell'],
  };

  function clampScore(value, fallback = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(0, Math.min(10, Math.round(number)));
  }

  function readTraits(style) {
    let raw = [];
    try { raw = JSON.parse(style?.style_summary || '[]'); } catch (_) {}
    if (!Array.isArray(raw)) return [];
    return raw.map((trait) => {
      if (typeof trait === 'string') return { name: trait, intensity: 10 };
      return {
        name: String(trait?.name || ''),
        // All current and unversioned stored scores are treated literally on
        // the 0–10 scale. Multiplying 1/2 here caused the original regression.
        intensity: clampScore(trait?.intensity, 0),
      };
    });
  }

  function sliderValuesFromStyle(style) {
    const traits = readTraits(style);
    const values = { wordLevel: 5, grammar: 0, tense: 0, punct: 0, caps: 0, spelling: 0 };
    for (const key of SCORE_KEYS) {
      const trait = traits.find((candidate) => {
        const name = candidate.name.toLowerCase();
        return TRAIT_ALIASES[key].some((alias) => name.includes(alias));
      });
      if (trait) values[key] = clampScore(trait.intensity, values[key]);
    }
    return values;
  }

  function fromAnalysisPayload(data) {
    const scores = data?.analysis?.scores;
    if (!scores || !SCORE_KEYS.every((key) => Number.isFinite(Number(scores[key])))) {
      throw new Error('Incomplete style analysis');
    }
    if (!Array.isArray(data.traits) || typeof data.style_prompt !== 'string' || !data.style_prompt.trim()) {
      throw new Error('Invalid style analysis');
    }
    const normalizedScores = {};
    for (const key of SCORE_KEYS) normalizedScores[key] = clampScore(scores[key], key === 'wordLevel' ? 5 : 0);
    const traits = data.traits.map((trait) => ({
      name: String(trait?.name || ''),
      intensity: clampScore(trait?.intensity, 0),
    }));
    return {
      analysis: { ...data.analysis, version: 2, scores: normalizedScores },
      traits,
      stylePrompt: data.style_prompt.trim(),
    };
  }

  root.BipassStyleProfile = Object.freeze({
    SCORE_KEYS: Object.freeze([...SCORE_KEYS]),
    fromAnalysisPayload,
    readTraits,
    sliderValuesFromStyle,
  });
})(globalThis);
