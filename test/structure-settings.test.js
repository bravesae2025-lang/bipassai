import test from 'node:test';
import assert from 'node:assert/strict';
import '../structure-settings.js';
const { resolve, customPreference, requestFromResult } = globalThis.BipassStructure;
const storage = value => ({ getItem: key => value[key] ?? null });
test('automatic policies are selected by level and legacy profiles stay locked', () => {
  for (const [level, style] of [['easy', 'beginner'], ['medium', 'student']]) {
    assert.equal(resolve({ level, structureMode: 'auto' }).style, style);
    assert.equal(resolve({ level }).mode, 'keep');
  }
  assert.equal(resolve({ level: 'customize', structureMode: 'auto', profile: {} }).mode, 'keep');
  assert.equal(resolve({ level: 'customize', structureMode: 'auto', profile: { sentencePatterns: { version: 1 } } }).style, 'profile');
});
test('manual styles require Custom flow and cannot leak into automatic selections', () => {
  for (const structureStyle of ['balanced', 'shorter', 'connected']) {
    assert.equal(resolve({ level: 'customize', structureMode: 'flow', structureStyle }).style, structureStyle);
    for (const level of ['easy', 'medium']) assert.throws(() => resolve({ level, structureMode: 'auto', structureStyle }));
    assert.throws(() => resolve({ level: 'customize', structureMode: 'keep', structureStyle }));
    assert.throws(() => resolve({ level: 'customize', structureMode: 'flow', structureStyle, profile: {} }));
  }
  assert.throws(() => resolve({ level: 'customize', structureMode: 'auto' }));
  assert.throws(() => resolve({ level: 'customize', structureMode: 'flow', structureStyle: 'wrong' }));
});
test('Custom migration uses only old manual Custom and stores preferences separately', () => {
  const legacy = { bipass_structure_mode: 'flow', bipass_level: 'customize' };
  assert.equal(customPreference(storage(legacy)).enabled, true);
  for (const override of [{ bipass_my_style: 'true' }, { bipass_applied_profile: '{}' }, { bipass_level: 'medium' }]) assert.equal(customPreference(storage({ ...legacy, ...override })).enabled, false);
  assert.deepEqual(customPreference(storage({ ...legacy, bipass_custom_structure: '{"enabled":false,"style":"connected"}' })), { enabled: false, style: 'connected' });
  assert.deepEqual(customPreference(storage({ bipass_custom_structure: 'broken' })), { enabled: false, style: 'balanced' });
});
test('regeneration uses saved policy, and old result sessions retain explicit mode', () => {
  const policy = resolve({ level: 'customize', structureMode: 'flow', structureStyle: 'shorter' });
  assert.deepEqual(requestFromResult(policy, 'keep', 'customize', null), { structureMode: 'flow', structureStyle: 'shorter' });
  assert.deepEqual(requestFromResult(policy, 'keep', 'medium', null), { structureMode: 'auto' });
  assert.deepEqual(requestFromResult(null, 'flow', 'medium', null), { structureMode: 'flow' });
  assert.deepEqual(requestFromResult(null, null, 'medium', null), { structureMode: 'keep' });
});
