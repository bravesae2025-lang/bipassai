(function initStructureSettings(root) {
  const STYLES = ['balanced', 'shorter', 'connected'];
  const LABELS = { keep: 'Structure kept', beginner: 'Beginner sentences', student: 'Student sentences', balanced: 'Balanced flow', shorter: 'Shorter sentences', connected: 'More connected', profile: 'Your sentence style' };
  function normalizeMode(value) {
    if (value === undefined) return 'keep';
    if (!['auto', 'keep', 'flow'].includes(value)) throw new Error('Choose a valid sentence structure setting.');
    return value;
  }
  function resolve({ level, structureMode, structureStyle, profile }) {
    const requested = normalizeMode(structureMode);
    const manual = level === 'customize' && !profile;
    if (structureStyle !== undefined && (!STYLES.includes(structureStyle) || !manual || requested !== 'flow')) throw new Error('Sentence style is only available when Custom structure is enabled.');
    if (requested === 'auto' && manual) throw new Error('Choose whether to change Custom sentence structure.');
    let mode = requested === 'keep' ? 'keep' : 'flow';
    let style = 'keep';
    if (mode === 'flow') {
      if (profile && level === 'customize') {
        if (profile.sentencePatterns?.version === 1) style = 'profile';
        else if (requested === 'auto') mode = 'keep';
        else style = 'balanced'; // Existing explicit flow sessions remain usable.
      } else style = manual ? structureStyle || 'balanced' : level === 'easy' ? 'beginner' : 'student';
    }
    return { version: 1, level, mode, style, requestedMode: requested, ...(manual && mode === 'flow' ? { requestedStyle: style } : {}) };
  }
  function customPreference(storage) {
    const stored = storage.getItem('bipass_custom_structure');
    if (stored !== null) {
      try { const value = JSON.parse(stored); return { enabled: value.enabled === true, style: STYLES.includes(value.style) ? value.style : 'balanced' }; } catch (_) {}
      return { enabled: false, style: 'balanced' };
    }
    const manual = storage.getItem('bipass_level') === 'customize' && storage.getItem('bipass_my_style') !== 'true' && !storage.getItem('bipass_applied_profile');
    return { enabled: manual && storage.getItem('bipass_structure_mode') === 'flow', style: 'balanced' };
  }
  function requestFromResult(policy, legacyMode, level, profile) {
    if (policy?.version === 1 && policy.level === level) {
      const request = { structureMode: policy.requestedMode, ...(policy.requestedStyle ? { structureStyle: policy.requestedStyle } : {}) };
      resolve({ ...request, level, profile });
      return request;
    }
    if (policy?.version === 1 && level !== 'customize') return { structureMode: 'auto' };
    return { structureMode: legacyMode === 'flow' ? 'flow' : 'keep' };
  }
  root.BipassStructure = { STYLES, LABELS, normalizeMode, resolve, customPreference, requestFromResult };
})(typeof window !== 'undefined' ? window : globalThis);
