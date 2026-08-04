(function attachRevisionIntent(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BipassRevisionIntent = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function makeRevisionIntent() {
  const LEVEL_ALIASES = [
    { key: 'customize', pattern: /\b(custom|my (?:own )?(?:writing )?style)\b/i },
    { key: 'easy', pattern: /\b(beginner|basic|easy|simple)\s+(?:writing\s+)?level\b/i },
    { key: 'medium', pattern: /\b(student|intermediate|medium|average)\s+(?:writing\s+)?level\b/i },
    { key: 'hard', pattern: /\b(academic|advanced|expert|hard|professional)\s+(?:writing\s+)?level\b/i },
  ];

  function requestedLevel(comment, fallback) {
    for (const alias of LEVEL_ALIASES) {
      if (alias.pattern.test(comment)) return alias.key;
    }
    return fallback || 'medium';
  }

  function classifyRevisionIntent(comment, currentLevel) {
    const text = String(comment || '').trim();
    const humanize = /\b(?:re[\s-]*)?humani[sz](?:e|ed|ing|ation)\b|\bsound\s+(?:more\s+)?human\b|\bless\s+(?:robotic|ai[\s-]*(?:like|sounding))\b|\bremove\s+(?:the\s+)?ai[\s-]*(?:tone|sound)\b/i.test(text);
    const namedLevel = LEVEL_ALIASES.some(alias => alias.pattern.test(text));
    const levelMatch = namedLevel
      || /\b(?:re[\s-]*)?level[\s-]+(?:match(?:ing)?|mathing|maching)\b|\bmatch\s+(?:it|this|the\s+(?:result|text))\s+(?:back\s+)?to\s+(?:my|the|a)\s+(?:writing\s+)?level\b/i.test(text);
    const level = requestedLevel(text, currentLevel);

    if (humanize && levelMatch) return { kind: 'both', level };
    if (humanize) return { kind: 'humanize', level: currentLevel || 'medium' };
    if (levelMatch) return { kind: 'level', level };
    return { kind: 'edit', level: currentLevel || 'medium' };
  }

  return { classifyRevisionIntent, requestedLevel };
});
