/* ═══════════════════════════════════════════════════════════
   motion.js — shared premium motion layer
   Owns ONLY new behaviors: navbar frost state, guarded scroll
   reveals, and background parallax. Never touches app logic.
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = false;
  try {
    REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}
  if (REDUCED) document.documentElement.classList.add('reduced-motion');

  var MOBILE = false;
  try {
    MOBILE = window.matchMedia('(max-width: 740px)').matches;
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

    /* ── Guarded [data-anim] reveal observer ──
       Coexists with per-page observers (adding .revealed twice
       is harmless); enables data-anim on pages without one. */
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
  });
})();
