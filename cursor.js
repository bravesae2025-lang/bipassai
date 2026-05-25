(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });

  (function tick() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(tick);
  })();

  const HOVER = 'a, button, [role="button"], .level-btn, .mint-btn, .nav-link, .drawer-item, label, .style-trait-chip, .credit-card';
  const TEXT  = 'textarea, input, [contenteditable]';

  document.addEventListener('mouseover', e => {
    const isHover = !!e.target.closest(HOVER);
    const isText  = !!e.target.closest(TEXT);
    ring.classList.toggle('cursor-ring--hover', isHover && !isText);
    ring.classList.toggle('cursor-ring--text',  isText);
    dot.classList.toggle('cursor-dot--text',    isText);
  });

  document.addEventListener('mousedown', () => ring.classList.add('cursor-ring--click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('cursor-ring--click'));

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '';  ring.style.opacity = '';  });
})();
