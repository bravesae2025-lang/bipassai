(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const COUNT = 7;

  const dots = Array.from({ length: COUNT }, (_, i) => {
    const el  = document.createElement('div');
    el.className = 'cursor-trail';
    const size = Math.round(10 - i * 0.65);
    const op   = +(1 - (i / COUNT) * 0.82).toFixed(2);
    el.style.cssText = `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;opacity:${op}`;
    document.body.appendChild(el);
    return { el, x: -300, y: -300, baseOp: op };
  });

  let mx = -300, my = -300;
  let isDown = false, visible = true;
  let scale = 1, scaleTarget = 1;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => { isDown = true; });
  document.addEventListener('mouseup',   () => { isDown = false; });
  document.addEventListener('mouseleave', () => {
    visible = false;
    dots.forEach(d => { d.el.style.opacity = '0'; });
  });
  document.addEventListener('mouseenter', () => {
    visible = true;
    dots.forEach(d => { d.el.style.opacity = d.baseOp; });
  });

  const HOVER = 'a, button, [role="button"], .level-btn, .mint-btn, .nav-link, .drawer-item, label, .credit-card, .analyze-btn, .use-my-style-btn';
  const TEXT  = 'textarea, input, [contenteditable]';

  (function tick() {
    dots[0].x += (mx - dots[0].x) * 0.5;
    dots[0].y += (my - dots[0].y) * 0.5;
    for (let i = 1; i < COUNT; i++) {
      dots[i].x += (dots[i - 1].x - dots[i].x) * 0.42;
      dots[i].y += (dots[i - 1].y - dots[i].y) * 0.42;
    }

    const target  = document.elementFromPoint(mx, my);
    const isHover = !!target?.closest(HOVER);
    const isText  = !!target?.closest(TEXT);

    scaleTarget = isDown ? 0.75 : isText ? 0.3 : isHover ? 1.7 : 1;
    scale += (scaleTarget - scale) * 0.2;

    if (visible) {
      dots[0].el.style.opacity = isText ? '0.35' : dots[0].baseOp;
    }

    dots.forEach((d, i) => {
      d.el.style.transform = i === 0
        ? `translate(${d.x}px,${d.y}px) scale(${scale.toFixed(3)})`
        : `translate(${d.x}px,${d.y}px)`;
    });
    requestAnimationFrame(tick);
  })();
})();
