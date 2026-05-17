const LEVEL_DESCRIPTIONS = {
  easy:   'Simple words, short sentences — like a beginner English speaker wrote it',
  medium: 'Average student voice — decent grammar, nothing too fancy',
  hard:   'Confident and fluent — strong vocabulary, varied sentences',
};

const LEVEL_INDEX = { easy: 0, medium: 1, hard: 2 };

const HUMANIZE_PROMPTS = {
  easy: `Rewrite the following text so it sounds like it was written by a beginner or non-native English speaker. Use MANY of these human writing traits — they make beginner writing feel real:

- Short sentences. Sometimes a run-on that goes too long because they don't stop themselves.
- Repeat the same idea twice in slightly different words — like they're thinking while writing.
- Simple, common words only. No fancy vocabulary.
- Say "I think" or "maybe" often — they're not fully confident.
- Use specific simple details instead of abstract ideas: "the test was hard, I didn't sleep" not "academic pressure was intense."
- Jump between thoughts without a clean connection.
- Uneven pacing — some parts feel rushed, some too slow.
- A little redundant — they say things again without realizing.

Use most of these. Beginner writing is visibly human.
Do NOT make it unreadable — just simple, plain, and rough around the edges.
Avoid clean structure, polished transitions, or anything that sounds edited or AI-written.
Never use: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", "in today's world", em dashes more than once, or conclusion summaries.
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
};

// ─── State ────────────────────────────────────────────────────

let selectedLevel = 'easy';

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
const toast          = document.getElementById('toast');
const workspace      = document.getElementById('workspace');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText    = document.getElementById('loading-text');

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

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser();
  restoreState();
  updateStats();
  bindEvents();

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
}

// ─── Level selection ──────────────────────────────────────────

function selectLevel(level) {
  selectedLevel = level;
  pills.forEach(p => p.classList.toggle('active', p.dataset.level === level));
  levelDesc.textContent  = LEVEL_DESCRIPTIONS[level];
  levelLabel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  levelGlider.style.transform = `translateX(${LEVEL_INDEX[level] * 100}%)`;
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
  let prompt = HUMANIZE_PROMPTS[selectedLevel];
  const extras = [];
  if (grammarToggle.checked) extras.push('Also include a few subtle grammar mistakes that a real person might make.');
  if (punctToggle.checked)   extras.push('Also use inconsistent punctuation — sometimes miss a comma, use a dash instead of a period, etc.');
  if (extras.length > 0) prompt += '\n\n' + extras.join(' ');
  prompt += `\n\nText to rewrite:\n${text}`;
  return prompt;
}

function buildGeneratePrompt(userPrompt) {
  let prompt = GENERATE_PROMPTS[selectedLevel];
  const extras = [];
  if (grammarToggle.checked) extras.push('Include a few subtle grammar mistakes that a real person might make.');
  if (punctToggle.checked)   extras.push('Use inconsistent punctuation — sometimes miss a comma, use a dash instead of a period, etc.');
  if (extras.length > 0) prompt += ' ' + extras.join(' ');
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
  sessionStorage.setItem('bipass_level',   selectedLevel);
  sessionStorage.setItem('bipass_mode',    mode);
  sessionStorage.setItem('bipass_prompt',  promptText.value);
  sessionStorage.setItem('bipass_input',   inputText.value);
  sessionStorage.setItem('bipass_grammar', grammarToggle.checked);
  sessionStorage.setItem('bipass_punct',   punctToggle.checked);
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
