(function initStyleProfile(root) {
  const MAX_SAVED_STYLES = 3;
  const SCORE_KEYS = ['wordLevel', 'grammar', 'tense', 'punct', 'caps', 'spelling'];
  const TRAIT_ALIASES = {
    wordLevel: ['vocabulary', 'word level', 'reading level'],
    grammar:   ['grammar'],
    tense:     ['tense', 'verb'],
    punct:     ['punctuation', 'punct', 'comma', 'period'],
    caps:      ['capital'],
    spelling:  ['spelling', 'typo', 'spell'],
  };

  function cleanText(value, maxLength) {
    return typeof value === 'string'
      ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
      : '';
  }

  function normalizeEvidenceItem(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const label = cleanText(value.label, 72);
    if (!label) return null;
    const evidence = cleanText(value.evidence, 220);
    if (!evidence) return null;
    return { label, evidence };
  }

  function normalizeProfile(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const tone = normalizeEvidenceItem(value.tone);
    const sentenceStyle = normalizeEvidenceItem(value.sentenceStyle);
    const summary = cleanText(value.summary, 220);
    if (!summary || !tone || !sentenceStyle) return null;
    const list = (items) => (Array.isArray(items) ? items : [])
      .map(normalizeEvidenceItem)
      .filter(Boolean)
      .slice(0, 3);
    return {
      summary,
      tone,
      sentenceStyle,
      strengths: list(value.strengths),
      habits: list(value.habits),
    };
  }

  function parseSummary(style) {
    try { return JSON.parse(style?.style_summary || '[]'); } catch (_) { return []; }
  }

  function clampScore(value, fallback = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(0, Math.min(10, Math.round(number)));
  }

  function readTraits(style) {
    const summary = parseSummary(style);
    const raw = Array.isArray(summary) ? summary : summary?.traits;
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

  function readAnalysis(style) {
    const summary = parseSummary(style);
    const raw = style?.style_analysis || (!Array.isArray(summary) ? summary?.analysis : null);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const scores = raw.scores;
    if (!scores || !SCORE_KEYS.every((key) => Number.isFinite(Number(scores[key])))) return null;
    const normalizedScores = {};
    for (const key of SCORE_KEYS) normalizedScores[key] = clampScore(scores[key], key === 'wordLevel' ? 5 : 0);
    const evidence = {};
    for (const key of SCORE_KEYS) evidence[key] = cleanText(raw.evidence?.[key], 240);
    const profile = normalizeProfile(raw.profile);
    return {
      version: profile ? 3 : Number(raw.version) || 2,
      scores: normalizedScores,
      evidence,
      ...(profile ? { profile } : {}),
    };
  }

  function serializeSummary(traits, analysis) {
    const normalizedTraits = Array.isArray(traits) ? traits.map((trait) => ({
      name: cleanText(trait?.name, 80),
      intensity: clampScore(trait?.intensity, 0),
    })) : [];
    const profileAnalysis = analysis && typeof analysis === 'object' ? analysis : null;
    return JSON.stringify({
      version: profileAnalysis?.profile ? 3 : 2,
      traits: normalizedTraits,
      ...(profileAnalysis ? { analysis: profileAnalysis } : {}),
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
    const profile = normalizeProfile(data.analysis.profile);
    if (Number(data.analysis.version) >= 3 && !profile) {
      throw new Error('Incomplete writing profile');
    }
    const analysis = {
      ...data.analysis,
      version: profile ? 3 : 2,
      scores: normalizedScores,
      ...(profile ? { profile } : {}),
    };
    return {
      analysis,
      traits,
      stylePrompt: data.style_prompt.trim(),
    };
  }

  function vocabularyLabel(score) {
    const value = clampScore(score, 5);
    if (value <= 1) return 'Elementary vocabulary';
    if (value <= 3) return 'Beginner vocabulary';
    if (value <= 6) return 'Student vocabulary';
    if (value <= 8) return 'Academic vocabulary';
    return 'Expert vocabulary';
  }

  function resultSnapshot(style) {
    const analysis = readAnalysis(style);
    if (!analysis?.profile) return null;
    return {
      version: 1,
      id: cleanText(style?.id, 80),
      name: cleanText(style?.name, 40) || 'My writing profile',
      level: vocabularyLabel(analysis.scores.wordLevel),
      summary: analysis.profile.summary,
      tone: analysis.profile.tone.label,
      sentenceStyle: analysis.profile.sentenceStyle.label,
      styleProfile: analysis.profile,
    };
  }

  function canCreateStyle(styles) {
    return Array.isArray(styles) && styles.length < MAX_SAVED_STYLES;
  }

  function upsertStyle(styles, style, replaceId = null) {
    const list = Array.isArray(styles) ? [...styles] : [];
    if (!style || typeof style !== 'object' || Array.isArray(style) || !cleanText(style.id, 80)) {
      throw new Error('Writing profile is invalid');
    }
    const replaceIndex = replaceId == null
      ? -1
      : list.findIndex((item) => String(item?.id) === String(replaceId));
    if (replaceIndex >= 0) {
      list.splice(replaceIndex, 1, style);
      return list;
    }
    if (list.length >= MAX_SAVED_STYLES) throw new Error('Writing profile limit reached');
    list.push(style);
    return list;
  }

  function removeStyle(styles, removeId, activeId) {
    const list = (Array.isArray(styles) ? styles : [])
      .filter((style) => String(style?.id) !== String(removeId));
    const activeStillExists = list.some((style) => String(style?.id) === String(activeId));
    const nextActiveId = activeStillExists ? activeId : (list[0]?.id || null);
    return {
      styles: list,
      activeId: nextActiveId,
      activeStyle: list.find((style) => String(style?.id) === String(nextActiveId)) || null,
    };
  }

  root.BipassStyleProfile = Object.freeze({
    MAX_SAVED_STYLES,
    SCORE_KEYS: Object.freeze([...SCORE_KEYS]),
    canCreateStyle,
    fromAnalysisPayload,
    normalizeProfile,
    readAnalysis,
    readTraits,
    removeStyle,
    resultSnapshot,
    serializeSummary,
    sliderValuesFromStyle,
    upsertStyle,
    vocabularyLabel,
  });
})(globalThis);
