(function initBipassBilling(root) {
  const LEVEL_CREDITS_PER_WORD = 4;
  const HUMANIZE_CREDITS_PER_WORD = 15;
  // Both mode saves 1 credit/word versus running 15 + 4 separately. This keeps
  // the bundle worthwhile without making the Level Matching pass nearly free.
  const BOTH_CREDITS_PER_WORD = 18;

  const CREDIT_RATES = Object.freeze({
    level: LEVEL_CREDITS_PER_WORD,
    humanize: HUMANIZE_CREDITS_PER_WORD,
    both: BOTH_CREDITS_PER_WORD,
  });

  function billableWordCount(text) {
    const value = typeof text === 'string' ? text.trim() : '';
    return value ? value.split(/\s+/u).length : 0;
  }

  function creditsForWordCount(words, mode) {
    const safeWords = Number.isFinite(words) ? Math.max(0, Math.floor(words)) : 0;
    const rate = CREDIT_RATES[mode];
    if (!rate) throw new Error(`Unknown billing mode: ${mode}`);
    // Round away floating-point residue before rounding a fractional run upward.
    return Math.ceil(Number((safeWords * rate).toFixed(8)));
  }

  function creditsForText(text, mode) {
    return creditsForWordCount(billableWordCount(text), mode);
  }

  root.BipassBilling = Object.freeze({
    CREDIT_RATES,
    billableWordCount,
    creditsForText,
    creditsForWordCount,
  });
})(globalThis);
