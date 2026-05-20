let currentText = '';
let currentSpeed = 45;

const states = ['loading', 'empty', 'ready', 'armed'];
function showState(name) {
  states.forEach(s => document.getElementById(`state-${s}`).classList.remove('active'));
  document.getElementById(`state-${name}`).classList.add('active');
}

function countWords(str) {
  return str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
}

async function loadText() {
  showState('loading');

  try {
    const tabs = await chrome.tabs.query({
      url: ['https://bipassai.com/*', 'https://www.bipassai.com/*']
    });

    if (tabs.length === 0) { showState('empty'); return; }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => ({
        result: sessionStorage.getItem('bipass_result'),
        mode:   sessionStorage.getItem('bipass_mode'),
      }),
    });

    const data = results[0]?.result;
    if (!data?.result) { showState('empty'); return; }

    currentText = data.result;
    const mode  = data.mode || 'humanize';
    const words = countWords(currentText);

    document.getElementById('preview-text').textContent = currentText;
    document.getElementById('preview-wc').textContent   = `${words} word${words !== 1 ? 's' : ''}`;
    document.getElementById('preview-mode').textContent = mode === 'generate' ? 'Generated' : 'Humanized';

    showState('ready');

  } catch {
    showState('empty');
  }
}

// Speed buttons
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSpeed = parseInt(btn.dataset.speed);
    document.getElementById('speed-val').textContent = btn.dataset.label;
  });
});

// Start button — arm the active tab
document.getElementById('start-btn').addEventListener('click', async () => {
  if (!currentText) return;

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['content.js'],
    });
  } catch {}

  await chrome.tabs.sendMessage(activeTab.id, {
    type: 'ARM',
    text: currentText,
    speed: currentSpeed,
  });

  showState('armed');
});

// Cancel button
document.getElementById('cancel-btn').addEventListener('click', async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    chrome.tabs.sendMessage(activeTab.id, { type: 'STOP' }).catch(() => {});
  }
  showState('ready');
});

// Open Bipass AI
document.getElementById('open-bipass').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://bipassai.com/app.html' });
});

loadText();
