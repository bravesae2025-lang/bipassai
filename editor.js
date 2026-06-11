// ─── Post-process AI output ───────────────────────────────────

function postProcessOutput(text) {
  text = text.replace(/\s*—\s*/g, ', ');
  text = text.replace(/\s*–\s*/g, ', ');
  text = text.replace(/ - /g, ', ');

  const swaps = {
    'utilize': 'use', 'utilizes': 'uses', 'utilized': 'used', 'utilizing': 'using',
    'assist': 'help', 'assists': 'helps', 'assisted': 'helped', 'assisting': 'helping',
    'individuals': 'people', 'individual': 'person',
    'various': 'different', 'numerous': 'many',
    'ensure': 'make sure', 'ensures': 'makes sure', 'ensured': 'made sure',
    'obtain': 'get', 'obtains': 'gets', 'obtained': 'got',
    'regarding': 'about',
    'hence': 'so', 'thus': 'so', 'furthermore': 'also', 'moreover': 'also',
    'nevertheless': 'but', 'nonetheless': 'but',
    'whilst': 'while', 'purchase': 'buy', 'purchases': 'buys', 'purchased': 'bought',
    'commence': 'start', 'commences': 'starts', 'commenced': 'started',
    'leverage': 'use', 'leverages': 'uses', 'leveraged': 'used', 'leveraging': 'using',
    'facilitate': 'help', 'facilitates': 'helps', 'facilitated': 'helped',
    'constitute': 'make up', 'constitutes': 'makes up',
    'mitigate': 'reduce', 'mitigates': 'reduces', 'mitigated': 'reduced',
    'foster': 'build', 'fosters': 'builds', 'fostered': 'built',
    'harness': 'use', 'harnessing': 'using',
    'empower': 'help', 'empowers': 'helps',
    'encompass': 'include', 'encompasses': 'includes',
    'crucial': 'really important', 'pivotal': 'key', 'paramount': 'most important',
    'meticulous': 'careful', 'meticulously': 'carefully',
    'comprehensive': 'complete', 'robust': 'strong', 'versatile': 'flexible',
    'seamless': 'smooth', 'seamlessly': 'smoothly',
    'transformative': 'life-changing', 'methodology': 'method',
    'realm': 'area', 'ultimately': 'in the end',
    'fundamental': 'basic', 'intricate': 'complex',
    'bolster': 'strengthen', 'bolsters': 'strengthens',
  };

  for (const [ai, human] of Object.entries(swaps)) {
    const re = new RegExp(`\\b${ai}\\b`, 'gi');
    text = text.replace(re, m =>
      m[0] === m[0].toUpperCase() && m[0] !== m[0].toLowerCase()
        ? human.charAt(0).toUpperCase() + human.slice(1)
        : human
    );
  }
  return text;
}

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

const editorTextarea  = document.getElementById('editor-textarea');
const editorBadge     = document.getElementById('editor-badge');
const editorWc        = document.getElementById('editor-wc');
const copyBtn         = document.getElementById('copy-btn');
const loadingOverlay  = document.getElementById('loading-overlay');
const loadingText     = document.getElementById('loading-text');
const toast           = document.getElementById('toast');
const aiPromptInput   = document.getElementById('ai-prompt-input');
const aiPromptApply   = document.getElementById('ai-prompt-apply');
const editorBadgesEl  = document.getElementById('editor-badges');

// ─── Drawer ───────────────────────────────────────────────────

function setupDrawer(session) {
  const hamburger  = document.getElementById('nav-hamburger');
  const overlay    = document.getElementById('drawer-overlay');
  const drawer     = document.getElementById('drawer');
  const closeBtn   = document.getElementById('drawer-close');
  const drawerUser = document.getElementById('drawer-user');
  const signoutBtn = document.getElementById('drawer-signout-btn');

  const email = session ? session.user.email : '';
  let displayName = session ? (session.user.user_metadata?.display_name || '') : '';
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

// ─── Init ─────────────────────────────────────────────────────

async function init() {
  let session = await window.bipassAuth.requireAuth();
  if (!session) return;

  // Refresh to get latest tier/plan metadata (avoids stale "Free" on editor page)
  const fresh = await window.bipassAuth.refreshSession().catch(() => null);
  if (fresh) session = fresh;

  setupNavUser();
  setupDrawer(session);
  bipassSetupPlanStatus(session);

  const result = sessionStorage.getItem('bipass_result');
  const mode   = sessionStorage.getItem('bipass_mode');

  if (!result) {
    window.location.href = '/home';
    return;
  }

  editorBadge.textContent = mode === 'generate' ? 'Generated' : 'Adjusted';

  const changeCount = parseInt(sessionStorage.getItem('bipass_change_count') || '0');
  const changeEl = document.getElementById('editor-change-count');
  if (changeEl && changeCount > 0) {
    changeEl.textContent = `${changeCount} word${changeCount !== 1 ? 's' : ''} changed`;
    changeEl.classList.remove('hidden');
  }

  const totalWords = parseInt(sessionStorage.getItem('bipass_wc') || '1');
  const scoreEl = document.getElementById('editor-score');
  if (scoreEl && changeCount > 0 && totalWords > 0) {
    const rawPct = Math.min(changeCount / totalWords, 1);
    const score  = Math.round(40 + rawPct * 60);
    const label  = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';
    scoreEl.textContent = `Humanness: ${label}`;
    scoreEl.dataset.level = label.toLowerCase();
    scoreEl.classList.remove('hidden');
  }

  const tokensRaw = sessionStorage.getItem('bipass_tokens');
  if (tokensRaw) {
    try {
      const t = JSON.parse(tokensRaw);
      const total = (t.input || 0) + (t.output || 0);
      const tokEl = document.getElementById('editor-tokens');
      if (tokEl && total > 0) {
        tokEl.textContent = `${total.toLocaleString()} tokens`;
        tokEl.classList.remove('hidden');
      }
    } catch {}
  }

  typewriter(result);

  editorTextarea.addEventListener('input', updateWc);
  copyBtn.addEventListener('click', copyText);
  aiPromptApply.addEventListener('click', editWithAI);
  aiPromptInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editWithAI(); }
  });

  renderBadges();
  setupSpeedButtons();
  setupViewToggle(result, mode);
  document.getElementById('regen-btn')?.addEventListener('click', regenerate);
  saveResult(result, mode, session);
}

let viewingOriginal = false;

function setupViewToggle(result, mode) {
  const toggle      = document.getElementById('editor-view-toggle');
  const btnResult   = document.getElementById('toggle-result');
  const btnOrig     = document.getElementById('toggle-original');
  const btnChanges  = document.getElementById('toggle-changes');
  const changesView = document.getElementById('changes-view');
  const filter      = document.getElementById('changes-filter');
  const layout      = document.getElementById('changes-layout');
  const aiBox       = document.getElementById('ai-prompt-box');
  const original    = sessionStorage.getItem('bipass_input') || '';
  const resultHtml  = sessionStorage.getItem('bipass_result_html') || '';

  const hasHtml     = !!resultHtml.trim();
  const hasOriginal = !!original.trim();
  if (mode !== 'humanize' || (!hasHtml && !hasOriginal)) return;
  toggle.classList.remove('hidden');
  if (!hasOriginal) btnOrig.style.display = 'none';

  function showTextarea() {
    editorTextarea.classList.remove('hidden');
    if (layout) layout.classList.add('hidden');
  }
  function refreshCounts() {
    if (!filter || !changesView) return;
    ['word', 'caps', 'punct', 'spelling', 'tense', 'grammar'].forEach(cat => {
      const n = changesView.querySelectorAll(`[data-cat="${cat}"]`).length;
      const cEl = filter.querySelector(`[data-count="${cat}"]`);
      if (cEl) cEl.textContent = n;
      const row = filter.querySelector(`.cf-row[data-cat="${cat}"]`);
      if (row) row.classList.toggle('cf-empty', n === 0);
    });
  }
  function showChanges() {
    editorTextarea.classList.add('hidden');
    if (layout) layout.classList.remove('hidden');
    if (changesView) changesView.innerHTML = resultHtml;
    refreshCounts();
  }

  // Wire category filter toggles (once)
  filter?.querySelectorAll('.cf-row input').forEach(box => {
    box.addEventListener('change', () => {
      const row = box.closest('.cf-row');
      const cat = row.dataset.cat;
      changesView.classList.toggle(`cat-off-${cat}`, !box.checked);
      row.classList.toggle('cf-off', !box.checked);
    });
  });

  btnResult.addEventListener('click', () => {
    viewingOriginal = false;
    showTextarea();
    editorTextarea.value = result;
    editorTextarea.readOnly = false;
    editorBadge.textContent = 'Adjusted';
    btnResult.classList.add('active');
    btnOrig.classList.remove('active');
    if (btnChanges) btnChanges.classList.remove('active');
    if (aiBox) aiBox.style.display = '';
    updateWc();
  });

  btnOrig.addEventListener('click', () => {
    viewingOriginal = true;
    showTextarea();
    editorTextarea.value = original;
    editorTextarea.readOnly = true;
    editorBadge.textContent = 'Original';
    btnOrig.classList.add('active');
    btnResult.classList.remove('active');
    if (btnChanges) btnChanges.classList.remove('active');
    if (aiBox) aiBox.style.display = 'none';
    updateWc();
  });

  if (btnChanges) {
    btnChanges.addEventListener('click', () => {
      showChanges();
      btnChanges.classList.add('active');
      btnResult.classList.remove('active');
      btnOrig.classList.remove('active');
      if (aiBox) aiBox.style.display = 'none';
    });

    // Default to changes view when diff HTML is available
    if (hasHtml) {
      btnChanges.click();
    }
  }
}

async function saveResult(text, mode, session) {
  const level = sessionStorage.getItem('bipass_level') || 'easy';
  const { data } = await window.bipassAuth.client
    .from('results')
    .insert({ user_id: session.user.id, text, mode: mode || 'humanize', level })
    .select('id')
    .single();
  if (data?.id) sessionStorage.setItem('bipass_result_id', data.id);
}

// ─── Typewriter ───────────────────────────────────────────────

const TYPING_SPEEDS = {
  slow:   { chars: 8,  ms: 16 },
  normal: { chars: 25, ms: 10 },
  fast:   { chars: 60, ms: 8  },
};

/* Result page always uses max speed — the saved preference is for the
   extension auto-typer, not this display animation */
const RESULT_SPEED = { chars: 120, ms: 6 };

let typewriterStarted = false;
let typewriterInterval = null;

function getTypingSpeed() {
  return RESULT_SPEED;
}

function typewriter(text) {
  if (typewriterStarted) return;
  typewriterStarted = true;
  editorTextarea.value = '';
  if (typewriterInterval) clearInterval(typewriterInterval);
  let i = 0;
  const { chars, ms } = getTypingSpeed();
  typewriterInterval = setInterval(() => {
    i = Math.min(i + chars, text.length);
    editorTextarea.value = text.slice(0, i);
    editorTextarea.scrollTop = editorTextarea.scrollHeight;
    updateWc();
    if (i >= text.length) clearInterval(typewriterInterval);
  }, ms);
}

function setupSpeedButtons() {
  const saved = localStorage.getItem('bipass_pref_speed') || 'fast';
  document.querySelectorAll('.typing-speed-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.speed === saved);
    btn.addEventListener('click', () => {
      localStorage.setItem('bipass_pref_speed', btn.dataset.speed);
      document.querySelectorAll('.typing-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Start typewriter immediately from sessionStorage — before auth resolves
(function () {
  const result = sessionStorage.getItem('bipass_result');
  const mode   = sessionStorage.getItem('bipass_mode');
  if (!result) return;
  editorBadge.textContent = mode === 'generate' ? 'Generated' : 'Humanized';
  typewriter(result);
})();

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

async function callEditorStream(prompt) {
  const token = await window.bipassAuth.getToken();
  const res = await fetch('/api/stream', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', accumulated = '', finalResult = null;
  editorTextarea.value = '';
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
        if (json.chunk) {
          accumulated += json.chunk;
          editorTextarea.value = accumulated;
          editorTextarea.scrollTop = editorTextarea.scrollHeight;
          updateWc();
        }
        if (json.done) finalResult = json.result;
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e;
      }
    }
  }
  return finalResult || accumulated.trim();
}

async function editWithAI() {
  const text        = editorTextarea.value.trim();
  const instruction = aiPromptInput.value.trim();
  if (!text)        { showToast('Nothing to edit'); return; }
  if (!instruction) { showToast('Tell the AI what to change'); aiPromptInput.focus(); return; }

  const origHtml = aiPromptApply.innerHTML;
  aiPromptApply.disabled  = true;
  aiPromptInput.disabled  = true;
  aiPromptApply.textContent = 'Editing…';
  copyBtn.disabled = true;

  const prompt = `The user wants to edit the following text. Their instruction: "${instruction}"

Apply the instruction while keeping the text sounding natural and human. Do not make it sound AI-generated. Return only the edited text, nothing else.

Text:
${text}`;

  try {
    const result = postProcessOutput(await callEditorStream(prompt));
    editorTextarea.value = result;
    sessionStorage.setItem('bipass_result', result);
    updateWc();
    aiPromptInput.value = '';
    showToast('Done');
  } catch (err) {
    editorTextarea.value = text;
    updateWc();
    showToast(err.message || 'Something went wrong');
  } finally {
    aiPromptApply.disabled = false;
    aiPromptInput.disabled = false;
    aiPromptApply.innerHTML = origHtml;
    copyBtn.disabled = false;
  }
}

// ─── Feature badges ───────────────────────────────────────────

function renderBadges() {
  const level   = sessionStorage.getItem('bipass_level') || 'easy';
  const grammar = sessionStorage.getItem('bipass_grammar') === 'true';
  const punct   = sessionStorage.getItem('bipass_punct')   === 'true';

  const badges = [
    { label: level.charAt(0).toUpperCase() + level.slice(1) + ' mode', active: true },
    { label: 'Grammar mistakes', active: grammar },
    { label: 'Punctuation mistakes', active: punct },
  ];

  editorBadgesEl.innerHTML = badges.map(b => `
    <span class="editor-feature-badge ${b.active ? 'active' : ''}">
      <span class="editor-feature-tick">${b.active ? '✓' : '○'}</span>
      ${b.label}
    </span>
  `).join('');
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
Do NOT use em dashes (—) or hyphens as em dashes (word - word) — #1 AI tell. Zero dashes anywhere.
Replace AI words immediately: "utilize"→"use" | "leverage"→"use" | "crucial"→"really important" | "significant/significantly"→"big" | "robust"→"strong" | "individuals"→"people" | "comprehensive"→"complete" | "furthermore"→"also" | "realm"→"area" | "severity"→"how bad it is" | "methodology"→"method" | "facilitate"→"help" | "paramount"→"most important" | "groundbreaking"→"new" | "ultimately"→"in the end" | "scarcity/scarcities"→"shortage" | "intricate"→"complex" | "foster"→"help" | "harness"→"use" | "mitigate"→"reduce" | "palpable"→"real" | "seamless"→"smooth" | "demonstrate"→"show" | "assist"→"help" | "numerous"→"many" | "various"→"different" | "ensure"→"make sure" | "obtain"→"get" | "regarding"→"about" | "hence/thus/therefore"→"so" | "additionally"→"also" | "whilst"→"while"
Never use: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", "in today's world", "cornerstone", "game-changing", "invaluable", "synergy", "impactful", "plays a crucial role", "serves as a testament", or conclusion summaries.
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
Never use em dashes (—) or hyphens as em dashes (word - word mid-sentence) — #1 AI tell, zero dashes.
Replace AI words immediately: "utilize"→"use" | "leverage"→"use" | "crucial"→"really important" | "significant/significantly"→"big" | "robust"→"strong" | "individuals"→"people" | "comprehensive"→"complete" | "furthermore"→"also" | "realm"→"area" | "severity"→"how bad it is" | "methodology"→"method" | "facilitate"→"help" | "paramount"→"most important" | "groundbreaking"→"new" | "ultimately"→"in the end" | "scarcity/scarcities"→"shortage" | "intricate"→"complex" | "foster"→"help" | "harness"→"use" | "mitigate"→"reduce" | "palpable"→"real" | "seamless"→"smooth" | "demonstrate"→"show" | "assist"→"help" | "numerous"→"many" | "various"→"different" | "ensure"→"make sure" | "obtain"→"get" | "regarding"→"about" | "hence/thus/therefore"→"so" | "additionally"→"also" | "whilst"→"while"
Never use: "it's worth noting", "certainly", "in conclusion", "delve", "cornerstone", "game-changing", "invaluable", "synergy", "impactful", "plays a crucial role", "serves as a testament", conclusion summaries, or equal sentence energy throughout.
Return only the rewritten text, nothing else.`,

  hard: `Rewrite the following text so it sounds like a confident, capable person wrote it. The humanness should be subtle — texture, not obvious mistakes. Use only 2–3 of these traits, once or twice each:

- Uneven rhythm — most of it flows well, but one part speeds up or lingers slightly.
- One slight contradiction or emotional inconsistency.
- One moment of real uncertainty: "I don't fully know why" or "maybe I'm wrong."
- Strong opinion stated without diplomatic hedging.
- One unexpected specific detail that leaks in naturally.
- One sentence longer and a little messier than the rest.

Only use 2–3 of these. Subtlety is the point.
Never use em dashes (—) or hyphens as em dashes (word - word mid-sentence) — #1 AI tell, zero dashes anywhere.
Replace AI words immediately: "utilize"→"use" | "leverage"→"use" | "crucial"→"really important" | "significant/significantly"→"big" | "robust"→"strong" | "individuals"→"people" | "comprehensive"→"complete" | "furthermore"→"also" | "realm"→"area" | "severity"→"how bad it is" | "methodology"→"method" | "facilitate"→"help" | "paramount"→"most important" | "groundbreaking"→"new" | "ultimately"→"in the end" | "scarcity/scarcities"→"shortage" | "intricate"→"complex" | "foster"→"help" | "harness"→"use" | "mitigate"→"reduce" | "palpable"→"real" | "seamless"→"smooth" | "demonstrate"→"show" | "assist"→"help" | "numerous"→"many" | "various"→"different" | "ensure"→"make sure" | "obtain"→"get" | "regarding"→"about" | "hence/thus/therefore"→"so" | "additionally"→"also" | "whilst"→"while"
Absolutely avoid: "it's worth noting", "certainly", "in conclusion", "delve", "cornerstone", "game-changing", "invaluable", "synergy", "impactful", "plays a crucial role", "serves as a testament", fake-deep transitions, conclusion summaries.
Return only the rewritten text, nothing else.`,
};

function buildHumanizePrompt(text, level, grammar, punct) {
  let prompt = HUMANIZE_PROMPTS[level] || HUMANIZE_PROMPTS.medium;
  const extras = [];
  if (grammar) extras.push('Also include a few subtle grammar mistakes that a real person might make.');
  if (punct)   extras.push('Also use inconsistent punctuation — sometimes miss a comma, skip an apostrophe, or run two clauses together. Never use dashes.');
  if (extras.length > 0) prompt += '\n\n' + extras.join(' ');
  prompt += `\n\nText to rewrite:\n${text}`;
  return prompt;
}

// ─── Regenerate ───────────────────────────────────────────────

function buildRegeneratePrompt(userPrompt, level) {
  const levelDesc = { easy: 'beginner', medium: 'student', hard: 'expert' }[level] || 'student';
  return `Write a fresh version of the following task. Write it the way a ${levelDesc} would — naturally human, not AI-generated. Return only the text, nothing else.\n\nTask: ${userPrompt}`;
}

async function regenerate() {
  const mode    = sessionStorage.getItem('bipass_mode');
  const level   = sessionStorage.getItem('bipass_level') || 'easy';
  const grammar = parseInt(sessionStorage.getItem('bipass_m_grammar') || '0') > 0;
  const punct   = parseInt(sessionStorage.getItem('bipass_m_punct')   || '0') > 0;

  let prompt;
  if (mode === 'humanize') {
    const text = sessionStorage.getItem('bipass_input') || '';
    if (!text) { showToast('No original text found'); return; }
    prompt = buildHumanizePrompt(text, level, grammar, punct);
  } else {
    const userPrompt = sessionStorage.getItem('bipass_prompt') || '';
    if (!userPrompt) { showToast('No prompt found'); return; }
    prompt = buildRegeneratePrompt(userPrompt, level);
  }

  const regenBtn = document.getElementById('regen-btn');
  regenBtn.disabled = true;
  setLoading(true);

  try {
    const result = await callEditorStream(prompt);
    sessionStorage.setItem('bipass_result', result);
    document.getElementById('toggle-result')?.click();
    showToast('Regenerated');
  } catch (err) {
    showToast(err.message || 'Something went wrong');
  } finally {
    regenBtn.disabled = false;
    setLoading(false);
  }
}

// ─── Loading overlay ──────────────────────────────────────────

function setLoading(on) {
  copyBtn.disabled        = on;
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

// ─── Push to Extension ────────────────────────────────────────

async function pushToExtension() {
  const btn = document.getElementById('push-ext-btn');
  if (!btn || btn.classList.contains('editor-btn-pushed')) return;

  btn.disabled = true;
  btn.textContent = 'Uploading…';

  try {
    const session = await window.bipassAuth.getSession();
    if (!session) throw new Error('Not signed in');

    const text = editorTextarea?.value?.trim();
    if (!text) throw new Error('No text');

    const mode  = sessionStorage.getItem('bipass_mode')  || 'humanize';
    const level = sessionStorage.getItem('bipass_level') || 'easy';

    // Try updating the existing saved row first
    let pushed = false;
    const resultId = sessionStorage.getItem('bipass_result_id');
    if (resultId) {
      const { data } = await window.bipassAuth.client
        .from('results')
        .update({ ext_push: true })
        .eq('id', resultId)
        .eq('user_id', session.user.id)
        .select('id');
      if (data?.length > 0) pushed = true;
    }

    // Fall back to direct insert if update matched nothing (race condition or save failed)
    if (!pushed) {
      const { error } = await window.bipassAuth.client
        .from('results')
        .insert({ user_id: session.user.id, text, mode, level, ext_push: true });
      if (error) throw error;
    }

    btn.textContent = '✓ Uploaded';
    btn.classList.add('editor-btn-pushed');
  } catch (err) {
    btn.disabled = false;
    btn.textContent = '↻ Retry Upload';
  }
}

document.getElementById('push-ext-btn')?.addEventListener('click', pushToExtension);

// ─── Start ────────────────────────────────────────────────────

init();
