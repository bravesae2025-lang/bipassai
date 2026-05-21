(() => {
  if (window.__bipass) return;

  const s = window.__bipass = {
    armedText: '',
    armedSpeed: 45,
    isTyping: false,
    stopFlag: false,
    floatBtn: null,
    lastFocusedField: null,
  };

  function isValidField(t) {
    if (!t) return false;
    return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
  }

  // Peek inside a same-origin iframe to find the active editable element
  function peekIframe(iframeEl) {
    try {
      const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
      if (!doc) return null;
      let t = doc.activeElement;
      while (t && t !== doc.body && t !== doc.documentElement) {
        if (isValidField(t)) return t;
        t = t.parentElement;
      }
      return doc.querySelector('[contenteditable="true"], textarea, input:not([type="hidden"])');
    } catch (_) { return null; } // cross-origin
  }

  function findTarget() {
    if (isValidField(s.lastFocusedField)) return s.lastFocusedField;

    const active = document.activeElement;

    // Google Docs captures input in a same-origin iframe — peek inside
    if (active && active.tagName === 'IFRAME') {
      const inner = peekIframe(active);
      if (inner) return inner;
    }

    // Walk up from activeElement in the main document
    let t = active;
    while (t && t !== document.body && t !== document.documentElement) {
      if (isValidField(t)) return t;
      t = t.parentElement;
    }

    // Also check all iframes on the page (Google Docs may not be activeElement)
    for (const iframe of document.querySelectorAll('iframe')) {
      const inner = peekIframe(iframe);
      if (inner) return inner;
    }

    return null; // No blind querySelector — avoids selecting wrong element (title, etc.)
  }

  document.addEventListener('focusin', (e) => {
    const t = e.target;
    if (isValidField(t)) s.lastFocusedField = t;
  }, true);

  document.addEventListener('mousedown', (e) => {
    // Don't reset when clicking our own button
    if (document.getElementById('bipass-float-inner')?.contains(e.target)) return;
    // Reset so stale focus (e.g. title from earlier click) doesn't persist
    s.lastFocusedField = null;
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || active === document.body || active === document.documentElement) return;
      if (isValidField(active)) {
        s.lastFocusedField = active;
      } else if (active.tagName === 'IFRAME') {
        const inner = peekIframe(active);
        if (inner) s.lastFocusedField = inner;
      }
    }, 150);
  }, true);

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'ARM') {
      s.armedText  = msg.text;
      s.armedSpeed = msg.speed;
      s.stopFlag   = false;
      showFloatBtn();
      sendResponse({ ok: true });
    }
    if (msg.type === 'STOP') {
      s.stopFlag = true;
      s.isTyping = false;
      removeFloatBtn();
      sendResponse({ ok: true });
    }
    return true;
  });

  function removeFloatBtn() {
    const existing = document.getElementById('bipass-float-btn');
    if (existing) existing.remove();
    s.floatBtn = null;
  }

  function showFloatBtn() {
    removeFloatBtn();

    s.floatBtn = document.createElement('div');
    s.floatBtn.id = 'bipass-float-btn';
    s.floatBtn.innerHTML = `
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
      #bipass-float-inner { display: flex; align-items: center; gap: 7px; }
      #bipass-float-icon { font-size: 11px; color: #fff; }
      #bipass-float-label { font-size: 12px; font-weight: 700; letter-spacing: 0.05em; color: #fff; }
      #bipass-float-close {
        font-size: 10px; color: rgba(255,255,255,0.45);
        padding: 2px 0 2px 8px;
        border-left: 1px solid rgba(255,255,255,0.15);
        cursor: pointer; transition: color 0.15s;
      }
      #bipass-float-close:hover { color: #fff; }
    `;

    document.head.appendChild(style);
    document.body.appendChild(s.floatBtn);

    document.getElementById('bipass-float-inner').addEventListener('mousedown', (e) => e.preventDefault());
    document.getElementById('bipass-float-inner').addEventListener('click', handleStart);
    document.getElementById('bipass-float-close').addEventListener('click', (e) => {
      e.stopPropagation();
      s.stopFlag = true;
      s.isTyping = false;
      removeFloatBtn();
      document.getElementById('bipass-float-style')?.remove();
    });
  }

  async function handleStart() {
    if (s.isTyping) {
      s.stopFlag = true;
      s.isTyping = false;
      updateBtn(false);
      return;
    }

    const target = findTarget();

    if (!target) {
      const label = document.getElementById('bipass-float-label');
      if (label) {
        label.textContent = 'Click a text field first';
        setTimeout(() => { if (label) label.textContent = 'Start Typing'; }, 1800);
      }
      return;
    }

    s.isTyping = true;
    s.stopFlag = false;
    updateBtn(true);

    await typeText(target, s.armedText, s.armedSpeed);

    s.isTyping = false;
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
    const doc = target.ownerDocument || document;
    if (isInput) target.focus();
    for (const char of text) {
      if (s.stopFlag) break;
      if (isInput) {
        const start = target.selectionStart ?? target.value.length;
        const end   = target.selectionEnd   ?? start;
        target.value = target.value.slice(0, start) + char + target.value.slice(end);
        target.selectionStart = target.selectionEnd = start + 1;
        target.dispatchEvent(new InputEvent('input', {
          data: char, inputType: 'insertText', bubbles: true, cancelable: true,
        }));
      } else {
        target.focus();
        const ok = doc.execCommand('insertText', false, char);
        if (!ok) {
          target.dispatchEvent(new InputEvent('beforeinput', {
            inputType: 'insertText', data: char, bubbles: true, cancelable: true,
          }));
          target.dispatchEvent(new InputEvent('input', {
            inputType: 'insertText', data: char, bubbles: true,
          }));
        }
      }
      const jitter = (Math.random() * 20) - 10;
      await sleep(Math.max(8, speed + jitter));
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
})();
