const LEVEL_DESCRIPTIONS = {
  easy:      'Beginner — simple words, mixed sentences, tense mistakes like a non-native speaker',
  medium:    'Student — average voice, decent grammar, nothing too fancy',
  hard:      'Expert — confident and fluent, strong vocabulary, varied sentences',
  customize: 'Custom — pick exactly which human traits to add',
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
  easy: `Read the task or topic below and write a complete, original piece that fulfils it — a story, essay, or whatever is asked. Write it as a beginner or non-native English speaker would. Use MANY of these human writing traits:

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

  medium: `Read the task or topic below and write a complete, original piece that fulfils it. Write it the way an average student would — thoughtful but not polished. Use SOME of these human writing traits — not all, just what fits naturally:

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

  hard: `Read the task or topic below and write a complete, original piece that fulfils it. Write it the way a confident, capable person would — like they drafted it and didn't over-edit. The humanness should be subtle. Use only 2–3 of these traits, once or twice each:

- Uneven rhythm — mostly flows, but one part speeds up or lingers a bit.
- One slight contradiction: "it worked. Though honestly it kind of annoyed me."
- One moment of real uncertainty: "I don't fully know why" or "maybe I'm wrong."
- Strong opinion without diplomatic hedging — pick a side and sound sure.
- One unexpected specific detail that leaks in naturally.
- One sentence longer and a little messier than the rest.

Only 2–3 traits. Subtlety is the point.
Absolutely avoid: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", em dashes more than once, fake-deep transitions, conclusion summaries.
Return only the written text, nothing else.`,

  customize: `Read the task or topic below and write a complete, original piece that fulfils it. Make it sound naturally human-written. Apply only the specific human traits listed below — do not add any other changes beyond what is listed.
Return only the written text, nothing else.`,
};

// ─── State ────────────────────────────────────────────────────

let selectedLevel         = 'easy';
let myStyleActive         = false;
let savedStyle            = null; // { style_summary, style_prompt }
let currentAbortController = null;

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

  // Seed credit display from session metadata, then immediately refresh from server
  const valEl = document.getElementById('credit-val');
  if (valEl) {
    const cached = session.user.user_metadata?.credits ?? 5000;
    valEl.textContent = cached.toLocaleString();
  }
  window.bipassAuth.refreshCredits().then(fresh => {
    if (fresh !== null && valEl) valEl.textContent = fresh.toLocaleString();
  }).catch(() => {});

  // Show welcome modal for brand-new users
  if (!session.user.user_metadata?.signup_welcome_shown) {
    showWelcomeModal();
  }

  const autostart = sessionStorage.getItem('bipass_autostart');
  if (autostart) {
    sessionStorage.removeItem('bipass_autostart');
    setTimeout(() => {
      if (autostart === 'humanize') humanize();
      else if (autostart === 'generate') generateNew();
    }, 50);
  }
}

async function showWelcomeModal() {
  const overlay = document.getElementById('welcome-modal');
  if (!overlay) return;

  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('show'));

  // Initialize credits on server
  let expiresAt = Date.now() + 86400000;
  try {
    const token = await window.bipassAuth.getToken();
    const res = await fetch('/api/init-credits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.alreadyInit) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.classList.add('hidden'), 250);
      return;
    }
    if (data.expiresAt) expiresAt = data.expiresAt;
  } catch (_) {}

  // Update credit display to 5,000
  const valEl = document.getElementById('credit-val');
  if (valEl) valEl.textContent = (5000).toLocaleString();

  // Live countdown
  const expireEl = document.getElementById('welcome-expire-val');
  function tick() {
    const remaining = expiresAt - Date.now();
    if (!expireEl) return;
    if (remaining <= 0) { expireEl.textContent = 'Expired'; return; }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    expireEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  tick();
  const timer = setInterval(tick, 1000);

  document.getElementById('welcome-cta')?.addEventListener('click', () => {
    clearInterval(timer);
    overlay.classList.remove('show');
    setTimeout(() => overlay.classList.add('hidden'), 250);
  });
}

// ─── Restore state from sessionStorage (after regenerate) ─────

function restoreState() {
  const level = sessionStorage.getItem('bipass_level') || localStorage.getItem('bipass_pref_level') || 'easy';
  selectLevel(level);

  const savedPrompt = sessionStorage.getItem('bipass_prompt');
  const savedInput  = sessionStorage.getItem('bipass_input');
  if (savedPrompt) promptText.value = savedPrompt;
  if (savedInput)  inputText.value  = savedInput;

  for (const type of ['grammar', 'tense', 'punct', 'caps', 'spelling']) {
    const saved = parseInt(sessionStorage.getItem(`bipass_m_${type}`) || '0');
    if (saved > 0) {
      const group = optionsPanel?.querySelector(`.mistake-intensity[data-mistake="${type}"]`);
      if (group) {
        group.querySelectorAll('.mint-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.val) === saved));
      }
    }
  }
  const savedMyStyle = sessionStorage.getItem('bipass_my_style');
  if (savedMyStyle !== null) {
    myStyleActive = savedMyStyle === 'true';
  } else {
    myStyleActive = localStorage.getItem('bipass_pref_mystyle') === 'true';
  }
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

  // Mistake intensity buttons
  optionsPanel?.querySelectorAll('.mistake-intensity').forEach(group => {
    group.querySelectorAll('.mint-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.mint-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  generateBtn.addEventListener('click', generateNew);
  humanizeBtn.addEventListener('click', humanize);

  document.getElementById('loading-cancel-btn')?.addEventListener('click', () => {
    if (currentAbortController) { currentAbortController.abort(); currentAbortController = null; }
    setLoading(false);
    showToast('Cancelled');
  });

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
  optionsPanel.style.display = level === 'customize' ? 'flex' : 'none';
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

let styleTraitSaveTimer = null;

function saveStyleTraits() {
  clearTimeout(styleTraitSaveTimer);
  styleTraitSaveTimer = setTimeout(async () => {
    try {
      const session = await window.bipassAuth.getSession();
      if (!session) return;
      await window.bipassAuth.client.from('user_styles').upsert({
        user_id:       session.user.id,
        style_summary: savedStyle.style_summary,
        style_prompt:  savedStyle.style_prompt,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (_) {}
  }, 500);
}

function getTraits() {
  let raw = [];
  try { raw = JSON.parse(savedStyle.style_summary); } catch (_) { raw = [savedStyle.style_summary]; }
  return raw.map(t => typeof t === 'string' ? { name: t, intensity: 2 } : { name: t.name, intensity: t.intensity ?? 2 });
}

function updateSliderFill(slider) {
  const pct = (parseInt(slider.value) / 2) * 100;
  slider.style.setProperty('--pct', `${pct}%`);
}

function showMyStyleCard() {
  myStyleInputs.style.display = 'none';

  const traits = getTraits();
  const LABELS = ['None', 'A little', 'A lot'];

  myStyleSummary.innerHTML = `<div class="style-trait-rows">${
    traits.map((t, i) => `
      <div class="style-trait-row">
        <div class="trait-slider-head">
          <span class="style-trait-name">${t.name}</span>
          <span class="trait-slider-val">${LABELS[t.intensity]}</span>
        </div>
        <input class="trait-slider" type="range" min="0" max="2" step="1"
               value="${t.intensity}" data-trait-idx="${i}">
      </div>`).join('')
  }</div>`;

  // Init fill + bind events
  myStyleSummary.querySelectorAll('.trait-slider').forEach(slider => {
    updateSliderFill(slider);
    slider.addEventListener('input', () => {
      const idx = parseInt(slider.dataset.traitIdx);
      const val = parseInt(slider.value);
      slider.previousElementSibling.querySelector('.trait-slider-val').textContent = LABELS[val];
      updateSliderFill(slider);
      const traits = getTraits();
      traits[idx].intensity = val;
      savedStyle.style_summary = JSON.stringify(traits);
      saveStyleTraits();
    });
  });

  myStyleCard.style.display = '';
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

  const prompt = `Analyze these writing samples. Return ONLY a single-line JSON object — no markdown, no code fences, no line breaks inside the JSON, no explanation before or after.

Look for personal writing habits that appear regardless of topic: spelling errors, grammar mistakes, missing or wrong capitalisation, punctuation habits, repeated words, run-on sentences, vocabulary level. Ignore sentence length or writing structure — those depend on the topic.

Use this exact format (replace the example values with real findings, keep it on ONE LINE):
{"traits":[{"name":"Grammar mistakes","intensity":2},{"name":"Missing capitals","intensity":1},{"name":"Word repetition","intensity":2}],"style_prompt":"A single paragraph describing this person's specific writing quirks for an AI to replicate. End with: Apply these personal quirks to whatever format the user requests."}

intensity must be 1 (trait appears occasionally) or 2 (trait appears frequently). Include up to 7 traits.

Writing samples:
${samples.map((s, i) => `Sample ${i + 1}: ${s}`).join('\n')}`;

  try {
    const token = await window.bipassAuth.getToken();
    if (!token) throw new Error('Not signed in');
    const res   = await fetch('/api/analyze', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body:    JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `Server error ${res.status}`);
    }
    const data = await res.json();
    console.log('[analyze] raw result:', data.result);
    const rawStr = (data.result || '').replace(/```json|```/g, '').trim();
    const jsonStr = rawStr.match(/\{[\s\S]*\}/)?.[0] || rawStr;
    let json;
    try {
      json = JSON.parse(jsonStr);
    } catch {
      const cleaned = jsonStr.replace(/[\r\n\t]/g, ' ').replace(/\s{2,}/g, ' ');
      json = JSON.parse(cleaned);
    }
    if (!json.traits || !json.style_prompt) throw new Error('Missing traits or style_prompt in response');

    // Normalise traits — accept both {name,intensity} objects and plain strings
    const normTraits = json.traits.map(t =>
      typeof t === 'string' ? { name: t, intensity: 2 } : { name: t.name, intensity: t.intensity ?? 2 }
    );

    savedStyle = { style_summary: JSON.stringify(normTraits), style_prompt: json.style_prompt };
    showMyStyleCard();
    showToast('Style analyzed');

    try {
      const session = await window.bipassAuth.getSession();
      await window.bipassAuth.client.from('user_styles').upsert({
        user_id:       session.user.id,
        style_summary: JSON.stringify(normTraits),
        style_prompt:  json.style_prompt,
        sample_count:  samples.length,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (saveErr) {
      console.warn('Style save failed (non-critical):', saveErr);
    }
  } catch (e) {
    console.error('analyzeStyle error:', e?.message || e);
    showToast('Could not analyze style — ' + (e?.message?.slice(0, 60) || 'try again'));
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

const MISTAKE_PROMPTS = {
  grammar: [
    null,
    'Make one or two grammar mistakes — a subject-verb disagreement or a missing article.',
    'Make frequent grammar mistakes throughout — missing articles, wrong subject-verb agreement ("they was", "he don\'t"), run-on sentences.',
  ],
  tense: [
    null,
    'Make one or two verb tense mistakes — use present instead of past tense occasionally ("she tell me", "yesterday I go").',
    'Make frequent tense mistakes throughout — mix past and present tense consistently, like a non-native speaker ("I seen it", "she tell me yesterday", "we was there").',
  ],
  punct: [
    null,
    'Miss a comma or two, or add one where it doesn\'t belong.',
    'Use inconsistent punctuation throughout — miss commas often, overuse commas instead of periods, occasionally skip ending punctuation.',
  ],
  caps: [
    null,
    'Miss a capital letter once or twice — a proper noun left lowercase or a sentence starting without a capital.',
    'Frequently miss capital letters — proper nouns often lowercase, some sentences start without capitals, inconsistent throughout.',
  ],
  spelling: [
    null,
    'Make one or two minor spelling mistakes — a wrong homophone (their/there/they\'re, your/you\'re) or a simple repeated letter.',
    'Make several spelling mistakes — wrong homophones, simple misspellings ("recieve", "definately", "alot"), a typo or two.',
  ],
};

function getMistakeLevel(type) {
  const group = optionsPanel?.querySelector(`.mistake-intensity[data-mistake="${type}"]`);
  if (!group) return 0;
  const active = group.querySelector('.mint-btn.active');
  return active ? parseInt(active.dataset.val) : 0;
}

function buildMistakeExtras() {
  const extras = [];
  for (const type of ['grammar', 'tense', 'punct', 'caps', 'spelling']) {
    const level = getMistakeLevel(type);
    if (level > 0 && MISTAKE_PROMPTS[type][level]) extras.push(MISTAKE_PROMPTS[type][level]);
  }
  return extras;
}

function buildTraitIntensityLine() {
  const traits = getTraits();
  const active = traits.filter(t => t.intensity > 0)
    .map(t => `${t.name} (${t.intensity === 1 ? 'a little' : 'a lot'})`).join(', ');
  return active ? `\nApply these writing traits at the given levels: ${active}.` : '';
}

function buildHumanizePrompt(text) {
  if (myStyleActive && savedStyle) {
    return `${savedStyle.style_prompt}${buildTraitIntensityLine()}\n\nText to rewrite:\n${text}`;
  }
  let prompt = HUMANIZE_PROMPTS[selectedLevel];
  if (selectedLevel === 'customize') {
    const extras = buildMistakeExtras();
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
  }
  prompt += `\n\nText to rewrite:\n${text}`;
  return prompt;
}

function buildGeneratePrompt(userPrompt) {
  if (myStyleActive && savedStyle) {
    return `${savedStyle.style_prompt}${buildTraitIntensityLine()}\n\nWhat to write:\n${userPrompt}`;
  }
  let prompt = GENERATE_PROMPTS[selectedLevel];
  if (selectedLevel === 'customize') {
    const extras = buildMistakeExtras();
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
    const result = await callAPIStream(buildGeneratePrompt(prompt));
    await new Promise(r => setTimeout(r, 1200));
    sessionStorage.setItem('bipass_result', result);
    sessionStorage.setItem('bipass_mode', 'generate');
    window.location.href = 'editor.html';
  } catch (err) {
    if (err.name === 'AbortError') return;
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
    const result = await callAPIStream(buildHumanizePrompt(text));
    await new Promise(r => setTimeout(r, 1200));
    sessionStorage.setItem('bipass_result', result);
    sessionStorage.setItem('bipass_mode', 'humanize');
    window.location.href = 'editor.html';
  } catch (err) {
    if (err.name === 'AbortError') return;
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
  sessionStorage.setItem('bipass_my_style', myStyleActive);
  for (const type of ['grammar', 'tense', 'punct', 'caps', 'spelling']) {
    sessionStorage.setItem(`bipass_m_${type}`, getMistakeLevel(type));
  }
}

// ─── Streaming API call (for generate / humanize) ────────────

async function callAPIStream(prompt) {
  currentAbortController = new AbortController();
  const token = await window.bipassAuth.getToken();

  const res = await fetch('/api/stream', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify({ prompt }),
    signal:  currentAbortController.signal,
  });

  if (res.status === 402) {
    showToast('No credits remaining — visit Plans to get more');
    throw new Error('No credits remaining');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Server error ${res.status}`);
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  const credEl = document.getElementById('loading-credits');
  let buffer = '';
  let finalResult = null;
  let creditsData = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(line.slice(6));
        if (json.error) throw new Error(json.error);
        if (json.done) {
          finalResult = json.result;
          creditsData = { creditsUsed: json.creditsUsed, creditsRemaining: json.creditsRemaining };
          if (credEl) credEl.textContent = json.creditsUsed.toLocaleString();
        }
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e;
      }
    }
  }

  if (!finalResult) throw new Error('No output received');
  if (creditsData) updateCreditDisplay(creditsData.creditsUsed, creditsData.creditsRemaining);
  return finalResult;
}

// ─── API call (for style analysis) ───────────────────────────

async function callAPI(prompt) {
  currentAbortController = new AbortController();
  const token = await window.bipassAuth.getToken();
  const res = await fetch('/api/humanize', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify({ prompt }),
    signal:  currentAbortController.signal,
  });

  if (res.status === 402) {
    showToast('No credits remaining — visit Plans to get more');
    throw new Error('No credits remaining');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  if (!data?.result) throw new Error('No output from server');

  if (data.creditsUsed !== undefined) {
    updateCreditDisplay(data.creditsUsed, data.creditsRemaining);
  }

  return data.result;
}

function updateCreditDisplay(used, remaining) {
  const valEl  = document.getElementById('credit-val');
  const badgeEl = document.getElementById('credit-used-badge');
  if (valEl) valEl.textContent = remaining.toLocaleString();
  if (badgeEl) {
    badgeEl.textContent = `−${used.toLocaleString()} credits`;
    badgeEl.classList.remove('hidden', 'credit-used-animate');
    void badgeEl.offsetWidth;
    badgeEl.classList.add('credit-used-animate');
  }
  // Confirm with a fresh server-side value a moment later
  setTimeout(() => {
    window.bipassAuth.refreshCredits().then(fresh => {
      if (fresh !== null && valEl) valEl.textContent = fresh.toLocaleString();
    }).catch(() => {});
  }, 1500);
}

// ─── Loading overlay ──────────────────────────────────────────

function setLoading(on, text) {
  generateBtn.disabled = on;
  humanizeBtn.disabled = on;

  if (on) {
    loadingText.textContent = text || 'Loading…';
    const credEl = document.getElementById('loading-credits');
    if (credEl) credEl.textContent = '';
    workspace.style.opacity = '0';
    workspace.style.pointerEvents = 'none';
    loadingOverlay.classList.add('visible');
    setStatus(text || 'Loading…');
  } else {
    workspace.style.opacity = '';
    workspace.style.pointerEvents = '';
    loadingOverlay.classList.remove('visible');
    const credEl = document.getElementById('loading-credits');
    if (credEl) credEl.textContent = '';
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

// ─── Scroll reveal ────────────────────────────────────────────

(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));
})();

// ─── Start ────────────────────────────────────────────────────

init();
