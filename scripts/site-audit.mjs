import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = [
  ...readdirSync(root).filter((name) => name.endsWith('.html')).map((name) => join(root, name)),
  ...readdirSync(join(root, 'blog')).filter((name) => name.endsWith('.html')).map((name) => join(root, 'blog', name)),
];
const serverRoutes = new Set(['/home', '/app', '/app.html', '/config', '/favicon.ico']);
const errors = [];

function label(file) {
  return relative(root, file);
}

function add(file, message) {
  errors.push(`${label(file)}: ${message}`);
}

function targetFor(file, rawValue) {
  const value = rawValue.trim();
  if (!value || value.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) return null;
  const clean = decodeURIComponent(value.split('#')[0].split('?')[0]);
  if (serverRoutes.has(clean)) return null;
  if (clean === '/') return join(root, 'index.html');
  if (clean === '/blog' || clean === '/blog/') return join(root, 'blog', 'index.html');

  let target = clean.startsWith('/') ? join(root, clean.slice(1)) : resolve(dirname(file), clean);
  if (!extname(target) && existsSync(`${target}.html`)) target = `${target}.html`;
  if (target.endsWith('/')) target = join(target, 'index.html');
  return normalize(target);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  if (!/^\s*<!doctype html>/i.test(html)) add(file, 'missing HTML5 doctype');
  if (!/<meta\s+name=["']viewport["']/i.test(html)) add(file, 'missing viewport meta tag');
  if (!/<title>[^<]+<\/title>/i.test(html)) add(file, 'missing or empty title');
  if (file !== join(root, 'app.html') && /\bclass=["'][^"']*\bappbg(?:\s|["'])/i.test(html)) {
    add(file, 'interactive app background is only allowed on app.html; use bg-dots on regular pages');
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const id of new Set(ids)) {
    if (ids.filter((candidate) => candidate === id).length > 1) add(file, `duplicate id "${id}"`);
  }

  for (const match of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/gi)) {
    let target;
    try {
      target = targetFor(file, match[1]);
    } catch {
      add(file, `invalid encoded URL "${match[1]}"`);
      continue;
    }
    if (target && (!target.startsWith(root) || !existsSync(target))) {
      add(file, `missing local target "${match[1]}"`);
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\salt=["'][^"']*["']/i.test(match[1])) add(file, 'image missing alt attribute');
  }

  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      add(file, `invalid JSON-LD (${error.message})`);
    }
  }

  if (file.startsWith(join(root, 'blog')) && file !== join(root, 'blog', 'index.html')) {
    const appScript = html.indexOf('src="/script.js');
    const supabaseScript = html.indexOf('@supabase/supabase-js');
    const authScript = html.indexOf('src="/auth.js');
    if (appScript !== -1) add(file, 'loads app-only script.js');
    if (supabaseScript === -1 || authScript === -1 || supabaseScript > authScript) {
      add(file, 'must load Supabase before auth.js');
    }
  }
}

const extensionHtmlFile = join(root, 'extension', 'popup.html');
const extensionJsFile = join(root, 'extension', 'popup.js');
const extensionManifestFile = join(root, 'extension', 'manifest.json');
const privacyFile = join(root, 'privacy.html');
const extensionHtml = readFileSync(extensionHtmlFile, 'utf8');
const extensionJs = readFileSync(extensionJsFile, 'utf8');
const extensionManifest = JSON.parse(readFileSync(extensionManifestFile, 'utf8'));
const privacyHtml = readFileSync(privacyFile, 'utf8');
const indexFile = join(root, 'index.html');
const indexHtml = readFileSync(indexFile, 'utf8');
const appFile = join(root, 'app.html');
const appHtml = readFileSync(appFile, 'utf8');
const appJsFile = join(root, 'app.js');
const appJs = readFileSync(appJsFile, 'utf8');
const editorFile = join(root, 'editor.html');
const editorHtml = readFileSync(editorFile, 'utf8');
const editorJsFile = join(root, 'editor.js');
const editorJs = readFileSync(editorJsFile, 'utf8');
const styleFile = join(root, 'style.css');
const styleCss = readFileSync(styleFile, 'utf8');
const serverFile = join(root, 'server.js');
const serverJs = readFileSync(serverFile, 'utf8');
const authFile = join(root, 'auth.js');
const authJs = readFileSync(authFile, 'utf8');
const historyFile = join(root, 'history.js');
const historyJs = readFileSync(historyFile, 'utf8');
if (!/id=["']login-username["']/.test(extensionHtml)) {
  add(extensionHtmlFile, 'username accounts need a username login field');
}
if (!/login\.html\?mode=signup/.test(extensionJs)) {
  add(extensionJsFile, 'sign-up link must open the create-account mode');
}
if (!/usernameToEmail\(username\)/.test(extensionJs)) {
  add(extensionJsFile, 'username login must use the same internal email mapping as the website');
}
if (extensionManifest.homepage_url !== 'https://bipassai.com/' || extensionManifest.author !== 'Bipass AI') {
  add(extensionManifestFile, 'extension branding must identify Bipass AI and its canonical homepage');
}
for (const permission of extensionManifest.permissions || []) {
  if (!privacyHtml.includes(`<code>${permission}</code>`)) {
    add(privacyFile, `missing explanation for extension permission "${permission}"`);
  }
}

const indexStructuredData = [...indexHtml.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => JSON.parse(match[1]));
const organization = indexStructuredData.find((item) => item['@type'] === 'Organization');
if (!organization
    || organization['@id'] !== 'https://bipassai.com/#organization'
    || organization.url !== 'https://bipassai.com'
    || !organization.logo
    || !organization.contactPoint?.email
    || !Array.isArray(organization.sameAs)
    || !organization.sameAs.some((url) => url.includes('chromewebstore.google.com/'))) {
  add(indexFile, 'official Organization structured data is incomplete');
}
if (!/not affiliated with BypassAI/i.test(indexHtml)) {
  add(indexFile, 'missing similarly named service affiliation clarification');
}

if (!appHtml.includes('id="mode-dd-current">Humanize + Level Matching</span>')
    || !/<li class="mode-dd-option is-selected"[^>]*aria-selected="true"[^>]*data-mode="both">/.test(appHtml)
    || !/setMode\(['"]both['"]\);/.test(appHtml)) {
  add(appFile, 'Humanize + Level Matching must be the synchronized default mode');
}
if (!/<ul class="mode-dd-menu"[^>]*>\s*<li class="mode-dd-option is-selected"[^>]*data-mode="both">/.test(appHtml)
    || !appHtml.includes('class="mode-dd-default">Default</span>')
    || !appHtml.includes('class="mode-dd-recommended">Recommended</span>')) {
  add(appFile, 'the combined default mode must be first and show Default and Recommended badges');
}
if (!appHtml.includes('mode-dd-option-title">Level Matching Only</span>')
    || !appHtml.includes('mode-dd-option-title">Humanize Only</span>')) {
  add(appFile, 'single-tool mode labels must clearly say Only');
}
if (!appJs.includes("localStorage.getItem('bipass_pref_level')")) {
  add(appJsFile, 'must apply the default writing level saved in Settings');
}
if (!appHtml.includes('id="sample-scroll-shell"')
    || !appJs.includes('updateSampleScrollState()')
    || !appJs.includes('sampleContainer.scrollTo({')
    || !appHtml.includes('<span class="sample-wc">50 Words min</span>')) {
  add(appFile, 'writing samples must stay inside a capped, internally scrolling region');
}
if (!appHtml.includes('id="writing-profile-block"')
    || !appHtml.includes('id="create-profile-btn"')
    || appHtml.indexOf('id="writing-profile-block"') < appHtml.indexOf('id="level-box"')) {
  add(appFile, 'Writing Profile must be an always-visible block below Level Matching');
}
if (!appHtml.includes('id="writing-profile-option"')
    || !appHtml.includes('data-level="profile"')
    || !appHtml.includes('id="manual-customize-btn"')
    || !appHtml.includes('class="level-btn level-btn-custom"')
    || !appHtml.includes('data-level="customize"')
    || appHtml.indexOf('data-level="customize"') < appHtml.indexOf('data-level="hard"')
    || appHtml.includes('class="level-manual-btn"')) {
  add(appFile, 'Styles must keep Writing Profile primary and place Custom fourth in the preset selector');
}
if (!appHtml.includes('id="level-heading">Styles</div>')
    || appHtml.indexOf('id="writing-profile-option"') > appHtml.indexOf('class="level-track"')
    || !appHtml.includes('class="style-presets-head" aria-hidden="true"><span>OR</span>')
    || !appHtml.includes('class="level-profile-default">Default</span>')
    || !appHtml.includes('class="create-profile-fingerprint"')
    || appHtml.includes('class="writing-profile-sub"')
    || appHtml.includes('class="profile-card-summary"')
    || appJs.includes('profile.tone.evidence')
    || appJs.includes('profile.sentenceStyle.evidence')
    || appJs.includes('class="profile-score-evidence"')
    || appJs.includes('class="profile-card-level-row"')) {
  add(appFile, 'Styles must keep vocabulary scoring inside Details and use concise, evidence-free collapsed profile cards');
}
if (!appJs.includes('styleProfile: styleProfile || undefined')
    || !appJs.includes('storeAppliedProfile(data.profileApplied === true)')
    || !appJs.includes('if (removedActiveProfile) {')
    || !appJs.includes('sessionStorage.removeItem(APPLIED_PROFILE_KEY)')
    || !appJs.includes("selectorMode(selectedLevel, profileActive)")) {
  add(appJsFile, 'Writing Profile usage and active-profile deletion must keep result state honest');
}
if (!appJs.includes("'bipass-profile-details-toggle'")
    || !appJs.includes('function animateProfileDetails(details, shouldOpen)')
    || !appJs.includes('body.getAnimations().forEach(animation => animation.cancel())')
    || !appJs.includes("behavior: reduce ? 'auto' : 'smooth'")
    || !appJs.includes("block: 'center'")) {
  add(appJsFile, 'profile details must smoothly and interruptibly control the workflow guide');
}
if (!appJs.includes("document.addEventListener('bipass-level-change'")
    || !appJs.includes("event.detail?.mode === 'customize'")
    || !appJs.includes('autoCollapsedForCustomMode')) {
  add(appJsFile, 'Custom mode must compact the workflow guide through its animated collapse state');
}
if (!appJs.includes('class="profile-score-slider"')
    || !appJs.includes('class="profile-refine-form"')
    || !appJs.includes("fetch('/api/refine-profile'")
    || !appJs.includes('class="profile-reanalyze-btn"')
    || !appJs.includes('placeholder="Tell AI what to fix or change (optional)"')
    || appJs.indexOf('class="profile-ai-editor"') > appJs.indexOf('class="profile-score-list"')
    || appJs.includes('class="profile-score-track"')) {
  add(appJsFile, 'profile details must provide editable traits and compact AI refinement controls');
}
if (!editorJs.includes("customize: appliedProfile ? 'Writing Profile' : 'Customized'")) {
  add(editorJsFile, 'result metadata must distinguish profile matching from manual customization');
}
if (!editorHtml.includes('id="result-profile-wrap"')
    || !/<button class="result-profile-strip"[^>]*aria-expanded="false"[^>]*aria-controls="result-profile-popover"/.test(editorHtml)
    || !editorHtml.includes('role="region" aria-label="Applied writing profile details"')) {
  add(editorFile, 'result profile indicator must expose an accessible anchored detail region');
}
if (!editorJs.includes("sessionStorage.removeItem(APPLIED_PROFILE_KEY)")
    || !historyJs.includes("sessionStorage.removeItem('bipass_applied_profile')")) {
  add(editorJsFile, 'non-profile revisions and History results must clear stale profile indicators');
}
if (!styleCss.includes('@media (prefers-reduced-motion: reduce)')
    || !styleCss.includes('.result-profile-wrap.is-revealed .result-profile-fingerprint i { animation: none;')
    || !styleCss.includes('.level-btn-profile.is-analyzing .level-profile-fingerprint i,')) {
  add(styleFile, 'Writing Profile motion must have a static reduced-motion state');
}
const restoreStart = appJs.indexOf('function restoreState()');
const restoreEnd = appJs.indexOf('// ─── Events', restoreStart);
const restoreBlock = appJs.slice(restoreStart, restoreEnd);
if (restoreBlock.indexOf("const savedMyStyle = sessionStorage.getItem('bipass_my_style')") === -1
    || restoreBlock.indexOf("const savedMyStyle = sessionStorage.getItem('bipass_my_style')") > restoreBlock.indexOf('selectLevel(validLevels')
    || !restoreBlock.includes("sessionStorage.setItem('bipass_my_style', myStyleActive ? 'true' : 'false')")) {
  add(appJsFile, 'must preserve the My Style preference while restoring the default level');
}
if (!historyJs.includes("container.dataset.actionsBound === 'true'")) {
  add(historyFile, 'history card actions must only bind once');
}
if (!historyJs.includes('const HISTORY_LIMIT = 20')
    || !historyJs.includes("sessionStorage.setItem('bipass_result_id', loadBtn.dataset.id)")) {
  add(historyFile, 'History must show its 20-result cap and preserve opened result IDs');
}
if (!historyJs.includes("document.getElementById('history-clear-all')")
    || !historyJs.includes(".eq('user_id', session.user.id)")) {
  add(historyFile, 'Clear history must delete only the signed-in user’s results');
}
if (!editorJs.includes("fetch('/api/results'")
    || !editorJs.includes("sessionStorage.getItem('bipass_result_id')")) {
  add(editorJsFile, 'editor results must save through the capped API without refresh duplicates');
}
if (!serverJs.includes('export const HISTORY_RESULT_LIMIT = 20')
    || !serverJs.includes("code: 'HISTORY_FULL'")) {
  add(serverFile, 'server must enforce the 20-result History cap');
}
if (!/return\s*\{\s*\.\.\.\(user\.app_metadata\s*\|\|\s*\{\}\)\s*\}/.test(authJs)) {
  add(authFile, 'billing UI must trust server-controlled app_metadata only');
}

for (const name of ['index.html', 'howto.html']) {
  const file = join(root, name);
  const html = readFileSync(file, 'utf8');
  if (!/Level Matching uses? 4 credits per word/i.test(html)
      && !/Level Matching: 4 credits per word/i.test(html)) {
    add(file, 'must explain word-based billing for Level Matching');
  }
  if (/1 credit\s*=\s*1 character in the output/i.test(html)) {
    add(file, 'contains obsolete output-character billing claim for Level Matching');
  }
  if (!/Both mode costs 18 credits per word|Humanize \+ Level Matching costs 18 credits per word/i.test(html)) {
    add(file, 'must explain the 18-credit Both mode rate');
  }
}

if (errors.length) {
  console.error(`Site audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Site audit passed: ${htmlFiles.length} HTML files checked.`);
}
