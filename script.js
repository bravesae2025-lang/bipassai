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
Do NOT use hyphens (-) or em dashes anywhere in the text — this is the #1 AI tell. Zero dashes, full stop.
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

Pick 3–4 of these and let them show up naturally. Don't force all of them.
Never use em dashes (—) or hyphens as em dashes (word - word mid-sentence) — #1 AI tell, zero dashes.
Replace AI words immediately: "utilize"→"use" | "leverage"→"use" | "crucial"→"really important" | "significant/significantly"→"big" | "robust"→"strong" | "individuals"→"people" | "comprehensive"→"complete" | "furthermore"→"also" | "realm"→"area" | "severity"→"how bad it is" | "methodology"→"method" | "facilitate"→"help" | "paramount"→"most important" | "groundbreaking"→"new" | "ultimately"→"in the end" | "scarcity/scarcities"→"shortage" | "intricate"→"complex" | "foster"→"help" | "harness"→"use" | "mitigate"→"reduce" | "palpable"→"real" | "seamless"→"smooth" | "demonstrate"→"show" | "assist"→"help" | "numerous"→"many" | "various"→"different" | "ensure"→"make sure" | "obtain"→"get" | "regarding"→"about" | "hence/thus/therefore"→"so" | "additionally"→"also" | "whilst"→"while"
Never use: "it's worth noting", "certainly", "in conclusion", "delve", "cornerstone", "game-changing", "invaluable", "synergy", "impactful", "plays a crucial role", "serves as a testament", perfectly balanced opinions, fake-deep transitions, conclusion summaries, or equal sentence energy throughout.
Return only the rewritten text, nothing else.`,

  hard: `Rewrite the following text so it sounds like a confident, capable person wrote it. The humanness should be subtle — texture, not obvious mistakes. Use only 2–3 of these traits, once or twice each:

- Uneven rhythm — most of it flows well, but one part speeds up or lingers slightly longer than it should.
- One slight contradiction or emotional inconsistency: "it worked fine. Though honestly it kind of annoyed me."
- One moment of real uncertainty: "I don't fully know why" or "maybe I'm wrong about this."
- Strong opinion stated without diplomatic hedging — pick a side and sound sure of it.
- One unexpected specific detail that leaks in naturally.
- One sentence that's longer and a little messier than the rest.

Only use 2–3 of these. A skilled writer's humanness is subtle, not loud.
Never use em dashes (—) or hyphens as em dashes (word - word mid-sentence) — #1 AI tell, zero dashes anywhere.
Replace AI words immediately: "utilize"→"use" | "leverage"→"use" | "crucial"→"really important" | "significant/significantly"→"big" | "robust"→"strong" | "individuals"→"people" | "comprehensive"→"complete" | "furthermore"→"also" | "realm"→"area" | "severity"→"how bad it is" | "methodology"→"method" | "facilitate"→"help" | "paramount"→"most important" | "groundbreaking"→"new" | "ultimately"→"in the end" | "scarcity/scarcities"→"shortage" | "intricate"→"complex" | "foster"→"help" | "harness"→"use" | "mitigate"→"reduce" | "palpable"→"real" | "seamless"→"smooth" | "demonstrate"→"show" | "assist"→"help" | "numerous"→"many" | "various"→"different" | "ensure"→"make sure" | "obtain"→"get" | "regarding"→"about" | "hence/thus/therefore"→"so" | "additionally"→"also" | "whilst"→"while"
Absolutely avoid: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", "cornerstone", "game-changing", "invaluable", "synergy", "impactful", "plays a crucial role", "serves as a testament", perfect paragraph symmetry, fake-deep transitions like "at the end of the day", conclusion summaries after every point.
Return only the rewritten text, nothing else.`,

  customize: `Rewrite the following text to sound naturally human-written. Apply only the specific human traits listed below — do not add any other changes beyond what is listed.
Never use em dashes (—) or hyphens as em dashes (word - word) — #1 AI tell. Zero dashes.
Replace AI words: "utilize"→"use", "leverage"→"use", "crucial"→"really important", "significant"→"big", "robust"→"strong", "individuals"→"people", "comprehensive"→"complete", "furthermore"→"also", "realm"→"area", "severity"→"how bad it is", "methodology"→"method", "facilitate"→"help", "paramount"→"most important", "groundbreaking"→"new", "ultimately"→"in the end", "scarcity/scarcities"→"shortage"
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
Do NOT use em dashes (—) or hyphens as em dashes (word - word) — #1 AI tell. Zero dashes anywhere.
Replace AI words immediately: "utilize"→"use" | "leverage"→"use" | "crucial"→"really important" | "significant/significantly"→"big" | "robust"→"strong" | "individuals"→"people" | "comprehensive"→"complete" | "furthermore"→"also" | "realm"→"area" | "severity"→"how bad it is" | "methodology"→"method" | "facilitate"→"help" | "paramount"→"most important" | "groundbreaking"→"new" | "ultimately"→"in the end" | "scarcity/scarcities"→"shortage" | "intricate"→"complex" | "foster"→"help" | "harness"→"use" | "mitigate"→"reduce" | "palpable"→"real" | "seamless"→"smooth" | "demonstrate"→"show" | "assist"→"help" | "numerous"→"many" | "various"→"different" | "ensure"→"make sure" | "obtain"→"get" | "regarding"→"about" | "hence/thus/therefore"→"so" | "additionally"→"also" | "whilst"→"while"
Never use: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", "in today's world", "cornerstone", "game-changing", "invaluable", "synergy", "impactful", "plays a crucial role", "serves as a testament", or conclusion summaries.
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
Never use em dashes (—) or hyphens as em dashes (word - word mid-sentence) — #1 AI tell, zero dashes.
Replace AI words immediately: "utilize"→"use" | "leverage"→"use" | "crucial"→"really important" | "significant/significantly"→"big" | "robust"→"strong" | "individuals"→"people" | "comprehensive"→"complete" | "furthermore"→"also" | "realm"→"area" | "severity"→"how bad it is" | "methodology"→"method" | "facilitate"→"help" | "paramount"→"most important" | "groundbreaking"→"new" | "ultimately"→"in the end" | "scarcity/scarcities"→"shortage" | "intricate"→"complex" | "foster"→"help" | "harness"→"use" | "mitigate"→"reduce" | "palpable"→"real" | "seamless"→"smooth" | "demonstrate"→"show" | "assist"→"help" | "numerous"→"many" | "various"→"different" | "ensure"→"make sure" | "obtain"→"get" | "regarding"→"about" | "hence/thus/therefore"→"so" | "additionally"→"also" | "whilst"→"while"
Never use: "it's worth noting", "certainly", "in conclusion", "delve", "cornerstone", "game-changing", "invaluable", "synergy", "impactful", "plays a crucial role", "serves as a testament", conclusion summaries, or equal sentence energy throughout.
Return only the written text, nothing else.`,

  hard: `Write the following the way a confident, capable person would — like they wrote it quickly and didn't over-edit. The humanness should be subtle. Use only 2–3 of these traits, once or twice each:

- Uneven rhythm — mostly flows, but one part speeds up or lingers a bit.
- One slight contradiction: "it worked. Though honestly it kind of annoyed me."
- One moment of real uncertainty: "I don't fully know why" or "maybe I'm wrong."
- Strong opinion without diplomatic hedging — pick a side and sound sure.
- One unexpected specific detail that leaks in naturally.
- One sentence longer and a little messier than the rest.

Only 2–3 traits. Subtlety is the point.
Never use em dashes (—) or hyphens as em dashes (word - word mid-sentence) — #1 AI tell, zero dashes anywhere.
Replace AI words immediately: "utilize"→"use" | "leverage"→"use" | "crucial"→"really important" | "significant/significantly"→"big" | "robust"→"strong" | "individuals"→"people" | "comprehensive"→"complete" | "furthermore"→"also" | "realm"→"area" | "severity"→"how bad it is" | "methodology"→"method" | "facilitate"→"help" | "paramount"→"most important" | "groundbreaking"→"new" | "ultimately"→"in the end" | "scarcity/scarcities"→"shortage" | "intricate"→"complex" | "foster"→"help" | "harness"→"use" | "mitigate"→"reduce" | "palpable"→"real" | "seamless"→"smooth" | "demonstrate"→"show" | "assist"→"help" | "numerous"→"many" | "various"→"different" | "ensure"→"make sure" | "obtain"→"get" | "regarding"→"about" | "hence/thus/therefore"→"so" | "additionally"→"also" | "whilst"→"while"
Absolutely avoid: "it's worth noting", "certainly", "in conclusion", "delve", "it's important to note", "cornerstone", "game-changing", "invaluable", "synergy", "impactful", "plays a crucial role", "serves as a testament", fake-deep transitions, conclusion summaries.
Return only the written text, nothing else.`,

  customize: `Write the following to sound naturally human-written. Apply only the specific human traits listed below — do not add any other changes beyond what is listed.
Never use em dashes (—) or hyphens as em dashes (word - word) — #1 AI tell. Zero dashes.
Replace AI words: "utilize"→"use", "leverage"→"use", "crucial"→"really important", "significant"→"big", "robust"→"strong", "individuals"→"people", "comprehensive"→"complete", "furthermore"→"also", "realm"→"area", "severity"→"how bad it is", "methodology"→"method", "facilitate"→"help", "paramount"→"most important", "groundbreaking"→"new", "ultimately"→"in the end", "scarcity/scarcities"→"shortage"
Return only the written text, nothing else.`,
};

// ─── State ────────────────────────────────────────────────────

let selectedLevel = 'easy';

// ─── Elements ─────────────────────────────────────────────────

const promptText      = document.getElementById('prompt-text');
const inputText       = document.getElementById('input-text');
const promptWc        = document.getElementById('prompt-wc');
const humanizeWc      = document.getElementById('humanize-wc');
const outputWc        = document.getElementById('output-wc');
const generateBtn     = document.getElementById('generate-btn');
const generateLabel   = document.getElementById('generate-label');
const generateLoader  = document.getElementById('generate-loader');
const humanizeBtn     = document.getElementById('humanize-btn');
const humanizeLabel   = document.getElementById('humanize-label');
const humanizeLoader  = document.getElementById('humanize-loader');
const copyBtn         = document.getElementById('copy-btn');
const charCount       = document.getElementById('char-count');
const wordCount       = document.getElementById('word-count');
const levelDesc       = document.getElementById('level-desc');
const levelLabel      = document.getElementById('level-label');
const levelGlider     = document.getElementById('level-glider');
const statusLabel     = document.getElementById('status-label');
const pills           = document.querySelectorAll('.level-btn');
const grammarToggle   = document.getElementById('grammar-toggle');
const punctToggle     = document.getElementById('punct-toggle');
const toast           = document.getElementById('toast');
const generateSection = document.getElementById('generate-section');
const humanizeSection = document.getElementById('humanize-section');
const divider         = document.getElementById('divider');
const outputCard      = document.getElementById('output-card');
const outputBody      = document.getElementById('output-body');

// ─── Init ─────────────────────────────────────────────────────

function init() {
  updateStats();
  bindEvents();
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
  copyBtn.addEventListener('click', copyOutput);
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

// ─── Build humanize prompt ────────────────────────────────────

function buildHumanizePrompt(text) {
  let prompt = HUMANIZE_PROMPTS[selectedLevel];
  const extras = [];
  if (grammarToggle.checked) extras.push('Also include a few subtle grammar mistakes that a real person might make.');
  if (punctToggle.checked)   extras.push('Also use inconsistent punctuation — sometimes miss a comma, use a dash instead of a period, etc.');
  if (extras.length > 0) prompt += '\n\n' + extras.join(' ');
  prompt += `\n\nText to rewrite:\n${text}`;
  return prompt;
}

// ─── Build generate prompt ────────────────────────────────────

function buildGeneratePrompt(userPrompt) {
  let prompt = GENERATE_PROMPTS[selectedLevel];
  const extras = [];
  if (grammarToggle.checked) extras.push('Include a few subtle grammar mistakes that a real person might make.');
  if (punctToggle.checked)   extras.push('Use inconsistent punctuation — sometimes miss a comma, use a dash instead of a period, etc.');
  if (extras.length > 0) prompt += ' ' + extras.join(' ');
  prompt += `\n\nWhat to write:\n${userPrompt}`;
  return prompt;
}

// ─── Generate new text from prompt ───────────────────────────

async function generateNew() {
  const prompt = promptText.value.trim();
  if (!prompt) {
    showToast('Enter a prompt first');
    promptText.focus();
    return;
  }

  setGenerateLoading(true);
  startProgress(generateBtn);

  try {
    const result = await callAPI(buildGeneratePrompt(prompt));
    outputBody.textContent = result;
    const ow = countWords(result);
    outputWc.textContent = `${ow} word${ow !== 1 ? 's' : ''}`;
    showOutputAfter(generateSection, humanizeSection);
    setStatus('Done');
    showToast('Done');
  } catch (err) {
    setStatus('Error');
    showToast(err.message || 'Something went wrong');
  } finally {
    setGenerateLoading(false);
    finishProgress();
  }
}

// ─── Humanize existing text ───────────────────────────────────

async function humanize() {
  const text = inputText.value.trim();
  if (!text) {
    showToast('Paste some text first');
    inputText.focus();
    return;
  }

  setHumanizeLoading(true);
  startProgress(humanizeBtn);

  try {
    const result = await callAPI(buildHumanizePrompt(text));
    outputBody.textContent = result;
    const ow = countWords(result);
    outputWc.textContent = `${ow} word${ow !== 1 ? 's' : ''}`;
    showOutputAfter(humanizeSection, generateSection);
    setStatus('Done');
    showToast('Done');
  } catch (err) {
    setStatus('Error');
    showToast(err.message || 'Something went wrong');
  } finally {
    setHumanizeLoading(false);
    finishProgress();
  }
}

// ─── API call ─────────────────────────────────────────────────

async function callAPI(prompt) {
  const res = await fetch('http://localhost:3000/api/humanize', {
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

// ─── Progress bar ─────────────────────────────────────────────

let progressTimer;
let progressVal  = 0;
let progressBar  = null;

function startProgress(afterBtn) {
  // Remove any old bar
  if (progressBar) progressBar.remove();

  progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  afterBtn.insertAdjacentElement('afterend', progressBar);

  clearInterval(progressTimer);
  progressVal = 0;
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';

  requestAnimationFrame(() => {
    progressBar.classList.add('active');
    progressBar.style.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
    progressTimer = setInterval(() => {
      const step = (90 - progressVal) * 0.04;
      progressVal = Math.min(progressVal + step, 90);
      progressBar.style.width = progressVal + '%';
    }, 200);
  });
}

function finishProgress() {
  if (!progressBar) return;
  clearInterval(progressTimer);
  progressBar.style.width = '100%';
  setTimeout(() => {
    progressBar.classList.remove('active');
    setTimeout(() => { if (progressBar) progressBar.remove(); progressBar = null; }, 300);
  }, 300);
}

// ─── Show output card in the section that was used ───────────

function showOutputAfter(activeSection, fadedSection) {
  fadedSection.classList.add('faded');
  divider.classList.add('faded');

  outputCard.classList.remove('hidden');
  outputCard.classList.remove('visible');
  activeSection.appendChild(outputCard);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      outputCard.classList.add('visible');
      setTimeout(() => {
        outputCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    });
  });
}

// ─── Copy output ──────────────────────────────────────────────

async function copyOutput() {
  const text = outputBody.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  } catch {
    showToast('Copied');
  }
}

// ─── Loading states ───────────────────────────────────────────

function setGenerateLoading(on) {
  generateBtn.disabled    = on;
  humanizeBtn.disabled    = on;
  generateLabel.textContent = on ? 'Generating...' : 'Generate';
  generateLoader.classList.toggle('hidden', !on);
  setStatus(on ? 'Generating…' : 'Ready');
  if (on) statusLabel.classList.add('active');
  else setTimeout(() => statusLabel.classList.remove('active'), 1000);
}

function setHumanizeLoading(on) {
  generateBtn.disabled    = on;
  humanizeBtn.disabled    = on;
  humanizeLabel.textContent = on ? 'Humanizing...' : 'Humanize';
  humanizeLoader.classList.toggle('hidden', !on);
  setStatus(on ? 'Humanizing…' : 'Ready');
  if (on) statusLabel.classList.add('active');
  else setTimeout(() => statusLabel.classList.remove('active'), 1000);
}

// ─── Status label ─────────────────────────────────────────────

function setStatus(text) {
  statusLabel.textContent = text;
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

// ─── Navbar hide on scroll down ───────────────────────────────

(function () {
  const navbar = document.querySelector('.navbar');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y    = window.scrollY;
    const diff = y - lastY;
    if (diff > 6 && y > 80) navbar.classList.add('hidden');
    else if (diff < -6)     navbar.classList.remove('hidden');
    lastY = y;
  }, { passive: true });
})();

// ─── FAQ accordion ────────────────────────────────────────────

document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ─── Start ────────────────────────────────────────────────────

init();
