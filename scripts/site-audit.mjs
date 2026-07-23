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
const extensionHtml = readFileSync(extensionHtmlFile, 'utf8');
const extensionJs = readFileSync(extensionJsFile, 'utf8');
if (!/id=["']login-username["']/.test(extensionHtml)) {
  add(extensionHtmlFile, 'username accounts need a username login field');
}
if (!/login\.html\?mode=signup/.test(extensionJs)) {
  add(extensionJsFile, 'sign-up link must open the create-account mode');
}
if (!/usernameToEmail\(username\)/.test(extensionJs)) {
  add(extensionJsFile, 'username login must use the same internal email mapping as the website');
}

if (errors.length) {
  console.error(`Site audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Site audit passed: ${htmlFiles.length} HTML files checked.`);
}
