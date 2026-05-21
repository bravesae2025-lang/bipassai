const LEVEL_DESCRIPTIONS = {
  easy:      'Simple words, mixed sentences, tense mistakes — like a beginner non-native speaker wrote it',
  medium:    'Average student voice — decent grammar, nothing too fancy',
  hard:      'Confident and fluent — strong vocabulary, varied sentences',
  customize: 'Pick exactly which human traits to add — build your own level',
};

const LEVEL_INDEX = { easy: 0, medium: 1, hard: 2, customize: 3 };

const HUMANIZE_PROMPTS = {
  easy: `Rewrite the following text so it sounds like it was written by a beginner or non-native English speaker. Use MANY of these human writing traits:

- Mix short choppy sentences with long comma-run-on sentences that keep going without a period, just adding comma after comma because the writer does not know when to stop, it feels very natural for a beginner.
- Make tense mistakes: use the wrong verb tense sometimes ("yesterday I go to the store" instead of "went", "she tell me" instead of "told", "I seen it" instead of "saw").
- Repeat the same idea twice in slightly different words, like they are thinking while writing.
- Simple, common words only. No fancy vocabulary.
- Say "I think" or "maybe" often, they are not fully confident.
- Use specific simple details: "the test was hard, I didn't sleep" not "academic pressure was intense."
- Jump between thoughts without a clean connection.
- A little redundant, say things again without realizing.

Use most of these. Beginner writing is visibly human.
Do NOT make it unreadable, just simple, plain, and rough around the edges.
Do NOT use hyphens (-) or em dashes anywhere in the text, not even in compound words or lists.
Never use: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", "in today's world", or conclusion summaries.
Return only the rewritten text, nothing else.`,

  medium: `Rewrite the following text so it sounds like an average student wrote it. Use SOME of these human writing traits — not all, just what fits naturally:

- Mixed sentence lengths — some short, some weirdly long, nothing feels planned.
- Reuse the same word or phrase a couple times without noticing.
- Mild confident opinions stated casually: "it was kind of a bad idea honestly."
- Slight logic jumps — thoughts don't always connect perfectly to the one before.
- Casual filler: "basically", "kind of", "I guess", "to be fair."
- Real uncertainty once or twice: "I'm not totally sure but", "this might be wrong."
- One specific concrete detail that makes it feel lived-in, not generic.
- Grammar mostly right but not careful — a comma missing here or there.

Pick 3–4 of these and let them show up naturally. Don't force all of them.
Never use: "it's worth noting", "certainly", "in conclusion", "delve", perfectly balanced opinions, fake-deep transitions, conclusion summaries, or equal sentence energy throughout.
Return only the rewritten text, nothing else.`,

  hard: `Rewrite the following text so it sounds like a confident, capable person wrote it. The humanness should be subtle — texture, not obvious mistakes. Use only 2–3 of these traits, once or twice each:

- Uneven rhythm — most of it flows well, but one part speeds up or lingers slightly longer than it should.
- One slight contradiction or emotional inconsistency: "it worked fine. Though honestly it kind of annoyed me."
- One moment of real uncertainty: "I don't fully know why" or "maybe I'm wrong about this."
- Strong opinion stated without diplomatic hedging — pick a side and sound sure of it.
- One unexpected specific detail that leaks in naturally.
- One sentence that's longer and a little messier than the rest.

Only use 2–3 of these. A skilled writer's humanness is subtle, not loud.
Absolutely avoid: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", em dashes more than once, perfect paragraph symmetry, fake-deep transitions like "at the end of the day", conclusion summaries after every point.
Return only the rewritten text, nothing else.`,

  customize: `Rewrite the following text to sound naturally human-written. Apply only the specific human traits listed below — do not add any other changes beyond what is listed.
Return only the rewritten text, nothing else.`,
};

const GENERATE_PROMPTS = {
  easy: `Write the following in simple, plain English — like a beginner or non-native English speaker wrote it. Use MANY of these human writing traits:

- Short sentences. Sometimes a run-on that goes a bit long because they don't stop themselves.
- Repeat the same idea twice in slightly different words — like thinking while writing.
- Simple, common words only. No fancy vocabulary.
- Say "I think" or "maybe" often — not fully confident.
- Use specific simple details instead of abstract ideas.
- Jump between thoughts without clean connections.
- Uneven pacing — some parts rushed, some slow.
- A little redundant — saying things again without realizing.

Use most of these. Beginner writing is visibly human.
Do NOT make it unreadable — just simple, plain, and rough around the edges.
Never use: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", "in today's world", or conclusion summaries.
Return only the written text, nothing else.`,

  medium: `Write the following the way an average student would. Use SOME of these human writing traits — not all, just what fits naturally:

- Mixed sentence lengths — nothing feels planned.
- Reuse the same word or phrase a couple times without noticing.
- Mild opinions stated casually: "honestly it was kind of pointless."
- Slight logic jumps — thoughts don't always connect perfectly.
- Casual filler: "basically", "kind of", "I guess", "to be fair."
- Real uncertainty once or twice: "I'm not totally sure but", "this might be wrong."
- One specific concrete detail that makes it feel lived-in.
- Grammar mostly right but not careful.

Pick 3–4 and let them show up naturally.
Never use: "it's worth noting", "certainly", "in conclusion", "delve", conclusion summaries, or equal sentence energy throughout.
Return only the written text, nothing else.`,

  hard: `Write the following the way a confident, capable person would — like they wrote it quickly and didn't over-edit. The humanness should be subtle. Use only 2–3 of these traits, once or twice each:

- Uneven rhythm — mostly flows, but one part speeds up or lingers a bit.
- One slight contradiction: "it worked. Though honestly it kind of annoyed me."
- One moment of real uncertainty: "I don't fully know why" or "maybe I'm wrong."
- Strong opinion without diplomatic hedging — pick a side and sound sure.
- One unexpected specific detail that leaks in naturally.
- One sentence longer and a little messier than the rest.

Only 2–3 traits. Subtlety is the point.
Absolutely avoid: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", em dashes more than once, fake-deep transitions, conclusion summaries.
Return only the written text, nothing else.`,

  customize: `Write the following to sound naturally human-written. Apply only the specific human traits listed below — do not add any other changes beyond what is listed.
Return only the written text, nothing else.`,
};

// ─── State ────────────────────────────────────────────────────

let selectedLevel  = 'easy';
let myStyleActive  = false;
let savedStyle     = null; // { style_summary, style_prompt }

// ─── Elements ─────────────────────────────────────────────────

const promptText     = document.getElementById('prompt-text');
const inputText      = document.getElementById('input-text');
const promptWc       = document.getElementById('prompt-wc');
const humanizeWc     = document.getElementById('humanize-wc');
const generateBtn    = document.getElementById('generate-btn');
const generateLabel  = document.getElementById('generate-label');
const generateLoader = document.getElementById('generate-loader');
const humanizeBtn    = document.getElementById('humanize-btn');
const humanizeLabel  = document.getElementById('humanize-label');
const humanizeLoader = document.getElementById('humanize-loader');
const charCount      = document.getElementById('char-count');
const wordCount      = document.getElementById('word-count');
const levelDesc      = document.getElementById('level-desc');
const levelLabel     = document.getElementById('level-label');
const levelGlider    = document.getElementById('level-glider');
const statusLabel    = document.getElementById('status-label');
const pills          = document.querySelectorAll('.level-btn');
const grammarToggle  = document.getElementById('grammar-toggle');
const punctToggle    = document.getElementById('punct-toggle');
const tenseToggle    = document.getElementById('tense-toggle');
const optionsPanel   = document.getElementById('options-panel');
const toast          = document.getElementById('toast');
const workspace      = document.getElementById('workspace');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText    = document.getElementById('loading-text');
const levelTrack     = document.querySelector('.level-track');
const sampleContainer  = document.getElementById('sample-container');
const addSampleBtn     = document.getElementById('add-sample-btn');
const analyzeStyleBtn  = document.getElementById('analyze-style-btn');
const analyzeLabel     = document.getElementById('analyze-label');
const analyzeLoader    = document.getElementById('analyze-loader');
const myStyleInputs    = document.getElementById('my-style-inputs');
const myStyleCard      = document.getElementById('my-style-card');
const myStyleSummary   = document.getElementById('my-style-summary');
const useMyStyleBtn    = document.getElementById('use-my-style-btn');
const reanalyzeLink    = document.getElementById('reanalyze-link');

// ─── Nav user ─────────────────────────────────────────────────

async function setupNavUser() {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;
  const session = await window.bipassAuth.getSession();
  if (session) {
    navUser.innerHTML = `<span class="nav-user-email">${session.user.email}</span><button class="nav-signout" id="nav-signout-btn">Sign out</button>`;
    document.getElementById('nav-signout-btn').addEventListener('click', () => window.bipassAuth.signOut());
  } else {
    navUser.innerHTML = `<a class="nav-link" href="login.html">Sign in</a>`;
  }
}

// ─── Init ─────────────────────────────────────────────────────

function setupDrawer(session) {
  const hamburger  = document.getElementById('nav-hamburger');
  const overlay    = document.getElementById('drawer-overlay');
  const drawer     = document.getElementById('drawer');
  const closeBtn   = document.getElementById('drawer-close');
  const drawerUser = document.getElementById('drawer-user');
  const signoutBtn = document.getElementById('drawer-signout-btn');

  const email = session ? session.user.email : '';
  let displayName = session ? (session.user.user_metadata?.display_name || '') : '';
  const tier = session ? (session.user.user_metadata?.tier || 'free') : 'free';
  const tierLabel = { free: 'Free', pro: 'Pro', premium: 'Premium' }[tier] || 'Free';
  const initials = () => (displayName || email || '?')[0].toUpperCase();

  function renderProfile() {
    drawerUser.innerHTML = `
      <div class="drawer-profile-row">
        <div class="drawer-avatar" id="drawer-avatar">${initials()}</div>
        <div class="drawer-profile">
          <div class="drawer-username-row">
            <span class="drawer-username" id="drawer-username">${displayName || 'Set a username'}</span>
            <button class="drawer-username-edit-btn" id="drawer-username-edit-btn" aria-label="Edit username">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
          <span class="drawer-user-email">${email}</span>
          <a class="drawer-tier-badge drawer-tier-${tier}" href="plans.html">${tierLabel}</a>
        </div>
      </div>
    `;
    document.getElementById('drawer-username-edit-btn').addEventListener('click', startEdit);
  }

  function startEdit() {
    const current = displayName;
    document.getElementById('drawer-username-edit-btn').style.display = 'none';
    document.getElementById('drawer-username').outerHTML = `<input class="drawer-username-input" id="drawer-username-input" type="text" value="${current}" placeholder="Enter username" maxlength="30" />`;
    const input = document.getElementById('drawer-username-input');
    input.focus();
    input.select();

    let done = false;
    async function save() {
      if (done) return;
      done = true;
      const newName = input.value.trim();
      if (newName && newName !== current) {
        try {
          await window.bipassAuth.client.auth.updateUser({ data: { display_name: newName } });
          displayName = newName;
        } catch {}
      }
      renderProfile();
    }
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') { done = true; renderProfile(); }
    });
    input.addEventListener('blur', save);
  }

  renderProfile();

  function openDrawer()  { drawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('drawer-lock'); }
  function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('drawer-lock'); }

  hamburger.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  if (signoutBtn) signoutBtn.addEventListener('click', () => window.bipassAuth.signOut());
}

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser();
  setupDrawer(session);
  restoreState();
  updateStats();
  bindEvents();
  loadSavedStyle(session);

  const autostart = sessionStorage.getItem('bipass_autostart');
  if (autostart) {
    sessionStorage.removeItem('bipass_autostart');
    setTimeout(() => {
      if (autostart === 'humanize') humanize();
      else if (autostart === 'generate') generateNew();
    }, 50);
  }
}

// ─── Restore state from sessionStorage (after regenerate) ─────

function restoreState() {
  const level = sessionStorage.getItem('bipass_level') || 'easy';
  selectLevel(level);

  const savedPrompt = sessionStorage.getItem('bipass_prompt');
  const savedInput  = sessionStorage.getItem('bipass_input');
  if (savedPrompt) promptText.value = savedPrompt;
  if (savedInput)  inputText.value  = savedInput;

  if (sessionStorage.getItem('bipass_grammar') === 'true') grammarToggle.checked = true;
  if (sessionStorage.getItem('bipass_punct') === 'true')   punctToggle.checked   = true;
  if (sessionStorage.getItem('bipass_tense') === 'true')   tenseToggle.checked   = true;
  if (sessionStorage.getItem('bipass_my_style') === 'true') myStyleActive = true;
}

// ─── Events ───────────────────────────────────────────────────

function bindEvents() {
  inputText.addEventListener('input', updateStats);
  promptText.addEventListener('input', () => {
    const w = countWords(promptText.value);
    promptWc.textContent = `${w} word${w !== 1 ? 's' : ''}`;
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => selectLevel(pill.dataset.level));
  });

  generateBtn.addEventListener('click', generateNew);
  humanizeBtn.addEventListener('click', humanize);

  // My Style events
  let sampleCount = 1;
  addSampleBtn.addEventListener('click', () => {
    if (sampleCount >= 5) return;
    sampleCount++;
    const ta = document.createElement('textarea');
    ta.className = 'style-sample-textarea';
    ta.id = `style-sample-${sampleCount}`;
    ta.placeholder = `Paste sample ${sampleCount}…`;
    ta.rows = 4;
    sampleContainer.appendChild(ta);
    if (sampleCount >= 5) addSampleBtn.style.display = 'none';
  });

  analyzeStyleBtn.addEventListener('click', analyzeStyle);
  useMyStyleBtn.addEventListener('click', () => {
    if (myStyleActive) deactivateMyStyle();
    else activateMyStyle();
  });
  reanalyzeLink.addEventListener('click', () => {
    myStyleCard.style.display = 'none';
    myStyleInputs.style.display = '';
  });
}

// ─── Level selection ──────────────────────────────────────────

function selectLevel(level) {
  deactivateMyStyle();
  selectedLevel = level;
  pills.forEach(p => p.classList.toggle('active', p.dataset.level === level));
  levelDesc.textContent  = LEVEL_DESCRIPTIONS[level];
  levelLabel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  levelGlider.style.transform = `translateX(${LEVEL_INDEX[level] * 100}%)`;
  optionsPanel.style.display = level === 'customize' ? '' : 'none';
}

// ─── My Style ─────────────────────────────────────────────────

function activateMyStyle() {
  if (!savedStyle) return;
  myStyleActive = true;
  useMyStyleBtn.classList.add('active');
  levelTrack.classList.add('dimmed');
  sessionStorage.setItem('bipass_my_style', 'true');
}

function deactivateMyStyle() {
  myStyleActive = false;
  if (useMyStyleBtn) useMyStyleBtn.classList.remove('active');
  if (levelTrack) levelTrack.classList.remove('dimmed');
  sessionStorage.setItem('bipass_my_style', 'false');
}

function showMyStyleCard() {
  myStyleInputs.style.display = 'none';
  myStyleSummary.textContent  = savedStyle.style_summary;
  myStyleCard.style.display   = '';
  if (myStyleActive) useMyStyleBtn.classList.add('active');
}

async function loadSavedStyle(session) {
  try {
    const { data } = await window.bipassAuth.client
      .from('user_styles')
      .select('style_summary, style_prompt')
      .eq('user_id', session.user.id)
      .single();
    if (data) {
      savedStyle = data;
      showMyStyleCard();
      if (myStyleActive) activateMyStyle();
    }
  } catch (_) {}
}

async function analyzeStyle() {
  const samples = Array.from(document.querySelectorAll('.style-sample-textarea'))
    .map(t => t.value.trim())
    .filter(v => v.length > 0);

  if (samples.length === 0) { showToast('Paste at least one writing sample'); return; }

  analyzeLabel.style.display  = 'none';
  analyzeLoader.style.display = '';
  analyzeStyleBtn.disabled    = true;

  const prompt = `Analyze the writing style of these text samples and return ONLY valid JSON with no markdown, no code fences, nothing else.

Return exactly this format: {"summary":"one sentence describing the writing style","style_prompt":"a detailed paragraph instruction for an AI to rewrite or generate text that matches this person's style exactly — include vocabulary level, sentence length patterns, grammatical quirks, punctuation habits, and any consistent errors"}

${samples.map((s, i) => `Sample ${i + 1}:\n${s}`).join('\n---\n')}`;

  try {
    const raw  = await callAPI(prompt);
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
    if (!json.summary || !json.style_prompt) throw new Error('Invalid response');

    savedStyle = { style_summary: json.summary, style_prompt: json.style_prompt };

    const session = await window.bipassAuth.getSession();
    await window.bipassAuth.client.from('user_styles').upsert({
      user_id:       session.user.id,
      style_summary: json.summary,
      style_prompt:  json.style_prompt,
      sample_count:  samples.length,
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'user_id' });

    showMyStyleCard();
    showToast('Style saved');
  } catch (e) {
    showToast('Could not analyze style — try again');
  } finally {
    analyzeLabel.style.display  = '';
    analyzeLoader.style.display = 'none';
    analyzeStyleBtn.disabled    = false;
  }
}

// ─── Stats ────────────────────────────────────────────────────

function countWords(val) {
  return val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
}

function updateStats() {
  const val   = inputText.value;
  const words = countWords(val);
  charCount.textContent  = val.length.toLocaleString();
  wordCount.textContent  = words.toLocaleString();
  humanizeWc.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

// ─── Build prompts ────────────────────────────────────────────

function buildHumanizePrompt(text) {
  if (myStyleActive && savedStyle) {
    return `${savedStyle.style_prompt}\n\nText to rewrite:\n${text}`;
  }
  let prompt = HUMANIZE_PROMPTS[selectedLevel];
  if (selectedLevel === 'customize') {
    const extras = [];
    if (grammarToggle.checked) extras.push('Include subtle grammar errors a real person makes — subject-verb disagreement, missing articles, run-ons.');
    if (punctToggle.checked)   extras.push('Use inconsistent punctuation — miss commas, overuse commas instead of periods.');
    if (tenseToggle.checked)   extras.push('Make occasional verb tense mistakes — wrong tense for past or present events, like a non-native speaker ("she tell me", "yesterday I go").');
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
  }
  prompt += `\n\nText to rewrite:\n${text}`;
  return prompt;
}

function buildGeneratePrompt(userPrompt) {
  if (myStyleActive && savedStyle) {
    return `${savedStyle.style_prompt}\n\nWhat to write:\n${userPrompt}`;
  }
  let prompt = GENERATE_PROMPTS[selectedLevel];
  if (selectedLevel === 'customize') {
    const extras = [];
    if (grammarToggle.checked) extras.push('Include subtle grammar errors a real person makes — subject-verb disagreement, missing articles, run-ons.');
    if (punctToggle.checked)   extras.push('Use inconsistent punctuation — miss commas, overuse commas instead of periods.');
    if (tenseToggle.checked)   extras.push('Make occasional verb tense mistakes — wrong tense for past or present events, like a non-native speaker ("she tell me", "yesterday I go").');
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
  }
  prompt += `\n\nWhat to write:\n${userPrompt}`;
  return prompt;
}

// ─── Generate ─────────────────────────────────────────────────

async function generateNew() {
  const prompt = promptText.value.trim();
  if (!prompt) { showToast('Enter a prompt first'); promptText.focus(); return; }

  saveState('generate');
  setLoading(true, 'Generating your text…');

  try {
    const result = await callAPI(buildGeneratePrompt(prompt));
    sessionStorage.setItem('bipass_result', result);
    sessionStorage.setItem('bipass_mode', 'generate');
    window.location.href = 'editor.html';
  } catch (err) {
    setLoading(false);
    showToast(err.message || 'Something went wrong');
    setStatus('Error');
  }
}

// ─── Humanize ─────────────────────────────────────────────────

async function humanize() {
  const text = inputText.value.trim();
  if (!text) { showToast('Paste some text first'); inputText.focus(); return; }

  saveState('humanize');
  setLoading(true, 'Humanizing your text…');

  try {
    const result = await callAPI(buildHumanizePrompt(text));
    sessionStorage.setItem('bipass_result', result);
    sessionStorage.setItem('bipass_mode', 'humanize');
    window.location.href = 'editor.html';
  } catch (err) {
    setLoading(false);
    showToast(err.message || 'Something went wrong');
    setStatus('Error');
  }
}

// ─── Save state for regenerate ────────────────────────────────

function saveState(mode) {
  sessionStorage.setItem('bipass_level',    selectedLevel);
  sessionStorage.setItem('bipass_mode',     mode);
  sessionStorage.setItem('bipass_prompt',   promptText.value);
  sessionStorage.setItem('bipass_input',    inputText.value);
  sessionStorage.setItem('bipass_grammar',  grammarToggle.checked);
  sessionStorage.setItem('bipass_punct',    punctToggle.checked);
  sessionStorage.setItem('bipass_tense',    tenseToggle.checked);
  sessionStorage.setItem('bipass_my_style', myStyleActive);
}

// ─── API call ─────────────────────────────────────────────────

async function callAPI(prompt) {
  const res = await fetch('/api/humanize', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  if (!data?.result) throw new Error('No output from server');
  return data.result;
}

// ─── Loading overlay ──────────────────────────────────────────

function setLoading(on, text) {
  generateBtn.disabled = on;
  humanizeBtn.disabled = on;

  if (on) {
    loadingText.textContent = text || 'Loading…';
    workspace.style.opacity = '0';
    workspace.style.pointerEvents = 'none';
    loadingOverlay.classList.add('visible');
    setStatus(text || 'Loading…');
  } else {
    workspace.style.opacity = '';
    workspace.style.pointerEvents = '';
    loadingOverlay.classList.remove('visible');
    setStatus('Ready');
  }
}

// ─── Status ───────────────────────────────────────────────────

function setStatus(text) {
  if (statusLabel) statusLabel.textContent = text;
}

// ─── Toast ────────────────────────────────────────────────────

let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 200);
  }, 2200);
}

// ─── Navbar hide on scroll ────────────────────────────────────

(function () {
  const navbar = document.querySelector('.navbar');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY, diff = y - lastY;
    if (diff > 6 && y > 80) navbar.classList.add('hidden');
    else if (diff < -6) navbar.classList.remove('hidden');
    lastY = y;
  }, { passive: true });
})();

// ─── Start ────────────────────────────────────────────────────

init();
