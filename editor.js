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

// ─── Elements ─────────────────────────────────────────────────

const editorTextarea = document.getElementById('editor-textarea');
const editorBadge    = document.getElementById('editor-badge');
const editorWc       = document.getElementById('editor-wc');
const copyBtn        = document.getElementById('copy-btn');
const editAiBtn      = document.getElementById('edit-ai-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText    = document.getElementById('loading-text');
const toast          = document.getElementById('toast');

// ─── Init ─────────────────────────────────────────────────────

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser();

  const result = sessionStorage.getItem('bipass_result');
  const mode   = sessionStorage.getItem('bipass_mode');

  if (!result) {
    window.location.href = 'app.html';
    return;
  }

  editorTextarea.value = result;
  editorBadge.textContent = mode === 'generate' ? 'Generated' : 'Humanized';
  updateWc();

  editorTextarea.addEventListener('input', updateWc);
  copyBtn.addEventListener('click', copyText);
  editAiBtn.addEventListener('click', editWithAI);

  saveResult(result, mode, session);
}

async function saveResult(text, mode, session) {
  const level = sessionStorage.getItem('bipass_level') || 'easy';
  await window.bipassAuth.client.from('results').insert({
    user_id: session.user.id,
    text,
    mode: mode || 'humanize',
    level,
  });
}

// ─── Word count ───────────────────────────────────────────────

function countWords(val) {
  return val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
}

function updateWc() {
  const w = countWords(editorTextarea.value);
  editorWc.textContent = `${w} word${w !== 1 ? 's' : ''}`;
}

// ─── Copy ─────────────────────────────────────────────────────

async function copyText() {
  const text = editorTextarea.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  } catch {
    editorTextarea.select();
    document.execCommand('copy');
    showToast('Copied');
  }
}

// ─── Edit with AI ─────────────────────────────────────────────

async function editWithAI() {
  const text = editorTextarea.value.trim();
  if (!text) { showToast('Nothing to edit'); return; }

  const level   = sessionStorage.getItem('bipass_level') || 'easy';
  const grammar = sessionStorage.getItem('bipass_grammar') === 'true';
  const punct   = sessionStorage.getItem('bipass_punct')   === 'true';

  const prompt = buildHumanizePrompt(text, level, grammar, punct);

  setLoading(true);

  try {
    const result = await callAPI(prompt);
    editorTextarea.value = result;
    sessionStorage.setItem('bipass_result', result);
    updateWc();
    showToast('Done');
  } catch (err) {
    showToast(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
}

// ─── Build humanize prompt (mirrors app.js) ───────────────────

const HUMANIZE_PROMPTS = {
  easy: `Rewrite the following text so it sounds like it was written by a beginner or non-native English speaker. Use MANY of these human writing traits — they make beginner writing feel real:

- Short sentences. Sometimes a run-on that goes too long because they don't stop themselves.
- Repeat the same idea twice in slightly different words — like they're thinking while writing.
- Simple, common words only. No fancy vocabulary.
- Say "I think" or "maybe" often — they're not fully confident.
- Use specific simple details instead of abstract ideas.
- Jump between thoughts without a clean connection.
- Uneven pacing — some parts feel rushed, some too slow.
- A little redundant — they say things again without realizing.

Use most of these. Beginner writing is visibly human.
Do NOT make it unreadable — just simple, plain, and rough around the edges.
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

Pick 3–4 of these and let them show up naturally.
Never use: "it's worth noting", "certainly", "in conclusion", "delve", conclusion summaries, or equal sentence energy throughout.
Return only the rewritten text, nothing else.`,

  hard: `Rewrite the following text so it sounds like a confident, capable person wrote it. The humanness should be subtle — texture, not obvious mistakes. Use only 2–3 of these traits, once or twice each:

- Uneven rhythm — most of it flows well, but one part speeds up or lingers slightly.
- One slight contradiction or emotional inconsistency.
- One moment of real uncertainty: "I don't fully know why" or "maybe I'm wrong."
- Strong opinion stated without diplomatic hedging.
- One unexpected specific detail that leaks in naturally.
- One sentence longer and a little messier than the rest.

Only use 2–3 of these. Subtlety is the point.
Absolutely avoid: "it's worth noting", "certainly", "in conclusion", "delve", em dashes more than once, fake-deep transitions, conclusion summaries.
Return only the rewritten text, nothing else.`,
};

function buildHumanizePrompt(text, level, grammar, punct) {
  let prompt = HUMANIZE_PROMPTS[level] || HUMANIZE_PROMPTS.medium;
  const extras = [];
  if (grammar) extras.push('Also include a few subtle grammar mistakes that a real person might make.');
  if (punct)   extras.push('Also use inconsistent punctuation — sometimes miss a comma, use a dash instead of a period, etc.');
  if (extras.length > 0) prompt += '\n\n' + extras.join(' ');
  prompt += `\n\nText to rewrite:\n${text}`;
  return prompt;
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

function setLoading(on) {
  editAiBtn.disabled = on;
  copyBtn.disabled   = on;
  editorTextarea.disabled = on;
  if (on) loadingOverlay.classList.add('visible');
  else    loadingOverlay.classList.remove('visible');
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
