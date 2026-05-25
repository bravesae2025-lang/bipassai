(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const COUNT = 12;

  const dots = Array.from({ length: COUNT }, (_, i) => {
    const el  = document.createElement('div');
    el.className = 'cursor-trail';
    const size = Math.round(10 - i * 0.55);
    const op   = +(1 - (i / COUNT) * 0.88).toFixed(2);
    el.style.cssText = `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;opacity:${op}`;
    document.body.appendChild(el);
    return { el, x: -300, y: -300, baseOp: op };
  });

  let mx = -300, my = -300;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function tick() {
    dots[0].x += (mx - dots[0].x) * 0.5;
    dots[0].y += (my - dots[0].y) * 0.5;
    for (let i = 1; i < COUNT; i++) {
      dots[i].x += (dots[i - 1].x - dots[i].x) * 0.28;
      dots[i].y += (dots[i - 1].y - dots[i].y) * 0.28;
    }
    dots.forEach(d => {
      d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
    });
    requestAnimationFrame(tick);
  })();

  const HOVER = 'a, button, [role="button"], .level-btn, .mint-btn, .nav-link, .drawer-item, label, .credit-card, .analyze-btn, .use-my-style-btn';
  const TEXT  = 'textarea, input, [contenteditable]';

  document.addEventListener('mouseover', e => {
    const isHover = !!e.target.closest(HOVER);
    const isText  = !!e.target.closest(TEXT);
    dots[0].el.classList.toggle('cursor-trail--hover', isHover && !isText);
    dots[0].el.classList.toggle('cursor-trail--text',  isText);
  });

  document.addEventListener('mousedown', () => dots[0].el.classList.add('cursor-trail--press'));
  document.addEventListener('mouseup',   () => dots[0].el.classList.remove('cursor-trail--press'));

  document.addEventListener('mouseleave', () => dots.forEach(d => { d.el.style.opacity = '0'; }));
  document.addEventListener('mouseenter', () => dots.forEach(d => { d.el.style.opacity = d.baseOp; }));
})();
