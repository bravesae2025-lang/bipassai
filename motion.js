/* ═══════════════════════════════════════════════════════════
   motion.js — premium motion layer v2 ("NOIR")
   Owns ONLY presentational behaviors: navbar frost state,
   scroll reveals, parallax, scroll progress, mouse spotlight,
   magnetic elements, 3D tilt, and text scramble.
   Never touches app logic.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = false;
  try {
    REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}
  if (REDUCED) document.documentElement.classList.add('reduced-motion');

  var MOBILE = false;
  var FINE_POINTER = true;
  try {
    MOBILE = window.matchMedia('(max-width: 740px)').matches;
    FINE_POINTER = window.matchMedia('(pointer: fine)').matches;
  } catch (e) {}

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {

    /* ── Navbar: transparent at top, frosted once scrolled ── */
    var navbar = document.querySelector('.navbar');
    if (navbar) {
      var navTicking = false;
      function syncNav() {
        navbar.classList.toggle('nav-at-top', window.scrollY < 12);
        navTicking = false;
      }
      syncNav();
      window.addEventListener('scroll', function () {
        if (!navTicking) {
          navTicking = true;
          requestAnimationFrame(syncNav);
        }
      }, { passive: true });
    }

    /* ── Scroll progress hairline ── */
    if (!REDUCED) {
      var prog = document.createElement('div');
      prog.className = 'scroll-progress';
      prog.setAttribute('aria-hidden', 'true');
      document.body.appendChild(prog);
      var progTicking = false;
      function syncProg() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var r = max > 0 ? window.scrollY / max : 0;
        prog.style.transform = 'scaleX(' + r.toFixed(4) + ')';
        progTicking = false;
      }
      syncProg();
      window.addEventListener('scroll', function () {
        if (!progTicking) {
          progTicking = true;
          requestAnimationFrame(syncProg);
        }
      }, { passive: true });
    }

    /* ── Text scramble: [data-scramble] decodes on reveal ── */
    var GLYPHS = '#/\\|<>+=*%&@$01';
    function scramble(el) {
      var original = el.dataset.scrambleText || el.textContent;
      el.dataset.scrambleText = original;
      var len = original.length;
      var frame = 0;
      var total = Math.max(18, Math.min(40, len * 2));
      function tick() {
        frame++;
        var resolved = Math.floor((frame / total) * len);
        var out = '';
        for (var i = 0; i < len; i++) {
          if (i < resolved || original[i] === ' ') {
            out += original[i];
          } else {
            out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
        }
        el.textContent = out;
        if (resolved < len) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = original;
        }
      }
      requestAnimationFrame(tick);
    }

    var scrambleEls = document.querySelectorAll('[data-scramble]');
    if (scrambleEls.length && !REDUCED && 'IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            scramble(entry.target);
            sio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      scrambleEls.forEach(function (el) { sio.observe(el); });
    }

    /* ── Guarded [data-anim] reveal observer ── */
    var animEls = document.querySelectorAll('[data-anim]');
    if (animEls.length) {
      if (REDUCED || !('IntersectionObserver' in window)) {
        animEls.forEach(function (el) { el.classList.add('revealed'); });
      } else {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        animEls.forEach(function (el) { io.observe(el); });
      }
    }

    /* ── Parallax: single passive rAF loop on [data-parallax] ── */
    var pEls = [];
    if (!REDUCED && !MOBILE) {
      document.querySelectorAll('[data-parallax]').forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax'));
        if (!isNaN(speed) && speed !== 0) pEls.push({ el: el, speed: speed });
      });
    }
    if (pEls.length) {
      var pTicking = false;
      function syncParallax() {
        var y = window.scrollY;
        for (var i = 0; i < pEls.length; i++) {
          pEls[i].el.style.transform =
            'translate3d(0,' + (y * pEls[i].speed).toFixed(1) + 'px,0)';
        }
        pTicking = false;
      }
      syncParallax();
      window.addEventListener('scroll', function () {
        if (!pTicking) {
          pTicking = true;
          requestAnimationFrame(syncParallax);
        }
      }, { passive: true });
    }

    /* ── Desktop-only pointer effects ── */
    if (REDUCED || !FINE_POINTER) return;

    /* Mouse spotlight: [data-spotlight] panels get --sx/--sy vars */
    document.querySelectorAll('[data-spotlight]').forEach(function (panel) {
      var spotTicking = false, lx = 0, ly = 0;
      panel.addEventListener('mousemove', function (e) {
        var r = panel.getBoundingClientRect();
        lx = ((e.clientX - r.left) / r.width * 100).toFixed(2);
        ly = ((e.clientY - r.top) / r.height * 100).toFixed(2);
        if (!spotTicking) {
          spotTicking = true;
          requestAnimationFrame(function () {
            panel.style.setProperty('--sx', lx + '%');
            panel.style.setProperty('--sy', ly + '%');
            spotTicking = false;
          });
        }
      }, { passive: true });
    });

    /* Magnetic pull: [data-magnetic] drifts toward the cursor */
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic')) || 0.25;
      el.style.transition = 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform =
          'translate(' + (dx * strength).toFixed(1) + 'px,' +
          (dy * strength).toFixed(1) + 'px)';
      }, { passive: true });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = 'translate(0,0)';
        setTimeout(function () {
          el.style.transition = 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)';
        }, 450);
      });
    });

    /* 3D tilt: [data-tilt] cards rotate toward the cursor */
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      var tiltTicking = false, rx = 0, ry = 0;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        ry = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
        rx = -((e.clientY - r.top) / r.height - 0.5) * 2 * max;
        if (!tiltTicking) {
          tiltTicking = true;
          requestAnimationFrame(function () {
            el.style.transform =
              'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' +
              ry.toFixed(2) + 'deg) translateY(-4px) scale(1.012)';
            tiltTicking = false;
          });
        }
      }, { passive: true });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 500);
      });
    });
  });
})();
