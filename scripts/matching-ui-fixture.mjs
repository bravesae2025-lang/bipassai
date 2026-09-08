// Local-only visual/interaction fixture. Never used by the production server.
// Uses the real HTML/CSS/client code with an explicitly fake SDK and API.
import express from 'express';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import '../match-result.js';
import '../sentence-patterns.js';
import '../structure-settings.js';
import '../style-profile.js';
const root = resolve(import.meta.dirname, '..');
const app = express();
app.use(express.json());
const source = 'Although the team had collected useful evidence during the morning, the report was difficult to follow because several important points were buried inside long sentences.\n\nThe researchers utilize the available resources to obtain sufficient evidence.';
const changes = [
  { start: 0, end: source.indexOf('\n'), original: source.split('\n')[0], replacement: 'The team had collected useful evidence during the morning. But the report was hard to follow because several important points was buried inside long sentences.', categories: ['structure'] },
  { start: source.indexOf('utilize'), end: source.indexOf('utilize') + 7, original: 'utilize', replacement: 'use', categories: ['word'] },
  { start: source.indexOf('obtain sufficient'), end: source.indexOf('obtain sufficient') + 17, original: 'obtain sufficient', replacement: 'get enough', categories: ['word'] },
];
const cleanText = globalThis.BipassMatchResult.applyChanges(source, changes);
const longSource = 'The students visited the garden because they wanted to learn how food grows, and the volunteers showed them the beds where beans and carrots had been planted. ' + 'They checked the soil, compared the leaves and talked about what each plant needed, while their teacher wrote down the questions that would guide their next visit. '.repeat(5);
const longReplacement = longSource.replace('grows, and the volunteers', 'grows. The volunteers');
const longChanges = [{ start: 0, end: longSource.length, original: longSource, replacement: longReplacement, categories: ['structure'] }];
const analysis = { version: 3, scores: { wordLevel: 5, grammar: 2, tense: 0, punct: 1, caps: 0, spelling: 2 }, evidence: {}, profile: { summary: 'Clear, conversational writing.', tone: { label: 'Conversational', evidence: 'Plain wording.' }, sentenceStyle: { label: 'Mixed lengths', evidence: 'Short and medium sentences.' }, strengths: [], habits: [] } };
const sample = 'We read the report carefully, and we talk about the ideas with our friends after the lesson. '.repeat(15);
const prepared = globalThis.BipassSentencePatterns.prepare([sample]);
analysis.version = 4;
analysis.profile.sentencePatterns = globalThis.BipassSentencePatterns.complete(prepared, { labels: prepared.sentences.map(s => ({ id: s.id, type: 'compound' })), observations: [{ kind: 'vocabulary', label: 'Everyday verbs', evidence: [{ sentenceId: 's0-0', quote: 'read the report' }, { sentenceId: 's0-1', quote: 'talk about the ideas' }] }] });
const profileStore = globalThis.BipassStyleProfile.serializeProfileStore([{ id: 'fixture-profile', name: 'Sample voice', style_summary: globalThis.BipassStyleProfile.serializeSummary([], analysis), style_prompt: 'Match this descriptive profile.' }], 'fixture-profile');
const sdk = `const qaSession={access_token:'local-fixture',user:{id:'local-fixture',email:'preview@example.test',user_metadata:{display_name:'Preview'},app_metadata:{credits:100000,tier:'monthly',signup_welcome_shown:true}}};
window.supabase={createClient:()=>({
 auth:{getSession:async()=>({data:{session:qaSession}}),refreshSession:async()=>({data:{session:qaSession}}),updateUser:async()=>({data:{user:qaSession.user}})},
 from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null}),single:async()=>({data:null,error:null})})})})
})};
localStorage.setItem('bipass_tour_seen','true');
if(['/qa-result','/qa-long'].includes(location.pathname)){sessionStorage.removeItem('bipass_applied_profile');sessionStorage.removeItem('bipass_result_mistakes');sessionStorage.setItem('bipass_applied_structure',JSON.stringify({version:1,level:'medium',mode:'flow',style:'student',requestedMode:'auto'}));}
if(location.pathname==='/qa-profile'){localStorage.setItem('bipass_styles_v1',${JSON.stringify(profileStore)});sessionStorage.setItem('bipass_my_style','true');}
if(location.pathname==='/qa-result'){sessionStorage.setItem('bipass_result',${JSON.stringify(cleanText)});sessionStorage.setItem('bipass_result_html',${JSON.stringify(globalThis.BipassMatchResult.render(source, changes))});sessionStorage.setItem('bipass_mode','level');sessionStorage.setItem('bipass_level','medium');sessionStorage.setItem('bipass_input',${JSON.stringify(source)});sessionStorage.setItem('bipass_structure_mode','flow');sessionStorage.setItem('bipass_change_count','3');sessionStorage.removeItem('bipass_change_filters');sessionStorage.removeItem('bipass_result_id');}
if(location.pathname==='/qa-long'){sessionStorage.setItem('bipass_result',${JSON.stringify(longReplacement)});sessionStorage.setItem('bipass_result_html',${JSON.stringify(globalThis.BipassMatchResult.render(longSource, longChanges))});sessionStorage.setItem('bipass_input',${JSON.stringify(longSource)});sessionStorage.setItem('bipass_mode','level');sessionStorage.setItem('bipass_flow','level');sessionStorage.setItem('bipass_level','medium');sessionStorage.setItem('bipass_structure_mode','flow');sessionStorage.setItem('bipass_change_count','1');sessionStorage.removeItem('bipass_change_filters');sessionStorage.removeItem('bipass_result_id');}`;
app.get('/qa-sdk.js', (_req, res) => res.type('js').send(sdk));
// Same-origin iframe gives the page a real, measurable CSS viewport when the
// browser's window override is unavailable. No CSS scaling or screenshot mocks.
app.get('/qa-frame', (req, res) => {
  const size = req.query.size === 'mobile' ? [390, 844] : req.query.size === 'desktop' ? [1440, 900] : [1366, 768];
  const view = req.query.view === 'custom' ? '/home' : req.query.view === 'profile' ? '/qa-profile' : '/qa-long';
  res.type('html').send(`<!doctype html><title>Responsive matching fixture</title><style>body{margin:0;background:#ddd}iframe{display:block;border:0;width:${size[0]}px;height:${size[1]}px}</style><iframe title="${size[0]} by ${size[1]} matching preview" allow="clipboard-read; clipboard-write" src="${view}"></iframe>`);
});
app.get(['/home', '/app.html', '/editor.html', '/qa-result', '/qa-profile', '/qa-long'], async (req, res) => {
  const file = req.path.includes('editor') || ['/qa-result', '/qa-long'].includes(req.path) ? 'editor.html' : 'app.html';
  const html = (await readFile(resolve(root, file), 'utf8')).replace(/<script src="https:\/\/cdn.jsdelivr.net\/npm\/@supabase[^>]+><\/script>/, '<script src="/qa-sdk.js"></script>');
  res.type('html').send(html);
});
app.get('/qa-checks', (_req, res) => res.type('html').send(`<!doctype html><title>Matching browser assertions</title><h1>Matching browser assertions</h1><ol id="results"></ol><script src="/match-result.js"></script><script>
const check=(name,html,expected)=>{const el=document.createElement('div');el.innerHTML=html;const actual=BipassMatchResult.acceptedText(el);const row=document.createElement('li');row.textContent=(actual===expected?'PASS: ':'FAIL: ')+name+(actual===expected?'':' — '+JSON.stringify(actual));document.querySelector('#results').append(row);};
check('paragraph breaks','One.<br><br>Two.','One.\\n\\nTwo.');
check('editable block breaks','One.<div>Two.</div><div>Three.</div>','One.\\nTwo.\\nThree.');
check('split marks retain all edited text','<span class="word-change-pair structure-change"><span class="structure-tools">Reject group</span><mark class="word-changed"></mark><div><mark class="word-changed">Edited.</mark></div><span class="word-original">Original.</span></span>','Edited.');
check('reject group restores original','<span class="word-change-pair structure-change change-dismissed"><span class="structure-tools">Undo</span><mark class="word-changed">Edited.</mark><span class="word-original">Original.</span></span>','Original.');
check('filter restores original','<span class="word-change-pair change-reverted"><mark class="word-changed">new</mark><span class="word-original">old</span></span>','old');
check('expanded originals excluded','<span class="word-change-pair structure-change original-expanded"><span class="structure-tools">Show original</span><mark class="word-changed">New.</mark><span class="word-original">Old.</span></span>','New.');
</script>`));
app.post('/api/adjust-level', (req, res) => {
  console.log('QA generation request', JSON.stringify({ structureMode: req.body.structureMode, structureStyle: req.body.structureStyle, level: req.body.level, profile: Boolean(req.body.styleProfile) }));
  const appliedStructure = globalThis.BipassStructure.resolve({ ...req.body, profile: req.body.styleProfile });
  res.json({ cleanText: req.body.text, result: req.body.text, changes: [], structureMode: appliedStructure.mode, appliedStructure, profileApplied: Boolean(req.body.styleProfile), creditsUsed: 0, creditsRemaining: 100000 });
});
app.post('/api/push-to-extension', (req, res) => {
  console.log('QA extension payload', JSON.stringify(req.body));
  res.json({ success: true, id: 'fixture-result' });
});
app.post('/api/results', (_req, res) => res.json({ id: 'fixture-result' }));
app.post('/api/refresh-credits', (_req, res) => res.json({ credits: 100000 }));
app.use(express.static(root, { dotfiles: 'deny' }));
const port = Number(process.env.MATCH_QA_PORT || 3012);
app.listen(port, '127.0.0.1', () => console.log(`Matching UI fixture: http://127.0.0.1:${port}/home and /qa-result`));
