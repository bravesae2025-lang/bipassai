// ─── TESTER VERSION — no auth, pre-loaded sample text ───────────

const TEST_TEXT = `This is a sample text for the Bipass AI Auto Typer extension. It types text character by character into any text field, with natural human-like speed and pauses. You can adjust the typing speed, add mistyping effects, and set a target duration. To use it, click Start Typing below, then switch to any page with a text field and press the play button that appears.`;

let currentText     = '';
let currentSpeed    = 90;
let currentDuration = 0;
let currentMistype  = 0;

const states = ['loading', 'login', 'upgrade', 'empty', 'list', 'ready', 'armed'];
function showState(name) {
  states.forEach(s => document.getElementById(`state-${s}`).classList.remove('active'));
  document.getElementById(`state-${name}`).classList.add('active');
  const footer = document.getElementById('account-footer');
  if (footer) footer.style.display = 'none';
}

function countWords(str) {
  return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
}

function selectResult(text) {
  currentText = text;
  const words = countWords(text);
  document.getElementById('preview-text').textContent = text;
  document.getElementById('preview-wc').textContent   = `${words} word${words !== 1 ? 's' : ''}`;
  document.getElementById('preview-mode').textContent = 'Sample';
  showState('ready');
}

// ── Mistype info tooltip ─────────────────────────────────────────
const mistypeInfoBtn = document.getElementById('mistype-info-btn');
const mistypePopup   = document.getElementById('mistype-popup');
mistypeInfoBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mistypePopup.classList.toggle('open');
});
document.addEventListener('click', () => mistypePopup.classList.remove('open'));

// ── Mistype slider ──────────────────────────────────────────────
const MISTYPE_LABELS = ['None', 'A little', 'Some', 'More', 'A lot'];
const mistypeSlider  = document.getElementById('mistype-slider');
const mistypeLabel   = document.getElementById('mistype-val-label');
mistypeSlider.addEventListener('input', () => {
  currentMistype = parseInt(mistypeSlider.value);
  mistypeLabel.textContent = MISTYPE_LABELS[currentMistype];
});

// ── Speed buttons ───────────────────────────────────────────────
document.querySelectorAll('.spd-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.spd-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSpeed = parseInt(btn.dataset.spd);
  });
});

// ── Duration buttons ────────────────────────────────────────────
const durCustomRow = document.getElementById('dur-custom-row');
const durCustomVal = document.getElementById('dur-custom-val');

document.querySelectorAll('.dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const val = btn.dataset.dur;
    if (val === 'custom') {
      durCustomRow.style.display = 'flex';
      currentDuration = parseInt(durCustomVal.value || 15) * 60000;
    } else {
      durCustomRow.style.display = 'none';
      currentDuration = parseInt(val) * 60000;
    }
  });
});

durCustomVal.addEventListener('input', () => {
  const mins = Math.max(1, Math.min(120, parseInt(durCustomVal.value) || 1));
  currentDuration = mins * 60000;
});

// ── Start button ────────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', async () => {
  if (!currentText) return;
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab) return;
  try { await chrome.scripting.executeScript({ target: { tabId: activeTab.id }, files: ['content.js'] }); } catch {}
  await chrome.tabs.sendMessage(activeTab.id, { type: 'ARM', text: currentText, speed: currentSpeed, targetDuration: currentDuration, mistyping: currentMistype });
  showState('armed');
});

// ── Cancel button ───────────────────────────────────────────────
document.getElementById('cancel-btn').addEventListener('click', async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) chrome.tabs.sendMessage(activeTab.id, { type: 'STOP' }).catch(() => {});
  showState('ready');
});

// ── Back button ─────────────────────────────────────────────────
document.getElementById('back-btn').addEventListener('click', () => {
  selectResult(TEST_TEXT);
});

// ── Init — skip auth, go straight to ready ──────────────────────
selectResult(TEST_TEXT);
