(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  /* ── Canvas setup ── */
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;pointer-events:none;z-index:99999';
  document.body.appendChild(canvas);

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Trail state ── */
  const COUNT = 6;
  const pts   = Array.from({ length: COUNT }, () => ({ x: -300, y: -300 }));

  let mx = -300, my = -300;
  let visible = true;
  let ringR = 0, ringAlpha = 0;
  let hoverR = 0;

  /* ── Events ── */
  document.addEventListener('mousemove',  e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { visible = false; });
  document.addEventListener('mouseenter', () => { visible = true; });
  document.addEventListener('mousedown',  () => { ringR = 5; ringAlpha = 0.8; });

  const HOVER = 'a,button,[role="button"],.level-btn,.mint-btn,.nav-link,' +
                '.drawer-item,label,.credit-card,.analyze-btn,.use-my-style-btn';
  const TEXT  = 'textarea,input,[contenteditable]';

  /* ── Helpers ── */
  function circle(x, y, r, fill, strokeColor, lineWidth) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill)        { ctx.fillStyle = fill;               ctx.fill(); }
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth || 1; ctx.stroke(); }
  }

  /* ── Render loop ── */
  (function tick() {
    pts[0].x += (mx - pts[0].x) * 0.5;
    pts[0].y += (my - pts[0].y) * 0.5;
    for (let i = 1; i < COUNT; i++) {
      pts[i].x += (pts[i - 1].x - pts[i].x) * 0.4;
      pts[i].y += (pts[i - 1].y - pts[i].y) * 0.4;
    }

    const target  = document.elementFromPoint(mx, my);
    const isHover = !!target?.closest(HOVER);
    const isText  = !!target?.closest(TEXT);

    hoverR += ((isHover && !isText ? 20 : 0) - hoverR) * 0.14;
    if (ringAlpha > 0.01) { ringR += 2.2; ringAlpha -= 0.032; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!visible) { requestAnimationFrame(tick); return; }

    /* trail — back to front so lead dot is on top */
    for (let i = COUNT - 1; i >= 0; i--) {
      const frac   = i / (COUNT - 1);           // 0 (lead) → 1 (tail)
      const radius = 5.5 - frac * 3;            // 5.5 → 2.5 px
      const alpha  = (1 - frac * 0.82) * (isText ? 0.25 : 1);

      circle(
        pts[i].x, pts[i].y, Math.max(radius, 1),
        `rgba(255,255,255,${alpha.toFixed(2)})`,          /* white fill */
        `rgba(0,0,0,${(alpha * 0.45).toFixed(2)})`,       /* dark border */
        1.2
      );
    }

    /* hover ring */
    if (hoverR > 0.5) {
      const a = (hoverR / 20) * 0.55;
      circle(
        mx, my, hoverR,
        `rgba(255,255,255,${(a * 0.07).toFixed(2)})`,   /* faint fill */
        `rgba(255,255,255,${a.toFixed(2)})`,             /* white stroke */
        1.5
      );
    }

    /* click ripple */
    if (ringAlpha > 0.01) {
      circle(mx, my, ringR, null, `rgba(255,255,255,${ringAlpha.toFixed(2)})`, 1);
    }

    requestAnimationFrame(tick);
  })();
})();
