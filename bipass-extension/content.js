(() => {
  if (window.__bipass) return;

  const s = window.__bipass = {
    armedText:        '',
    armedSpeed:       45,
    targetDuration:   0,
    mistyping:        0,
    isTyping:         false,
    stopFlag:         false,
    remainingText:    '',
    floatBtn:         null,
    lastFocusedField: null,
  };

  function isValidField(t) {
    if (!t) return false;
    return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
  }

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
    } catch (_) { return null; }
  }

  function findTarget() {
    if (isValidField(s.lastFocusedField)) return s.lastFocusedField;
    const active = document.activeElement;
    if (active && active.tagName === 'IFRAME') {
      const inner = peekIframe(active);
      if (inner) return inner;
    }
    let t = active;
    while (t && t !== document.body && t !== document.documentElement) {
      if (isValidField(t)) return t;
      t = t.parentElement;
    }
    for (const iframe of document.querySelectorAll('iframe')) {
      const inner = peekIframe(iframe);
      if (inner) return inner;
    }
    return null;
  }

  document.addEventListener('focusin', (e) => {
    const t = e.target;
    if (isValidField(t)) s.lastFocusedField = t;
  }, true);

  document.addEventListener('mousedown', (e) => {
    if (document.getElementById('bipass-float-inner')?.contains(e.target)) return;
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
      s.armedText       = msg.text;
      s.armedSpeed      = msg.speed;
      s.targetDuration  = msg.targetDuration || 0;
      s.mistyping       = msg.mistyping ?? 0;
      s.remainingText   = msg.text;
      s.stopFlag        = false;
      showFloatBtn();
      sendResponse({ ok: true });
    }
    if (msg.type === 'STOP') {
      s.stopFlag = true;
      // If not currently typing, just dismiss the float
      if (!s.isTyping) {
        dismissFloat();
      }
      // If typing, the loop will detect stopFlag and switch to 'continue' state
      sendResponse({ ok: true });
    }
    return true;
  });

  function dismissFloat() {
    const existing = document.getElementById('bipass-float-btn');
    if (existing) existing.remove();
    document.getElementById('bipass-float-style')?.remove();
    s.floatBtn = null;
  }

  // kept for backward compat — same as dismissFloat
  function removeFloatBtn() { dismissFloat(); }

  function showFloatBtn() {
    dismissFloat();

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
      dismissFloat();
    });
  }

  async function handleStart() {
    // Currently typing → pause it
    if (s.isTyping) {
      s.stopFlag = true;
      s.isTyping = false;
      // updateBtn to 'continue' happens after typeText loop breaks
      return;
    }

    const target = findTarget();
    if (!target) {
      const label = document.getElementById('bipass-float-label');
      if (label) {
        label.textContent = 'Click a text field first';
        setTimeout(() => { if (label) label.textContent = s.remainingText === s.armedText ? 'Start Typing' : 'Continue'; }, 1800);
      }
      return;
    }

    s.isTyping = true;
    s.stopFlag = false;
    updateBtn('typing');

    await typeText(target, s.remainingText, s.armedSpeed);

    s.isTyping = false;

    if (s.stopFlag) {
      // Stopped mid-way — stay visible so user can continue
      updateBtn('paused');
    } else {
      // Finished all text — dismiss
      dismissFloat();
    }
  }

  function updateBtn(state) {
    const icon  = document.getElementById('bipass-float-icon');
    const label = document.getElementById('bipass-float-label');
    if (!icon || !label) return;
    if (state === 'typing') {
      icon.textContent  = '■';
      label.textContent = 'Stop';
    } else if (state === 'paused') {
      icon.textContent  = '▶';
      label.textContent = 'Continue';
    } else {
      icon.textContent  = '▶';
      label.textContent = 'Start Typing';
    }
  }

  function isBreakPoint(chars, i) {
    const c    = chars[i];
    const next = chars[i + 1];
    if ('.!?'.includes(c) && (!next || next === ' ' || next === '\n')) return true;
    if (',;:'.includes(c) && next === ' ') return true;
    if (c === '\n' && next === '\n') return true;
    return false;
  }

  function countBreakPoints(text) {
    const chars = [...text];
    let n = 0;
    for (let i = 0; i < chars.length; i++) {
      if (isBreakPoint(chars, i)) n++;
    }
    return n;
  }

  // Sleeps in small chunks so stopFlag is checked during long pauses
  async function pauseAtBreak(ms) {
    const chunk = 100;
    let elapsed = 0;
    while (elapsed < ms) {
      if (s.stopFlag) return;
      await sleep(Math.min(chunk, ms - elapsed));
      elapsed += chunk;
    }
  }

  const MISTYPE_PROB = [0, 0.03, 0.08, 0.15, 0.25];
  const ADJACENT = {
    a:'sqwz',b:'vghn',c:'xdfv',d:'sfxcre',e:'wrsdf',f:'dcgvre',g:'fhbvty',
    h:'gjnbyu',i:'uojk',j:'hknmui',k:'jlmio',l:'kop',m:'njk',n:'bhjm',
    o:'iklp',p:'ol',q:'wa',r:'etdf',s:'adwxze',t:'ryfg',u:'yihj',
    v:'cfgb',w:'qase',x:'zsdc',y:'tugh',z:'asx',
  };

  function pickAdjacentKey(char) {
    const pool = ADJACENT[char.toLowerCase()];
    if (!pool) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function insertChar(target, char, isInput, doc) {
    if (isInput) {
      const start = target.selectionStart ?? target.value.length;
      const end   = target.selectionEnd   ?? start;
      target.value = target.value.slice(0, start) + char + target.value.slice(end);
      target.selectionStart = target.selectionEnd = start + 1;
      target.dispatchEvent(new InputEvent('input', { data: char, inputType: 'insertText', bubbles: true, cancelable: true }));
    } else {
      target.focus();
      const ok = doc.execCommand('insertText', false, char);
      if (!ok) {
        target.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: char, bubbles: true, cancelable: true }));
        target.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: char, bubbles: true }));
      }
    }
  }

  function deleteChar(target, isInput, doc) {
    if (isInput) {
      const start = target.selectionStart ?? target.value.length;
      if (start === 0) return;
      target.value = target.value.slice(0, start - 1) + target.value.slice(start);
      target.selectionStart = target.selectionEnd = start - 1;
      target.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
    } else {
      // sel.modify extends selection backward by one char, then we delete it
      const sel = doc.getSelection();
      if (sel && sel.rangeCount > 0) {
        sel.modify('extend', 'backward', 'character');
        const range = sel.getRangeAt(0);
        if (!range.collapsed) {
          target.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true, cancelable: true }));
          range.deleteContents();
          sel.collapseToEnd();
          target.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
        }
      }
    }
  }

  async function typeText(target, text, speed) {
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    const doc = target.ownerDocument || document;
    if (isInput) target.focus();

    const chars = [...text];
    let wordMult = 0.5 + Math.random() * 1.2;
    let wordCharCount = 0;

    // Calculate extra pause per break point to hit the target duration
    let breakPause = 0;
    if (s.targetDuration > 0) {
      const naturalTime = chars.length * speed;
      const extraTime   = s.targetDuration - naturalTime;
      if (extraTime > 0) {
        const breaks = countBreakPoints(text);
        if (breaks > 0) breakPause = Math.min(extraTime / breaks, 90000); // cap at 90s per break
      }
    }

    for (let i = 0; i < chars.length; i++) {
      if (s.stopFlag) {
        s.remainingText = chars.slice(i).join('');
        return;
      }
      const char = chars[i];
      // Mistype: type adjacent wrong key, pause, then delete+retype correct char
      const mistypeProb = MISTYPE_PROB[s.mistyping] || 0;
      const wrong = (mistypeProb > 0 && /[a-zA-Z]/.test(char) && Math.random() < mistypeProb)
        ? pickAdjacentKey(char) : null;

      if (wrong) {
        insertChar(target, wrong, isInput, doc);
        await sleep(110 + Math.random() * 190); // "oh wait" visual pause

        if (s.stopFlag) {
          if (isInput) {
            deleteChar(target, isInput, doc);
          } else {
            // same synthetic backspace as the normal mistype path
            target.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Backspace', code: 'Backspace', keyCode: 8, which: 8, bubbles: true, cancelable: true,
            }));
            const bh = !target.dispatchEvent(new InputEvent('beforeinput', {
              inputType: 'deleteContentBackward', bubbles: true, cancelable: true,
            }));
            if (!bh) {
              const sel = doc.getSelection();
              if (sel && sel.rangeCount > 0) {
                sel.modify('extend', 'backward', 'character');
                const r = sel.getRangeAt(0);
                if (!r.collapsed) { r.deleteContents(); sel.collapseToEnd(); }
              }
            }
            target.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
            target.dispatchEvent(new KeyboardEvent('keyup', {
              key: 'Backspace', code: 'Backspace', keyCode: 8, which: 8, bubbles: true,
            }));
          }
          s.remainingText = chars.slice(i).join('');
          return;
        }

        if (isInput) {
          deleteChar(target, isInput, doc);
          await sleep(50 + Math.random() * 60);
          insertChar(target, char, isInput, doc);
        } else {
          // contenteditable: fire synthetic keyboard/input events so the editor's own
          // listeners handle deletion (works for React/Lexical, ProseMirror, Quill, etc.)
          target.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Backspace', code: 'Backspace', keyCode: 8, which: 8, bubbles: true, cancelable: true,
          }));
          const bhHandled = !target.dispatchEvent(new InputEvent('beforeinput', {
            inputType: 'deleteContentBackward', bubbles: true, cancelable: true,
          }));
          if (!bhHandled) {
            // Vanilla contenteditable (no framework): delete directly
            const sel = doc.getSelection();
            if (sel && sel.rangeCount > 0) {
              sel.modify('extend', 'backward', 'character');
              const r = sel.getRangeAt(0);
              if (!r.collapsed) { r.deleteContents(); sel.collapseToEnd(); }
            }
          }
          target.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }));
          target.dispatchEvent(new KeyboardEvent('keyup', {
            key: 'Backspace', code: 'Backspace', keyCode: 8, which: 8, bubbles: true,
          }));
          // wait for editor to re-render (deletion applied) before typing correct char
          await sleep(50 + Math.random() * 70);
          if (s.stopFlag) { s.remainingText = chars.slice(i).join(''); return; }
          insertChar(target, char, isInput, doc);
        }
        await sleep(40 + Math.random() * 45);
      } else {
        insertChar(target, char, isInput, doc);
      }

      // Variable human-like speed: word-level multiplier + per-char noise + inter-word pause
      let delay;
      if (char === ' ' || char === '\n') {
        delay = speed * (0.8 + Math.random() * 1.7);
        wordMult = 0.5 + Math.random() * 1.2;
        wordCharCount = 0;
      } else {
        const noise = 0.75 + Math.random() * 0.5;
        delay = Math.max(8, speed * wordMult * noise);
        wordCharCount++;
        if (wordCharCount > 1 && Math.random() < 0.08) delay *= 2.5;
      }
      await sleep(delay);

      // ~11% chance of a random mid-sentence thinking pause between words
      if (char === ' ' && Math.random() < 0.11) {
        const thinkMs = 350 + Math.random() * 1150;
        await pauseAtBreak(thinkMs);
        if (s.stopFlag) { s.remainingText = chars.slice(i + 1).join(''); return; }
      }

      // Extra pause at sentence/clause breaks to hit target duration
      if (breakPause > 0 && isBreakPoint(chars, i)) {
        await pauseAtBreak(breakPause);
        if (s.stopFlag) { s.remainingText = chars.slice(i + 1).join(''); return; }
      }
    }

    s.remainingText = '';
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
})();
