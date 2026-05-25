(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const COUNT = 5;
  const SIZES = [10, 8, 7, 6, 5];
  const OPS   = [1.0, 0.65, 0.4, 0.25, 0.15];

  const dots = SIZES.map((size, i) => {
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    const hw = size / 2;
    el.style.cssText = `width:${size}px;height:${size}px;margin:${-hw}px 0 0 ${-hw}px;opacity:${OPS[i]}`;
    document.body.appendChild(el);
    return { el, x: -300, y: -300, baseOp: OPS[i] };
  });

  let mx = -300, my = -300;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  document.addEventListener('mouseleave', () => dots.forEach(d => { d.el.style.opacity = '0'; }));
  document.addEventListener('mouseenter', () => dots.forEach(d => { d.el.style.opacity = d.baseOp; }));

  document.addEventListener('mousedown', () => dots[0].el.classList.add('cursor-trail--press'));
  document.addEventListener('mouseup',   () => dots[0].el.classList.remove('cursor-trail--press'));

  const HOVER = 'a, button, [role="button"], .level-btn, .mint-btn, .nav-link, .drawer-item, label, .credit-card, .analyze-btn, .use-my-style-btn';
  const TEXT  = 'textarea, input, [contenteditable]';

  (function tick() {
    dots[0].x += (mx - dots[0].x) * 0.55;
    dots[0].y += (my - dots[0].y) * 0.55;
    for (let i = 1; i < COUNT; i++) {
      dots[i].x += (dots[i - 1].x - dots[i].x) * 0.45;
      dots[i].y += (dots[i - 1].y - dots[i].y) * 0.45;
    }

    const target  = document.elementFromPoint(mx, my);
    const isHover = !!target?.closest(HOVER);
    const isText  = !!target?.closest(TEXT);
    dots[0].el.classList.toggle('cursor-trail--hover', isHover && !isText);
    dots[0].el.classList.toggle('cursor-trail--text',  isText);

    dots.forEach(d => {
      d.el.style.transform = `translate(${d.x}px,${d.y}px)`;
    });
    requestAnimationFrame(tick);
  })();
})();
