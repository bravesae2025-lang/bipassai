(() => {
  'use strict';

  const STORAGE_KEY = 'bipass_analytics_consent_v1';
  const MEASUREMENT_ID = 'G-8P3Y42GBC4';
  const GRANTED = 'granted';
  const DENIED = 'denied';
  const DISABLE_KEY = `ga-disable-${MEASUREMENT_ID}`;
  let analyticsLoaded = false;
  let panel = null;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/consent.css?v=1';
  document.head.appendChild(stylesheet);

  function readChoice() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === GRANTED || value === DENIED ? value : null;
    } catch (_) {
      return null;
    }
  }

  function storeChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  }

  function loadAnalytics() {
    window[DISABLE_KEY] = false;
    if (analyticsLoaded || document.querySelector(`script[data-bipass-analytics="${MEASUREMENT_ID}"]`)) return;
    analyticsLoaded = true;
    ensureGtag();
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 31_536_000,
      cookie_update: false,
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.dataset.bipassAnalytics = MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  function deleteAnalyticsCookies() {
    const names = document.cookie
      .split(';')
      .map((part) => part.split('=')[0].trim())
      .filter((name) => name === '_ga' || name === '_gid' || name === '_gat' || name.startsWith('_ga_'));
    const hostname = window.location.hostname;
    const baseDomain = hostname === 'bipassai.com' || hostname.endsWith('.bipassai.com')
      ? '.bipassai.com'
      : null;

    for (const name of new Set(names)) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      if (baseDomain) document.cookie = `${name}=; Max-Age=0; path=/; domain=${baseDomain}; SameSite=Lax`;
    }
  }

  function stopAnalytics() {
    window[DISABLE_KEY] = true;
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
    deleteAnalyticsCookies();
  }

  function syncSettingsToggle() {
    const toggle = document.getElementById('pref-analytics');
    if (!toggle) return;
    toggle.checked = readChoice() === GRANTED;
    const status = document.getElementById('pref-analytics-status');
    if (status) status.textContent = toggle.checked ? 'Allowed' : 'Off';
  }

  function announceChange(value) {
    document.dispatchEvent(new CustomEvent('bipass-consent-change', {
      detail: { analytics: value === GRANTED },
    }));
  }

  function setChoice(value, { dismiss = true } = {}) {
    storeChoice(value);
    if (value === GRANTED) loadAnalytics();
    else stopAnalytics();
    syncSettingsToggle();
    announceChange(value);
    if (dismiss) dismissPanel();
  }

  function dismissPanel() {
    if (!panel) return;
    const closingPanel = panel;
    panel = null;
    closingPanel.classList.add('is-leaving');
    const remove = () => closingPanel.remove();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) remove();
    else window.setTimeout(remove, 260);
  }

  function createPanel() {
    if (panel) return panel;
    const current = readChoice();
    panel = document.createElement('section');
    panel.className = 'bpc-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'bpc-title');
    panel.setAttribute('aria-describedby', 'bpc-copy');
    panel.innerHTML = `
      <div class="bpc-signal" aria-hidden="true"><span></span></div>
      <div class="bpc-head">
        <span class="bpc-kicker">Privacy control</span>
        ${current ? '<button class="bpc-close" type="button" aria-label="Close privacy settings">×</button>' : ''}
      </div>
      <h2 class="bpc-title" id="bpc-title">Your privacy, your choice.</h2>
      <p class="bpc-copy" id="bpc-copy">Necessary storage keeps your account and settings working. With your permission, usage Analytics helps us understand which pages are useful.</p>
      <div class="bpc-meta">
        <span><i aria-hidden="true"></i> Necessary storage · always on</span>
        <span class="bpc-meta-sep" aria-hidden="true">·</span>
        <a href="/privacy.html">Privacy</a>
        <span class="bpc-meta-sep" aria-hidden="true">·</span>
        <a href="/terms.html">Terms &amp; refunds</a>
      </div>
      <div class="bpc-actions">
        <button class="bpc-button bpc-reject${current === DENIED ? ' is-current' : ''}" type="button" data-consent="denied" aria-pressed="${current === DENIED}">Reject analytics</button>
        <button class="bpc-button bpc-accept${current === GRANTED ? ' is-current' : ''}" type="button" data-consent="granted" aria-pressed="${current === GRANTED}">Accept analytics</button>
      </div>
    `;

    panel.querySelector('[data-consent="denied"]').addEventListener('click', () => setChoice(DENIED));
    panel.querySelector('[data-consent="granted"]').addEventListener('click', () => setChoice(GRANTED));
    panel.querySelector('.bpc-close')?.addEventListener('click', dismissPanel);
    document.body.appendChild(panel);
    return panel;
  }

  function openPanel() {
    if (panel) return;
    createPanel();
    requestAnimationFrame(() => panel?.classList.add('is-visible'));
  }

  function addFooterControl() {
    const footer = document.querySelector('footer.site-footer');
    if (!footer || footer.querySelector('.bpc-footer-button')) return;
    const separator = document.createElement('span');
    separator.className = 'site-footer-sep bpc-footer-sep';
    separator.setAttribute('aria-hidden', 'true');
    separator.textContent = '·';
    const button = document.createElement('button');
    button.className = 'bpc-footer-button';
    button.type = 'button';
    button.textContent = 'Cookie settings';
    button.addEventListener('click', openPanel);
    footer.append(separator, button);
  }

  function bindSettingsControl() {
    const toggle = document.getElementById('pref-analytics');
    if (!toggle || toggle.dataset.consentBound === 'true') return;
    toggle.dataset.consentBound = 'true';
    syncSettingsToggle();
    toggle.addEventListener('change', () => {
      setChoice(toggle.checked ? GRANTED : DENIED, { dismiss: false });
    });
    document.getElementById('open-consent-settings')?.addEventListener('click', openPanel);
  }

  window.BipassConsent = Object.freeze({
    analyticsAllowed: () => readChoice() === GRANTED,
    open: openPanel,
    setAnalytics: (allowed) => setChoice(allowed ? GRANTED : DENIED, { dismiss: false }),
  });

  const initialChoice = readChoice();
  if (initialChoice === GRANTED) loadAnalytics();
  else stopAnalytics();

  function ready() {
    addFooterControl();
    bindSettingsControl();
    if (!initialChoice) openPanel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
