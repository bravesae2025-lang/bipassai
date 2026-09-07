// Only common words are typo candidates; unfamiliar/technical terms are left
// alone. The model selects contextual positions from these exact source edits.
const typos = Object.fromEntries((
  'about:abuot after:afetr again:agian always:alwyas because:becuase before:befor better:bettr books:bokos brought:bruoght change:chnage ' +
  'children:childern classroom:clasroom collected:colected complete:compelete continue:contiune danger:dagner deciding:decidng described:desribed ' +
  'different:differnt difficult:dificult during:duirng enough:enogh everyone:everyoen evidence:evidnce families:familes feedback:feedbak ' +
  'first:frist followed:folowed forgot:fogrot friend:freind garden:gardne getting:geting gives:gievs group:gruop having:havng helps:hleps ' +
  'holidays:holidyas important:importnat information:informaiton introduced:intorduced language:langauge later:laetr learned:leraned ' +
  'lessons:lesons library:libary little:litle longer:logner lunch:luch materials:materails missing:mising morning:mornign needed:neded ' +
  'neighbours:neigbours noticed:notcied office:ofice outside:outisde parents:parnets people:poeple planned:plannned powerful:powerfull ' +
  'problem:probelm project:projet quickly:quikly reading:raeding regular:regualr report:reprot reported:reproted results:resutls ' +
  'returned:returnd safety:saefty scheme:scheem school:scool second:seocnd several:severel students:studnets study:stduy ' +
  'surfers:surfres teacher:teahcer teachers:teahcers their:thier these:thsee things:thigns thought:thoguht ticket:tikcet ' +
  'tickets:tikcets together:togther understand:understnad useful:usefull visit:visiit volunteers:volunters walked:wakled ' +
  'wanted:wanetd watched:wathed weather:waether week:weelk whether:whehter which:whcih words:wrods worked:wroked writer:wrtier'
).trim().split(/\s+/).map(pair => pair.split(':')));
const knownTypos = new Set(Object.entries(typos).filter(([a, b]) => a !== b).map(([, b]) => b));
const agreement = { is: 'are', are: 'is', am: 'is', was: 'were', were: 'was', has: 'have', have: 'has', a: 'an', an: 'a' };
const occurrenceAt = (text, value, start) => {
  let occurrence = 0, index = -1;
  do { index = text.indexOf(value, index + 1); occurrence++; } while (index >= 0 && index < start);
  return occurrence;
};
const keepCase = (original, replacement) => original === original.toUpperCase()
  ? replacement.toUpperCase() : /^[A-Z]/.test(original) ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;

export function presetEditPalette(text, protectedSpans) {
  const candidates = [], existing = [];
  const tokens = [...text.matchAll(/\b[A-Za-z]+(?:['’][A-Za-z]+)?\b/g)];
  for (const token of tokens) {
    const original = token[0], start = token.index, end = start + original.length, lower = original.toLowerCase();
    if (protectedSpans.some(p => start < p.end && end > p.start)) continue;
    if (knownTypos.has(lower)) existing.push({ text: original, occurrence: occurrenceAt(text, original, start), category: 'spelling' });
    const add = (replacement, category) => {
      if (replacement === original) return;
      candidates.push({ id: candidates.length, start, end, original, replacement, occurrence: occurrenceAt(text, original, start), category });
    };
    // Capitalized unknown words may be names. Known sentence-initial common
    // words retain their case in spelling/grammar edits.
    if (typos[lower]) add(keepCase(original, typos[lower]), 'spelling');
    if (agreement[lower]) add(keepCase(original, agreement[lower]), 'grammar');
    // Missing internal commas never remove a sentence-ending mark.
    if (text[end] === ',' && !protectedSpans.some(p => start < p.end && end + 1 > p.start)) {
      candidates.push({ id: candidates.length, start, end: end + 1, original: original + ',', replacement: original, occurrence: occurrenceAt(text, original + ',', start), category: 'punct' });
    }
  }
  return { candidates, existing };
}

export function selectedPresetEdits(data, candidates) {
  if (!Array.isArray(data.editIds) || data.editIds.some(id => !Number.isInteger(id) || !candidates[id]) || new Set(data.editIds).size !== data.editIds.length) throw new Error('Choose distinct valid editIds from the supplied candidates');
  return data.editIds.map(id => candidates[id]);
}
