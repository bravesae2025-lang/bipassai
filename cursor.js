(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  /* ── Canvas setup ── */
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;display:block;pointer-events:none;z-index:99999';
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

  /* Light pages (e.g. the blog) have a white background, so a white cursor is
     invisible. Draw a dark cursor there; keep the white cursor on dark app pages. */
  const LIGHT  = location.pathname.startsWith('/blog');
  const FILL   = LIGHT ? '13,13,13'   : '255,255,255';
  const STROKE = LIGHT ? '255,255,255' : '0,0,0';

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

    if (ringAlpha > 0.01) { ringR += 2.2; ringAlpha -= 0.032; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!visible) { requestAnimationFrame(tick); return; }

    /* trail — back to front so lead dot is on top */
    for (let i = COUNT - 1; i >= 0; i--) {
      const frac   = i / (COUNT - 1);
      const radius = 5.5 - frac * 3;
      const alpha  = 1 - frac * 0.82;

      circle(
        pts[i].x, pts[i].y, Math.max(radius, 1),
        `rgba(${FILL},${alpha.toFixed(2)})`,
        `rgba(${STROKE},${(alpha * 0.45).toFixed(2)})`,
        1.2
      );
    }

    /* click ripple */
    if (ringAlpha > 0.01) {
      circle(mx, my, ringR, null, `rgba(${FILL},${ringAlpha.toFixed(2)})`, 1);
    }

    requestAnimationFrame(tick);
  })();
})();
