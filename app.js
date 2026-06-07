const LEVEL_DESCRIPTIONS = {
  easy:      'Beginner — simple words, mixed sentences, tense mistakes like a non-native speaker',
  medium:    'Student — average voice, decent grammar, nothing too fancy',
  hard:      'Expert — confident and fluent, strong vocabulary, varied sentences',
  customize: 'Custom — pick exactly which human traits to add',
};

const LEVEL_INDEX = { easy: 0, medium: 1, hard: 2, customize: 3 };

const HUMANIZE_PROMPTS = {
  easy: `Rewrite the following text so it sounds like a beginner or non-native English speaker wrote it. This must be completely undetectable by AI detectors. Follow every rule strictly.

WRITE NORMAL TEXT — not conversational or spoken:
Write as a normal written piece, not like someone talking out loud. Casual words like "like", "I guess", "honestly" should only slip in once or twice as natural mistakes — not throughout. This is written text, not a speech or chat message.

REPLACE AI WORDS — these words make it obvious it's AI, replace them:
"sorts" → "type" or "kind" | "utilize" → "use" | "assist" → "help" | "purchase" → "buy" | "demonstrate" → "show" | "implement" → "use" or "do" | "individuals" → "people" | "various" → "different" or "some" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "commence" → "start" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while"

COMMAS — only where clearly needed:
Use commas in lists and after long openers (5+ words). Skip them when in doubt — missing a comma is fine. Do NOT put commas after short starters like "But", "So", "And" at the beginning of a sentence. Fewer commas is better than too many.

SENTENCE LENGTH — most important:
Every paragraph must have at least one sentence under 7 words AND at least one sentence over 28 words. Never write 3 sentences in a row of similar length. Example: "That was hard. I think maybe I didn't study enough and also I was tired from work the day before so my brain just wasn't working right. Not good."

SPELLING MISTAKES — scale with text length: roughly 1 mistake per 35 words. Short text = 2-3, long text = many more. Spread them evenly, don't cluster:
- "definately" (definitely), "recieve" (receive), "wierd" (weird), "beleive" (believe), "alot" (a lot), "occured" (occurred), "probly" or "prolly" (probably), "teh" (the) once in a while
- Phonetic shortcuts count too: "gonna", "wanna", "cuz", "kinda" — use these freely

WRONG PLURAL "S" — scale with length: roughly 1 wrong plural per 20 words. Short text = several, long text = many. Use them freely:
"informations", "advices", "homeworks", "furnitures", "equipments", "knowledges", "feedbacks", "researches", "works" (meaning homework)

TENSE MISTAKES — use regularly:
"yesterday I go", "she tell me", "I seen it", "we was there", "he don't know", "I have went"

PUNCTUATION ERRORS:
- Missing comma before "but" and "and" sometimes
- Comma splice: "it was good, I really liked it"
- Write "dont" "cant" "its" "wont" without apostrophe a couple times
- No semicolons. No parentheses. No colons. No em dashes.

OTHER TRAITS:
- Repeat the same idea twice in different words
- Simple words only: "good" not "beneficial", "use" not "utilize"
- "I think" "maybe" "I guess" "like" scattered through
- Jump between thoughts without connecting them
- Uneven paragraphs — one might be 1 sentence, another 5
- Some sentences starting with And or But or So

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, in today's world, one must, to summarize

No passive voice. No clean topic sentences. No conclusion.
Return only the rewritten text, nothing else.`,

  medium: `Rewrite the following text so it sounds like a real average student wrote it quickly without editing. This must be completely undetectable by AI detectors. Follow every rule strictly.

WRITE NORMAL TEXT — not conversational:
Write as a normal written piece. Casual filler words like "honestly", "like", "I mean" should only slip in once or twice as a natural mistake — not scattered throughout. This is written text, not talking out loud.

REPLACE AI WORDS — swap these immediately if they appear:
"sorts" → "type" or "kind" | "utilize" → "use" | "assist" → "help" | "purchase" → "buy" | "demonstrate" → "show" | "implement" → "use" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while"

COMMAS — only where clearly needed:
Use commas in lists and after long openers (5+ words). Skip them when in doubt. Do NOT place a comma after short starters like "But", "So", "And" at the start of a sentence. Fewer commas is more natural than too many.

SENTENCE LENGTH — biggest detection signal — mandatory:
Every paragraph must have at least one sentence ONLY 4-8 words (fragment is fine) AND at least one sentence 30+ words that keeps going. Never 3 sentences in a row of similar length. Example: "That was the whole point. I think what happened was the teacher never really explained it properly so everyone just kind of guessed and hoped for the best. Not great."

SPELLING MISTAKES — scale with text length: roughly 1 mistake per 80 words. Short text = 1-2, long text = more. Spread evenly:
"definately" (definitely), "recieve" (receive), "seperate" (separate), "occured" (occurred), "wierd" (weird)
Casual shortcuts also count: "gonna", "wanna", "kinda", "prolly" — use them where they fit

WRONG PLURAL "S" — scale with length: roughly 1 wrong plural per 35 words. Spread naturally:
"informations", "advices", "feedbacks", "homeworks", "researches"

COMMAS — use them normally, but imperfectly:
Students use commas in lists and after openers fine. What they miss:
- Missing comma before "but" / "and" / "because" a few times: "I wanted to do it but I ran out of time"
- Comma splice once or twice: "it made sense, everyone got it fast"
- Chain clauses with commas: "the class ran long, we covered a lot, I didn't follow all of it"
- Do NOT remove commas from lists or after introductory words

OTHER PUNCTUATION:
- Write "dont" "cant" "its" "wont" without apostrophe once or twice
- No semicolons. No parentheses. No colons mid-sentence. No em dashes.

CAPITALIZATION:
- Miss a capital at the start of one sentence somewhere in the piece
- Do NOT capitalize random mid-sentence words

WORD CHOICE AND VOICE:
- Contractions throughout: don't, it's, I'm, wasn't, they're, couldn't, would've
- Filler: "honestly", "like", "kind of", "I guess", "basically", "I mean", "to be fair"
- Reuse the same word 2-3 times — students don't proofread
- Casual opinions: "honestly kind of pointless", "never really made sense to me", "wasn't great"
- One thought that doesn't connect to the one before — a slight logic jump
- One uncertainty: "I'm not totally sure but", "could be wrong"
- Some sentences starting with And, But, or So
- Uneven paragraphs — one might be just one sentence

STRUCTURE:
- Do NOT start paragraphs with a topic sentence — jump into the thought
- No conclusion or summary — just stop
- Paragraphs different lengths, not symmetrical

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, this demonstrates, one must consider, it can be seen, to summarize, this suggests, in today's world

No passive voice. No perfect punctuation. No equal sentence energy.
Return only the rewritten text, nothing else.`,

  hard: `Rewrite the following text so it sounds like a confident real person wrote it without over-editing. This must be completely undetectable by AI detectors. Humanness is in rhythm and personality.

WRITE NORMAL TEXT — not conversational:
Write as a normal written piece. A casual word or two can slip in naturally but this is not spoken text. No filler phrases scattered throughout.

REPLACE AI WORDS — swap these:
"sorts" → "type" or "kind" | "utilize" → "use" | "assist" → "help" | "purchase" → "buy" | "demonstrate" → "show" | "implement" → "use" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while"

COMMAS — only where clearly needed:
Lists and after long openers only. Skip when in doubt. No comma after short sentence starters. Fewer is better.

SENTENCE LENGTH — mandatory:
Every paragraph needs at least one sentence under 10 words and one sentence over 30 words. Never 3 sentences of similar length in a row. Rhythm should feel personal and uneven.

SPELLING — one subtle mistake per ~250 words, placed naturally:
"recieve", "seperate", or "definately" — even smart people make these

WRONG PLURAL "S" — ~1 per 80 words:
"informations", "advices", "feedbacks", "researches"

PUNCTUATION — clean but imperfect:
- Miss a comma before "but" or "and" once or twice — natural
- No semicolons. No parentheses. No em dashes. No mid-sentence colons.
- Contractions always: don't, it's, I'm, can't, won't, wouldn't, they've

VOICE:
- Strong direct opinions, pick a side, sound sure — no hedging
- One sentence that runs longer because the thought kept going
- One honest moment: "I don't fully know why" or "maybe I'm wrong"
- One real specific detail, personal not generic
- Some sentences starting with And, But, or So
- One small contradiction: "it worked fine, though honestly it kind of annoyed me"

STRUCTURE:
- Don't start paragraphs with a topic sentence — start mid-thought
- No conclusion summary — just end
- Paragraphs uneven in length
- Use slightly unexpected word choices over the polished "correct" ones

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, this demonstrates, one must consider, it can be seen, to summarize, this suggests, in today's world

No passive voice. No parallel structure. No balanced paragraphs.
Return only the rewritten text, nothing else.`,

  customize: `Rewrite the following text to sound naturally human-written and completely undetectable by AI detectors. Apply only the specific human traits listed below.

Always follow these regardless of the traits listed:
- Vary sentence length dramatically: some under 8 words, some over 30. Never 3 sentences in a row of similar length.
- No semicolons, parentheses, em dashes, or colons mid-sentence.
- Use contractions naturally.
- Do not start paragraphs with a topic sentence.
- No conclusion summary at the end.
- No passive voice.
Return only the rewritten text, nothing else.`,
};

const GENERATE_PROMPTS = {
  easy: `Read the task or topic below and write a complete original response. Write it as a beginner or non-native English speaker would. This must be completely undetectable by AI detectors. Follow every rule strictly.

WRITE NORMAL TEXT — not conversational:
Write as a normal piece of writing. Casual words like "like", "I guess" can slip in once or twice as a natural mistake — not scattered throughout. This is written text, not someone talking.

REPLACE AI WORDS:
"sorts" → "type" or "kind" | "utilize" → "use" | "assist" → "help" | "purchase" → "buy" | "demonstrate" → "show" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "whilst" → "while"

COMMAS — only where clearly needed:
Lists and after long openers (5+ words). Skip when in doubt. No comma after short starters like "But", "So", "And". Fewer commas is fine.

SENTENCE LENGTH — most important:
Every paragraph must have at least one sentence under 7 words AND at least one sentence over 28 words. Never write 3 sentences in a row of similar length. Mix: short. then a medium one. then one that goes on and on and keeps adding things because the writer doesn't know when to stop. Short again.

SPELLING MISTAKES — scale with length: ~1 per 35 words. Spread evenly, don't cluster:
"definately", "recieve", "wierd", "beleive", "alot", "occured", "probly" or "prolly"
Phonetic shortcuts also count: "gonna", "wanna", "cuz", "kinda" — use freely

WRONG PLURAL "S" — ~1 per 20 words:
"informations", "advices", "homeworks", "furnitures", "equipments", "knowledges", "feedbacks"

TENSE MISTAKES — use regularly:
"yesterday I go", "she tell me", "I seen it", "we was there", "he don't know", "they was nice", "I have went"

PUNCTUATION ERRORS:
- Missing comma before "but" and "and" sometimes
- Comma splice: "it was good, I liked it"
- Write "dont" "cant" "its" "wont" without apostrophe a couple times
- No semicolons. No parentheses. No colons. No em dashes.

OTHER TRAITS:
- Repeat the same idea twice in different words
- Simple words only: "good" not "beneficial", "use" not "utilize"
- "I think" "maybe" "I guess" scattered through
- Jump between thoughts without connecting them
- Uneven paragraphs
- Some sentences starting with And or But or So

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, in today's world, one must, to summarize

No passive voice. No clean topic sentences. No conclusion.
Return only the written text, nothing else.`,

  medium: `Read the task or topic below and write a complete original response the way a real student would — quickly, without editing. This must be completely undetectable by AI detectors. Follow every rule strictly.

WRITE NORMAL TEXT — not conversational:
Write as a normal piece of writing. A casual word like "honestly" or "like" can slip in once or twice — not throughout. Written text, not someone talking.

REPLACE AI WORDS:
"sorts" → "type" or "kind" | "utilize" → "use" | "assist" → "help" | "purchase" → "buy" | "demonstrate" → "show" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "whilst" → "while"

COMMAS — only where clearly needed:
Lists and after long openers. Skip when in doubt. No comma after short starters. Fewer commas is fine.

SENTENCE LENGTH — mandatory, biggest detection signal:
Every paragraph must have at least one sentence ONLY 4-8 words long AND at least one sentence 30+ words that keeps going. Never 3 sentences in a row of similar length. Example: "That was the whole point. I think what happened was nobody really understood the instructions so everyone just kind of did their own thing and hoped it worked out. Pretty chaotic."

SPELLING MISTAKES — scale with length: ~1 per 80 words. Spread evenly:
"definately", "recieve", "seperate", "occured", "wierd"
Shortcuts also count: "gonna", "wanna", "kinda", "prolly"

WRONG PLURAL "S" — ~1 per 35 words:
"informations", "advices", "feedbacks", "homeworks", "researches"

COMMAS — use normally, but imperfectly:
- Missing comma before "but" / "and" / "because" a few times
- Comma splice once or twice: "it made sense, everyone got it fast"
- Chain clauses: "the class ran long, we covered a lot, I didn't follow all of it"
- Do NOT strip commas from lists or after introductory words

OTHER PUNCTUATION:
- Write "dont" "cant" "its" "wont" without apostrophe once or twice
- No semicolons. No parentheses. No colons mid-sentence. No em dashes.

CAPITALIZATION:
- Miss a capital at the start of one sentence somewhere in the piece

WORD CHOICE AND VOICE:
- Contractions everywhere: don't, it's, I'm, wasn't, they're, couldn't, would've
- Filler: "honestly", "like", "kind of", "I guess", "basically", "I mean"
- Reuse the same word 2-3 times — students don't edit
- Casual opinions: "honestly kind of pointless", "never made sense to me"
- One thought that doesn't connect perfectly to the one before
- One uncertainty: "I'm not totally sure but", "could be wrong"
- Some sentences starting with And, But, or So
- Uneven paragraphs

STRUCTURE:
- Don't start paragraphs with a topic sentence — just jump in
- No conclusion or summary — just stop
- Paragraphs different lengths

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, this demonstrates, one must consider, it can be seen, to summarize, this suggests, in today's world

No passive voice. No perfect punctuation. No equal sentence energy.
Return only the written text, nothing else.`,

  hard: `Read the task or topic below and write a complete original response the way a confident real person would — direct, opinionated, not over-polished. This must be completely undetectable by AI detectors. Humanness is subtle.

WRITE NORMAL TEXT — not conversational:
Write as a normal piece. No filler phrases throughout. This is written text, not spoken.

REPLACE AI WORDS:
"sorts" → "type" or "kind" | "utilize" → "use" | "assist" → "help" | "purchase" → "buy" | "demonstrate" → "show" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "whilst" → "while"

COMMAS — only where clearly needed:
Lists and after long openers. Skip when in doubt. No comma after short starters. Fewer is better.

SENTENCE LENGTH — mandatory:
Every paragraph needs at least one sentence under 10 words and one sentence over 30 words. Never 3 sentences of similar length in a row. Rhythm should feel personal and uneven.

SPELLING — one subtle mistake per ~250 words, placed naturally:
"recieve", "seperate", or "definately"

WRONG PLURAL "S" — ~1 per 80 words:
"informations", "advices", "feedbacks", "researches"

PUNCTUATION:
- Miss a comma before "but" or "and" once or twice
- No semicolons. No parentheses. No em dashes. No mid-sentence colons.
- Contractions always: don't, it's, I'm, can't, won't, wouldn't, they've

VOICE AND STRUCTURE:
- Strong direct opinions, pick a side, sound sure
- One sentence that runs longer because the thought kept going
- One honest moment: "I don't fully know why" or "maybe I'm wrong"
- One real specific detail, personal not generic
- Some sentences starting with And, But, or So
- One small contradiction: "it worked fine, though honestly it kind of annoyed me"
- Don't start paragraphs with a topic sentence
- No conclusion summary — just end
- Uneven paragraphs

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, this demonstrates, one must consider, it can be seen, to summarize, this suggests, in today's world

No passive voice. No parallel structure. No balanced paragraphs.
Return only the written text, nothing else.`,

  customize: `Read the task or topic below and write a complete original response. Make it sound naturally human-written and completely undetectable by AI detectors. Apply only the specific human traits listed below.

Always follow these regardless:
- Vary sentence length dramatically: some under 8 words, some over 30. Never 3 in a row of similar length.
- No semicolons, parentheses, em dashes, or mid-sentence colons.
- Use contractions naturally.
- Don't start paragraphs with a topic sentence.
- No conclusion summary.
- No passive voice.
Return only the written text, nothing else.`,
};

// ─── State ────────────────────────────────────────────────────

let selectedLevel          = 'easy';
let myStyleActive          = false;
let savedStyle             = null; // points to the active style in savedStyles
let savedStyles            = [];   // array of {id, name, style_summary, style_prompt}
let activeStyleId          = null;
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
const colCustomize   = document.querySelector('.col-customize');
const myStyleBox     = document.getElementById('my-style-block');
const sampleContainer  = document.getElementById('sample-container');
const addSampleBtn     = document.getElementById('add-sample-btn');
const analyzeStyleBtn  = document.getElementById('analyze-style-btn');
const analyzeLabel     = document.getElementById('analyze-label');
const analyzeLoader    = document.getElementById('analyze-loader');
const myStyleInputs    = document.getElementById('my-style-inputs');
const styleCardsList   = document.getElementById('style-cards-list');

document.querySelectorAll('.qs-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    promptText.value = pill.dataset.prompt;
    promptText.focus();
    promptText.dispatchEvent(new Event('input'));
  });
});

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

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser();
  setupDrawer(session);
  bipassSetupPlanStatus(session);

  // Show no-plan banner if user has no active plan
  const _tier = session.user.user_metadata?.tier || 'free';
  const _planExp = session.user.user_metadata?.plan_expires_at;
  const _hasPlan = _tier !== 'free' && (!_planExp || Date.now() < _planExp);
  if (!_hasPlan) {
    const _banner = document.getElementById('no-plan-banner');
    if (_banner) {
      _banner.classList.remove('hidden');
      document.getElementById('no-plan-banner-close')?.addEventListener('click', () => {
        _banner.classList.add('hidden');
      }, { once: true });
    }
  }

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

  // Refresh plan status when user returns to tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      window.bipassAuth.refreshSession().then(fresh => {
        if (fresh) bipassSetupPlanStatus(fresh);
      }).catch(() => {});
    }
  });
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
    setTimeout(() => {
      overlay.classList.add('hidden');
      window.__bipassShowExtPopup?.();
    }, 250);
  });
}

// ─── Restore state from sessionStorage (after regenerate) ─────

function restoreState() {
  const level = sessionStorage.getItem('bipass_level') || localStorage.getItem('bipass_pref_level') || 'easy';
  selectLevel(level);

  // Restore active tab
  const savedMode = sessionStorage.getItem('bipass_mode');
  if (savedMode === 'humanize') {
    document.getElementById('tab-humanize')?.click();
  }

  const savedPrompt = sessionStorage.getItem('bipass_prompt');
  const savedInput  = sessionStorage.getItem('bipass_input');
  if (savedPrompt) { promptText.value = savedPrompt; updateCostPreview('generate-cost', estimateGenerateCost(savedPrompt)); }
  if (savedInput)  { inputText.value  = savedInput;  updateCostPreview('humanize-cost', savedInput.length || null); }

  for (const type of ['grammar', 'tense', 'punct', 'caps', 'spelling']) {
    const saved = parseInt(sessionStorage.getItem(`bipass_m_${type}`) || '0');
    const slider = optionsPanel?.querySelector(`input.mistake-slider[data-mistake="${type}"]`);
    if (slider && saved > 0) {
      slider.value = saved;
      updateSliderFill(slider);
      const valEl = optionsPanel?.querySelector(`.mistake-slider-val[data-mistake="${type}"]`);
      if (valEl) valEl.textContent = mistakeLabel(saved);
    }
  }
  const savedMyStyle = sessionStorage.getItem('bipass_my_style');
  if (savedMyStyle !== null) {
    myStyleActive = savedMyStyle === 'true';
  } else {
    myStyleActive = localStorage.getItem('bipass_pref_mystyle') === 'true';
  }
  colCustomize?.classList.add('col-active');
}

// ─── Events ───────────────────────────────────────────────────

function bindEvents() {
  inputText.addEventListener('input', updateStats);
  inputText.addEventListener('paste', () => setTimeout(updateStats, 0));

  promptText.addEventListener('input', () => {
    const w = countWords(promptText.value);
    promptWc.textContent = `${w} word${w !== 1 ? 's' : ''}`;
    updateCostPreview('generate-cost', estimateGenerateCost(promptText.value));
  });
  promptText.addEventListener('paste', () => {
    setTimeout(() => {
      const w = countWords(promptText.value);
      promptWc.textContent = `${w} word${w !== 1 ? 's' : ''}`;
      updateCostPreview('generate-cost', estimateGenerateCost(promptText.value));
    }, 0);
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => selectLevel(pill.dataset.level));
  });

  // Mistake sliders
  optionsPanel?.querySelectorAll('.mistake-slider').forEach(slider => {
    const type = slider.dataset.mistake;
    updateSliderFill(slider);
    slider.addEventListener('input', () => {
      const valEl = optionsPanel?.querySelector(`.mistake-slider-val[data-mistake="${type}"]`);
      if (valEl) valEl.textContent = mistakeLabel(slider.value);
      updateSliderFill(slider);
      sessionStorage.setItem(`bipass_m_${type}`, slider.value);
      // Keep active style in sync with manual slider adjustments
      if (myStyleActive && savedStyle) {
        try {
          const traits = JSON.parse(savedStyle.style_summary);
          if (Array.isArray(traits)) {
            const kws = MISTAKE_KEYWORDS[type];
            const trait = traits.find(t => kws?.some(k => t.name?.toLowerCase().includes(k)));
            if (trait) {
              trait.intensity = parseInt(slider.value);
              savedStyle.style_summary = JSON.stringify(traits);
              const idx = savedStyles.findIndex(s => s.id === activeStyleId);
              if (idx !== -1) savedStyles[idx] = savedStyle;
              saveStoredStyles();
            }
          }
        } catch (_) {}
      }
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

  function updateDeleteVisibility() {
    const btns = sampleContainer.querySelectorAll('.sample-delete-btn');
    btns.forEach(b => { b.style.visibility = sampleCount <= 1 ? 'hidden' : ''; });
  }

  function makeSampleDeleteBtn(row) {
    const del = document.createElement('button');
    del.className = 'sample-delete-btn';
    del.type = 'button';
    del.setAttribute('aria-label', 'Remove sample');
    del.textContent = '×';
    del.addEventListener('click', () => {
      if (sampleCount <= 1) return;
      row.remove();
      sampleCount--;
      addSampleBtn.style.display = '';
      updateDeleteVisibility();
    });
    return del;
  }

  // Wire delete on the initial first sample
  document.querySelectorAll('.sample-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (sampleCount <= 1) return;
      btn.closest('.sample-row').remove();
      sampleCount--;
      addSampleBtn.style.display = '';
      updateDeleteVisibility();
    });
  });

  // Hide the single initial delete button on load
  updateDeleteVisibility();

  addSampleBtn.addEventListener('click', () => {
    if (sampleCount >= 5) return;
    sampleCount++;
    const row = document.createElement('div');
    row.className = 'sample-row';
    const ta = document.createElement('textarea');
    ta.className = 'style-sample-textarea';
    ta.id = `style-sample-${sampleCount}`;
    ta.placeholder = `Paste sample ${sampleCount}…`;
    ta.rows = 4;
    row.appendChild(ta);
    row.appendChild(makeSampleDeleteBtn(row));
    const wc = document.createElement('span');
    wc.className = 'sample-wc';
    wc.textContent = '0 / 50';
    row.appendChild(wc);
    sampleContainer.appendChild(row);
    if (sampleCount >= 5) addSampleBtn.style.display = 'none';
    updateDeleteVisibility();
  });

  analyzeStyleBtn.addEventListener('click', analyzeStyle);

  // Clear error borders as user types
  document.getElementById('style-name-input')?.addEventListener('input', function () {
    this.classList.remove('field-error');
  });
  sampleContainer.addEventListener('input', (e) => {
    if (!e.target.classList.contains('style-sample-textarea')) return;
    const ta = e.target;
    ta.classList.remove('field-error');
    const words = ta.value.trim() === '' ? 0 : ta.value.trim().split(/\s+/).length;
    const wc = ta.closest('.sample-row')?.querySelector('.sample-wc');
    if (wc) {
      wc.textContent = `${words} / 50`;
      wc.classList.toggle('wc-ok', words >= 50);
    }
  });

  // ── Mode tab switching ──────────────────────────
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('mode-tab-active'));
      btn.classList.add('mode-tab-active');
      const genSection = document.getElementById('generate-section');
      const humSection = document.getElementById('humanize-section');
      const levelHeading = document.getElementById('level-heading');
      if (mode === 'generate') {
        genSection.classList.remove('mode-hidden');
        humSection.classList.add('mode-hidden');
        if (levelHeading) levelHeading.textContent = 'Generate Level';
      } else {
        humSection.classList.remove('mode-hidden');
        genSection.classList.add('mode-hidden');
        if (levelHeading) levelHeading.textContent = 'Humanize Level';
      }
    });
  });
  // Start with humanize hidden
  document.getElementById('humanize-section').classList.add('mode-hidden');
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
  myStyleActive = !!savedStyle;
  sessionStorage.setItem('bipass_my_style', myStyleActive ? 'true' : 'false');
}

function deactivateMyStyle() {
  myStyleActive = false;
  sessionStorage.setItem('bipass_my_style', 'false');
}

let styleTraitSaveTimer = null;

function saveStoredStyles() {
  try {
    localStorage.setItem('bipass_styles_v1', JSON.stringify({ styles: savedStyles, activeId: activeStyleId }));
  } catch (_) {}
}

function saveStyleTraits() {
  saveStoredStyles();
  clearTimeout(styleTraitSaveTimer);
  styleTraitSaveTimer = setTimeout(async () => {
    try {
      const session = await window.bipassAuth.getSession();
      if (!session || !savedStyle) return;
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
  return raw.map(t => {
    if (typeof t === 'string') return { name: t, intensity: 10 };
    const intensity = t.intensity ?? 10;
    // Migrate old 0/1/2 scale → 0/5/10
    const migrated = intensity <= 2 ? intensity * 5 : intensity;
    return { name: t.name, intensity: migrated };
  });
}

function updateSliderFill(slider) {
  const pct = (parseInt(slider.value) / 10) * 100;
  slider.style.setProperty('--pct', `${pct}%`);
}

function mistakeLabel(v) {
  v = parseInt(v);
  if (v === 0) return 'None';
  if (v <= 2) return 'Subtle';
  if (v <= 5) return 'Moderate';
  if (v <= 8) return 'Strong';
  return 'Heavy';
}

function traitIntensityLabel(val) {
  if (val === 0)  return 'None';
  if (val <= 2)   return 'Very subtle';
  if (val <= 4)   return 'Subtle';
  if (val <= 6)   return 'Moderate';
  if (val <= 8)   return 'Strong';
  return 'Heavy';
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderTraitSliders(container, style) {
  const prevSaved = savedStyle;
  savedStyle = style;
  const traits = getTraits();
  savedStyle = prevSaved;

  container.innerHTML = `<div class="style-trait-rows">${
    traits.map((t, i) => `
      <div class="style-trait-row">
        <div class="trait-slider-head">
          <span class="style-trait-name">${escapeHtml(t.name)}</span>
          <span class="trait-slider-val">${traitIntensityLabel(t.intensity)}</span>
        </div>
        <input class="trait-slider" type="range" min="0" max="10" step="1"
               value="${t.intensity}" data-trait-idx="${i}" data-sid="${escapeHtml(style.id)}">
      </div>`).join('')
  }</div>`;

  container.querySelectorAll('.trait-slider').forEach(slider => {
    updateSliderFill(slider);
    slider.addEventListener('input', () => {
      const sid = slider.dataset.sid;
      const s = savedStyles.find(x => x.id === sid);
      if (!s) return;
      const prevSaved2 = savedStyle;
      savedStyle = s;
      const currentTraits = getTraits();
      savedStyle = prevSaved2;
      const idx = parseInt(slider.dataset.traitIdx);
      const val = parseInt(slider.value);
      slider.previousElementSibling.querySelector('.trait-slider-val').textContent = traitIntensityLabel(val);
      updateSliderFill(slider);
      currentTraits[idx].intensity = val;
      s.style_summary = JSON.stringify(currentTraits);
      if (s.id === activeStyleId) savedStyle = s;
      saveStyleTraits();
    });
  });
}

function showStyleDeleteModal(styleName, onConfirm) {
  const existing = document.getElementById('style-delete-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'style-delete-modal';
  modal.className = 'style-delete-modal-overlay';
  modal.innerHTML = `
    <div class="style-delete-modal-card">
      <div class="style-delete-modal-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      <div class="style-delete-modal-title">Delete style?</div>
      <div class="style-delete-modal-sub">
        "${escapeHtml(styleName)}" will be permanently removed.
      </div>
      <div class="style-delete-modal-actions">
        <button class="style-delete-modal-cancel">Cancel</button>
        <button class="style-delete-modal-confirm">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));

  const close = () => {
    modal.classList.remove('open');
    setTimeout(() => modal.remove(), 200);
  };

  modal.querySelector('.style-delete-modal-confirm').addEventListener('click', () => {
    close();
    onConfirm();
  });
  modal.querySelector('.style-delete-modal-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

function renderStyleList() {
  myStyleInputs.style.display = 'none';
  styleCardsList.style.display = 'flex';

  styleCardsList.innerHTML = savedStyles.map(style => {
    const isActive = style.id === activeStyleId;
    return `
      <div class="style-card ${isActive ? 'style-card-active' : ''}" data-id="${escapeHtml(style.id)}">
        <div class="style-card-header">
          <input class="style-card-name" type="text"
                 value="${escapeHtml(style.name || '')}"
                 placeholder="Name this style…" maxlength="30" />
          <div class="style-card-btns">
            <button class="style-use-btn ${isActive ? 'active' : ''}" data-id="${escapeHtml(style.id)}">
              ${isActive ? 'Active' : 'Use'}
            </button>
            <button class="style-delete-btn" data-id="${escapeHtml(style.id)}">✕</button>
          </div>
        </div>
      </div>`;
  }).join('') + `<button class="create-another-btn" id="create-another-btn">+ Create another style</button>`;

  styleCardsList.querySelectorAll('.style-card-name').forEach(input => {
    input.addEventListener('input', () => {
      const id = input.closest('[data-id]').dataset.id;
      const s = savedStyles.find(x => x.id === id);
      if (s) { s.name = input.value; saveStoredStyles(); }
    });
  });

  styleCardsList.querySelectorAll('.style-use-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const isAlreadyActive = btn.classList.contains('active');

      activeStyleId = id;
      savedStyle = savedStyles.find(s => s.id === id) || null;

      if (!isAlreadyActive) {
        saveStoredStyles();
        renderStyleList();
        // Switch to Custom level so sliders + style section are visible
        if (selectedLevel !== 'customize') selectLevel('customize');
      }

      myStyleActive = !!savedStyle;
      sessionStorage.setItem('bipass_my_style', myStyleActive ? 'true' : 'false');
      if (savedStyle) setSlidersFromStyle(savedStyle);
    });
  });

  styleCardsList.querySelectorAll('.style-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const styleName = savedStyles.find(s => s.id === id)?.name || 'this style';
      showStyleDeleteModal(styleName, () => {
        savedStyles = savedStyles.filter(s => s.id !== id);
        if (activeStyleId === id) {
          activeStyleId = savedStyles[0]?.id || null;
          savedStyle = savedStyles[0] || null;
        }
        saveStoredStyles();
        if (savedStyles.length === 0) {
          deactivateMyStyle();
          styleCardsList.style.display = 'none';
          myStyleInputs.style.display = '';
        } else {
          renderStyleList();
        }
      });
    });
  });



  document.getElementById('create-another-btn')?.addEventListener('click', () => {
    styleCardsList.style.display = 'none';
    myStyleInputs.style.display = '';
    if (!document.getElementById('back-to-styles-btn')) {
      const backBtn = document.createElement('button');
      backBtn.id = 'back-to-styles-btn';
      backBtn.className = 'reanalyze-link';
      backBtn.style.marginTop = '6px';
      backBtn.textContent = '← Back to styles';
      backBtn.addEventListener('click', () => { backBtn.remove(); renderStyleList(); });
      myStyleInputs.appendChild(backBtn);
    }
  });
}

async function loadSavedStyle(session) {
  // Load from localStorage first
  let loadedFromStorage = false;
  try {
    const raw = localStorage.getItem('bipass_styles_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      savedStyles = Array.isArray(parsed.styles) ? parsed.styles : [];
      activeStyleId = parsed.activeId || null;
      savedStyle = savedStyles.find(s => s.id === activeStyleId) || savedStyles[0] || null;
      if (savedStyle && !activeStyleId) activeStyleId = savedStyle.id;
      loadedFromStorage = true;
    }
  } catch (_) {}

  if (loadedFromStorage) {
    if (savedStyles.length > 0) {
      renderStyleList();
      if (myStyleActive && savedStyle) {
        activateMyStyle();
        setSlidersFromStyle(savedStyle);
      }
    }
    return;
  }

  // Fallback: migrate legacy single style from Supabase
  try {
    const { data } = await window.bipassAuth.client
      .from('user_styles')
      .select('style_summary, style_prompt')
      .eq('user_id', session.user.id)
      .single();
    if (data) {
      const id = Date.now().toString();
      savedStyles = [{ id, name: '', style_summary: data.style_summary, style_prompt: data.style_prompt }];
      activeStyleId = id;
      savedStyle = savedStyles[0];
      saveStoredStyles();
      renderStyleList();
      if (myStyleActive) activateMyStyle();
    }
  } catch (_) {}
}

async function analyzeStyle() {
  let valid = true;

  // Validate style name
  const nameInput = document.getElementById('style-name-input');
  if (!nameInput?.value.trim()) {
    nameInput?.classList.add('field-error');
    valid = false;
  }

  // Validate each sample — must have ≥ 50 words
  const textareas = Array.from(document.querySelectorAll('.style-sample-textarea'));
  const samples = [];
  textareas.forEach(ta => {
    const text = ta.value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    if (words < 50) {
      ta.classList.add('field-error');
      valid = false;
    } else {
      samples.push(text);
    }
  });

  if (!valid) return;

  analyzeLabel.style.display  = 'none';
  analyzeLoader.style.display = '';
  analyzeLoader.textContent   = 'Analyzing.';
  analyzeStyleBtn.disabled    = true;

  let _dotCount = 1;
  const _dotsTimer = setInterval(() => {
    _dotCount = (_dotCount % 3) + 1;
    analyzeLoader.textContent = 'Analyzing' + '.'.repeat(_dotCount);
  }, 450);

  const prompt = `Analyze these writing samples. Return ONLY a single-line JSON object — no markdown, no code fences, no line breaks inside the JSON, no explanation before or after.

Look for personal writing habits that appear regardless of topic: spelling errors, grammar mistakes, missing or wrong capitalisation, punctuation habits, repeated words, run-on sentences, vocabulary level. Ignore sentence length or writing structure — those depend on the topic.

Use this exact format (replace the example values with real findings, keep it on ONE LINE):
{"traits":[{"name":"Grammar mistakes","intensity":7},{"name":"Missing capitals","intensity":4},{"name":"Word repetition","intensity":9}],"style_prompt":"A single paragraph describing this person's specific writing quirks for an AI to replicate. End with: Apply these personal quirks to whatever format the user requests."}

intensity must be 0–10 where 0=none, 1–2=very subtle, 3–4=subtle, 5–6=moderate, 7–8=strong, 9–10=heavy. Use the full range to accurately reflect how prominently each trait appears in the samples. Include up to 7 traits.

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

    const styleName = document.getElementById('style-name-input')?.value.trim() || '';
    const newStyle = {
      id: Date.now().toString(),
      name: styleName,
      style_summary: JSON.stringify(normTraits),
      style_prompt: json.style_prompt,
    };
    savedStyles.push(newStyle);
    activeStyleId = newStyle.id;
    savedStyle = newStyle;
    saveStoredStyles();
    document.getElementById('back-to-styles-btn')?.remove();
    renderStyleList();
    const nameInput = document.getElementById('style-name-input');
    if (nameInput) nameInput.value = '';
    showToast('Style analyzed');
    myStyleActive = true;
    sessionStorage.setItem('bipass_my_style', 'true');
    setSlidersFromStyle(newStyle);

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
    clearInterval(_dotsTimer);
    analyzeLabel.style.display  = '';
    analyzeLoader.style.display = 'none';
    analyzeStyleBtn.disabled    = false;
  }
}

// ─── Stats ────────────────────────────────────────────────────

function countWords(val) {
  return val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
}

function estimateGenerateCost(prompt) {
  const match = prompt.match(/(\d[\d,]*)[- ]word/i);
  if (!match) return null;
  const words = parseInt(match[1].replace(/,/g, ''));
  return Math.round(words * 5);
}

function updateCostPreview(elId, chars) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (chars === null && elId === 'generate-cost') {
    const hasText = document.getElementById('prompt-text')?.value.trim();
    if (hasText) {
      el.textContent = 'cost varies with output length';
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
      el.textContent = '';
    }
    return;
  }
  if (!chars) { el.classList.add('hidden'); el.textContent = ''; return; }
  el.textContent = `≈ ${chars.toLocaleString()} credits`;
  el.classList.remove('hidden');
}

function updateStats() {
  const val   = inputText.value;
  const words = countWords(val);
  charCount.textContent  = val.length.toLocaleString();
  wordCount.textContent  = words.toLocaleString();
  humanizeWc.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  updateCostPreview('humanize-cost', val.length || null);
}

// ─── Build prompts ────────────────────────────────────────────

const MISTAKE_KEYWORDS = {
  grammar:  ['grammar', 'grammatical'],
  tense:    ['tense', 'verb'],
  punct:    ['punctuation', 'punct', 'comma', 'period'],
  caps:     ['capital', 'capitalization'],
  spelling: ['spelling', 'typo', 'spell'],
};

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
  const slider = optionsPanel?.querySelector(`input.mistake-slider[data-mistake="${type}"]`);
  if (!slider) return 0;
  const val = parseInt(slider.value);
  if (val <= 2) return 0;
  if (val <= 6) return 1;
  return 2;
}

function setSlidersFromStyle(style) {
  let traits = [];
  try { traits = JSON.parse(style.style_summary); } catch (_) {}
  if (!Array.isArray(traits)) traits = [];

  for (const [type, kws] of Object.entries(MISTAKE_KEYWORDS)) {
    const trait = traits.find(t => kws.some(k => t.name?.toLowerCase().includes(k)));
    const slider = optionsPanel?.querySelector(`input.mistake-slider[data-mistake="${type}"]`);
    if (!slider) continue;
    const intensity = trait ? Math.round(typeof trait.intensity === 'number' ? trait.intensity : 0) : 0;
    const mapped = intensity <= 2 ? intensity * 5 : intensity; // migrate old 0/1/2 scale
    slider.value = Math.min(10, mapped);
    updateSliderFill(slider);
    const valEl = optionsPanel?.querySelector(`.mistake-slider-val[data-mistake="${type}"]`);
    if (valEl) valEl.textContent = mistakeLabel(slider.value);
  }
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
  function intensityWord(v) {
    if (v <= 2)  return 'very subtly';
    if (v <= 4)  return 'subtly';
    if (v <= 6)  return 'moderately';
    if (v <= 8)  return 'quite a lot';
    return 'heavily';
  }
  const active = traits.filter(t => t.intensity > 0)
    .map(t => `${t.name} (${intensityWord(t.intensity)})`).join(', ');
  return active ? `\nApply these writing traits at the given levels: ${active}.` : '';
}

function buildHumanizePrompt(text) {
  if (myStyleActive && savedStyle) {
    // Combined: full style description + specific mistake levels from sliders
    const extras = buildMistakeExtras();
    let prompt = savedStyle.style_prompt;
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
    return prompt + `\n\nText to rewrite:\n${text}`;
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
    const extras = buildMistakeExtras();
    let prompt = savedStyle.style_prompt;
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
    return prompt + `\n\nWhat to write:\n${userPrompt}`;
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

  updateCostPreview('generate-cost', null);
  saveState('generate');
  setLoading(true, 'Generating your text…');

  try {
    const result = await callAPIStream(buildGeneratePrompt(prompt));
    await new Promise(r => setTimeout(r, 1200));
    sessionStorage.setItem('bipass_result', result);
    sessionStorage.setItem('bipass_mode', 'generate');
    window.location.href = 'editor.html';
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'CreditError') return;
    setLoading(false);
    showToast(err.message || 'Something went wrong');
    setStatus('Error');
  }
}

// ─── Humanize ─────────────────────────────────────────────────

async function humanize() {
  const text = inputText.value.trim();
  if (!text) { showToast('Paste some text first'); inputText.focus(); return; }

  updateCostPreview('humanize-cost', null);
  saveState('humanize');
  setLoading(true, 'Humanizing your text…');

  try {
    const result = await callAPIStream(buildHumanizePrompt(text));
    await new Promise(r => setTimeout(r, 1200));
    sessionStorage.setItem('bipass_result', result);
    sessionStorage.setItem('bipass_mode', 'humanize');
    window.location.href = 'editor.html';
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'CreditError') return;
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
    const data = await res.json().catch(() => ({}));
    const msg = data.error || 'No credits remaining';
    setLoading(false);
    // Refresh plan status so badge updates immediately
    window.bipassAuth.refreshSession().then(fresh => {
      if (fresh) bipassSetupPlanStatus(fresh);
    }).catch(() => {});
    showCreditWarning(msg);
    throw Object.assign(new Error(msg), { name: 'CreditError' });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Server error ${res.status}`);
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  const credEl = document.getElementById('loading-credits');
  let buffer = '';
  let accumulated = '';
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
        if (json.chunk) {
          accumulated += json.chunk;
        }
        if (json.done) {
          finalResult = json.result;
          creditsData = { creditsUsed: json.creditsUsed, creditsRemaining: json.creditsRemaining };
          sessionStorage.setItem('bipass_tokens', JSON.stringify({
            input: json.inputTokens || 0,
            output: json.outputTokens || 0,
          }));
        }
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e;
      }
    }
  }

  if (!finalResult) {
    if (accumulated.trim()) finalResult = accumulated.trim();
    else throw new Error('No output received');
  }
  if (creditsData) {
    updateCreditDisplay(creditsData.creditsUsed, creditsData.creditsRemaining);
    animateLoadingCredits(creditsData.creditsUsed);
  }
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

function animateLoadingCredits(total) {
  const wrapEl = document.getElementById('loading-credits-wrap');
  const numEl  = document.getElementById('loading-credits');
  if (!wrapEl || !numEl) return;
  numEl.textContent = '0';
  wrapEl.style.transition = 'opacity 0.25s ease';
  wrapEl.style.opacity = '1';
  animateCount(numEl, 0, total, 650);
}

function animateCount(el, from, to, duration = 700) {
  if (from === to || isNaN(from)) { el.textContent = to.toLocaleString(); return; }
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * ease).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateCreditDisplay(used, remaining) {
  const valEl  = document.getElementById('credit-val');
  const badgeEl = document.getElementById('credit-used-badge');
  if (valEl) {
    const current = parseInt(valEl.textContent.replace(/[^0-9]/g, '')) || 0;
    animateCount(valEl, current, remaining);
  }
  if (badgeEl) {
    badgeEl.textContent = '−0 credits';
    badgeEl.classList.remove('hidden', 'credit-used-animate');
    void badgeEl.offsetWidth;
    badgeEl.classList.add('credit-used-animate');
    const badgeStart = performance.now();
    const badgeDur = 700;
    (function tickBadge(now) {
      const p = Math.min((now - badgeStart) / badgeDur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      badgeEl.textContent = `−${Math.round(used * ease).toLocaleString()} credits`;
      if (p < 1) requestAnimationFrame(tickBadge);
    })(performance.now());
  }
  // Confirm with a fresh server-side value a moment later
  setTimeout(() => {
    window.bipassAuth.refreshCredits().then(fresh => {
      if (fresh !== null && valEl) animateCount(valEl, remaining, fresh, 400);
    }).catch(() => {});
  }, 1500);
}

// ─── Loading overlay ──────────────────────────────────────────

function showCreditWarning(msg) {
  const modal = document.getElementById('no-plan-modal');
  const bodyEl = document.getElementById('no-plan-modal-body');
  if (!modal) { showToast(msg + ' — visit Plans'); return; }
  if (bodyEl && msg) bodyEl.textContent = msg;
  modal.classList.remove('hidden');
  requestAnimationFrame(() => modal.classList.add('show'));
  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => modal.classList.add('hidden'), 250);
  }
  document.getElementById('no-plan-modal-close')?.addEventListener('click', closeModal, { once: true });
  document.getElementById('no-plan-modal-dismiss')?.addEventListener('click', closeModal, { once: true });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); }, { once: true });
}

function setLoading(on, text) {
  generateBtn.disabled = on;
  humanizeBtn.disabled = on;

  if (on) {
    loadingText.textContent = text || 'Loading…';
    const credEl  = document.getElementById('loading-credits');
    const wrapEl  = document.getElementById('loading-credits-wrap');
    if (credEl)  credEl.textContent = '0';
    if (wrapEl)  { wrapEl.style.transition = 'none'; wrapEl.style.opacity = '0'; }
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

// ─── Ticker bar dismiss ───────────────────────────────────────

(function () {
  const bar = document.getElementById('ticker-bar');
  const btn = document.getElementById('ticker-close-btn');
  if (!bar || !btn) return;
  if (localStorage.getItem('ticker-dismissed') === '1') bar.classList.add('hidden');
  btn.addEventListener('click', () => {
    bar.classList.add('hidden');
    localStorage.setItem('ticker-dismissed', '1');
  });
})();

// ─── Extension popup (first-visit onboarding) ─────────────────
(function () {
  const popup    = document.getElementById('ext-popup');
  const closeBtn = document.getElementById('ext-popup-close');
  const extBtn   = document.querySelector('.nav-ext-btn');
  if (!popup || !extBtn) return;

  function positionPopup() {
    const r  = extBtn.getBoundingClientRect();
    const pw = 340;
    let left = r.left + r.width / 2 - pw / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
    popup.style.top  = (r.bottom + 10) + 'px';
    popup.style.left = left + 'px';
    const arrow = popup.querySelector('.ext-popup-arrow');
    if (arrow) arrow.style.left = (r.left + r.width / 2 - left) + 'px';
  }

  function showPopup() {
    positionPopup();
    popup.classList.add('show');
    localStorage.setItem('ext_popup_seen', '1');
  }

  function hidePopup() { popup.classList.remove('show'); }

  extBtn.addEventListener('click', (e) => {
    e.preventDefault();
    popup.classList.contains('show') ? hidePopup() : showPopup();
  });

  closeBtn?.addEventListener('click', hidePopup);

  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && !extBtn.contains(e.target)) hidePopup();
  });

  window.__bipassShowExtPopup = showPopup;

  if (!localStorage.getItem('ext_popup_seen') && !document.getElementById('welcome-modal')) {
    setTimeout(showPopup, 1400);
  }
})();

// ─── Own Text → Extension ────────────────────────────────────

(function () {
  const btn      = document.getElementById('own-text-push-btn');
  const textarea = document.getElementById('own-text-textarea');
  const label    = document.getElementById('own-text-btn-label');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const text = textarea?.value?.trim();
    if (!text) { textarea?.focus(); return; }

    btn.disabled = true;
    label.textContent = 'Pushing…';

    try {
      const session = await window.bipassAuth.getSession();
      if (!session) throw new Error('Not signed in');

      const { error } = await window.bipassAuth.client
        .from('results')
        .insert({ user_id: session.user.id, text, mode: 'humanize', level: 'easy', ext_push: true });
      if (error) throw error;

      label.textContent = '✓ Pushed to Extension';
      btn.classList.add('pushed');
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('pushed');
        label.textContent = 'Push to Extension';
      }, 3000);
    } catch {
      btn.disabled = false;
      label.textContent = '↻ Try Again';
      setTimeout(() => { label.textContent = 'Push to Extension'; }, 2500);
    }
  });
})();

// ─── Start ────────────────────────────────────────────────────

init();
