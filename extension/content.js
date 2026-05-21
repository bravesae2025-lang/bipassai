if (window.__bipassLoaded) return;
window.__bipassLoaded = true;

let armedText        = '';
let armedSpeed       = 45;
let isTyping         = false;
let stopFlag         = false;
let floatBtn         = null;
let lastFocusedField = null;

// Track the last focused text field so clicking the button doesn't lose it
document.addEventListener('focusin', (e) => {
  const t = e.target;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) {
    lastFocusedField = t;
  }
}, true);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ARM') {
    armedText  = msg.text;
    armedSpeed = msg.speed;
    stopFlag   = false;
    showFloatBtn();
    sendResponse({ ok: true });
  }
  if (msg.type === 'STOP') {
    stopFlag = true;
    isTyping = false;
    removeFloatBtn();
    sendResponse({ ok: true });
  }
  return true;
});

function removeFloatBtn() {
  const existing = document.getElementById('bipass-float-btn');
  if (existing) existing.remove();
  floatBtn = null;
}

function showFloatBtn() {
  removeFloatBtn();

  floatBtn = document.createElement('div');
  floatBtn.id = 'bipass-float-btn';
  floatBtn.innerHTML = `
    <div id="bipass-float-inner">
      <span id="bipass-float-icon">▶</span>
      <span id="bipass-float-label">Start Typing</span>
    </div>
    <div id="bipass-float-close">✕</div>
  `;

  const style = document.createElement('style');
  style.id = 'bipass-float-style';
  style.textContent = `
    #bipass-float-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #0a0a0a;
      border-radius: 50px;
      padding: 10px 16px 10px 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      cursor: pointer;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: opacity 0.2s, transform 0.2s;
    }
    #bipass-float-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    #bipass-float-inner {
      display: flex; align-items: center; gap: 7px;
    }
    #bipass-float-icon {
      font-size: 11px; color: #fff;
    }
    #bipass-float-label {
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.05em; color: #fff;
    }
    #bipass-float-close {
      font-size: 10px; color: rgba(255,255,255,0.45);
      padding: 2px 0 2px 8px;
      border-left: 1px solid rgba(255,255,255,0.15);
      cursor: pointer;
      transition: color 0.15s;
    }
    #bipass-float-close:hover { color: #fff; }
    #bipass-float-btn.typing #bipass-float-icon { content: '■'; }
    #bipass-float-btn.typing #bipass-float-label { content: 'Typing…'; }
  `;

  document.head.appendChild(style);
  document.body.appendChild(floatBtn);

  document.getElementById('bipass-float-inner').addEventListener('click', handleStart);
  document.getElementById('bipass-float-close').addEventListener('click', (e) => {
    e.stopPropagation();
    stopFlag = true;
    isTyping = false;
    removeFloatBtn();
    document.getElementById('bipass-float-style')?.remove();
  });
}

async function handleStart() {
  if (isTyping) {
    stopFlag = true;
    isTyping = false;
    updateBtn(false);
    return;
  }

  const target     = lastFocusedField;
  const isInput    = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
  const isEditable = target && target.isContentEditable;

  if (!target || (!isInput && !isEditable)) {
    const label = document.getElementById('bipass-float-label');
    if (label) {
      label.textContent = 'Click a text field first';
      setTimeout(() => { if (label) label.textContent = 'Start Typing'; }, 1800);
    }
    return;
  }

  isTyping = true;
  stopFlag = false;
  updateBtn(true);

  await typeText(target, armedText, armedSpeed);

  isTyping = false;
  updateBtn(false);
  removeFloatBtn();
  document.getElementById('bipass-float-style')?.remove();
}

function updateBtn(typing) {
  const icon  = document.getElementById('bipass-float-icon');
  const label = document.getElementById('bipass-float-label');
  if (!icon || !label) return;
  if (typing) {
    icon.textContent  = '■';
    label.textContent = 'Stop';
  } else {
    icon.textContent  = '▶';
    label.textContent = 'Start Typing';
  }
}

async function typeText(target, text, speed) {
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

  for (const char of text) {
    if (stopFlag) break;

    if (isInput) {
      const start = target.selectionStart ?? target.value.length;
      const end   = target.selectionEnd   ?? start;
      target.value = target.value.slice(0, start) + char + target.value.slice(end);
      target.selectionStart = target.selectionEnd = start + 1;
      target.dispatchEvent(new InputEvent('input', {
        data: char,
        inputType: 'insertText',
        bubbles: true,
        cancelable: true,
      }));
    } else {
      target.focus();
      document.execCommand('insertText', false, char);
    }

    const jitter = (Math.random() * 20) - 10;
    await sleep(Math.max(8, speed + jitter));
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
