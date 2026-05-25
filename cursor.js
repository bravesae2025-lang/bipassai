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
  const COUNT = 8;
  const pts   = Array.from({ length: COUNT }, () => ({ x: -300, y: -300 }));

  let mx = -300, my = -300;
  let visible = true;
  let ringR = 0, ringAlpha = 0;   // click ripple
  let hoverR = 0;                  // hover circle radius (lerped)

  /* ── Events ── */
  document.addEventListener('mousemove',  e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { visible = false; });
  document.addEventListener('mouseenter', () => { visible = true; });
  document.addEventListener('mousedown',  () => { ringR = 4; ringAlpha = 0.85; });

  const HOVER = 'a,button,[role="button"],.level-btn,.mint-btn,.nav-link,' +
                '.drawer-item,label,.credit-card,.analyze-btn,.use-my-style-btn';
  const TEXT  = 'textarea,input,[contenteditable]';

  /* ── Render loop ── */
  (function tick() {
    /* position lerp */
    pts[0].x += (mx - pts[0].x) * 0.5;
    pts[0].y += (my - pts[0].y) * 0.5;
    for (let i = 1; i < COUNT; i++) {
      pts[i].x += (pts[i - 1].x - pts[i].x) * 0.38;
      pts[i].y += (pts[i - 1].y - pts[i].y) * 0.38;
    }

    /* hover / text detection */
    const target  = document.elementFromPoint(mx, my);
    const isHover = !!target?.closest(HOVER);
    const isText  = !!target?.closest(TEXT);

    /* hover ring lerp */
    hoverR += ((isHover && !isText ? 18 : 0) - hoverR) * 0.15;

    /* click ripple */
    if (ringAlpha > 0.01) { ringR += 2.5; ringAlpha -= 0.035; }

    /* draw */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!visible) { requestAnimationFrame(tick); return; }

    /* trail dots — back to front */
    for (let i = COUNT - 1; i >= 0; i--) {
      const frac   = i / COUNT;
      const radius = 5.5 - frac * 2.8;
      const alpha  = (1 - frac * 0.88) * (isText ? 0.3 : 1);

      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, Math.max(radius, 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
      ctx.fill();
    }

    /* hover ring at real cursor position */
    if (hoverR > 0.5) {
      const a = (hoverR / 18) * 0.55;
      ctx.beginPath();
      ctx.arc(mx, my, hoverR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    /* click ripple */
    if (ringAlpha > 0.01) {
      ctx.beginPath();
      ctx.arc(mx, my, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${ringAlpha.toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    requestAnimationFrame(tick);
  })();
})();
