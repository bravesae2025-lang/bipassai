#!/usr/bin/env node
/**
 * add-article.js — BipassAI Blog Article Generator
 * Usage: node add-article.js <draft.md> "<Title>" "<Category>" "<Description>" "<Keywords>"
 *
 * Reads a markdown draft, converts it to a fully styled HTML article
 * matching the BipassAI site template, and adds a card to blog/index.html.
 *
 * Only touches: blog/<slug>.html and blog/index.html
 */

const fs = require('fs');
const path = require('path');

// --- Args ---
const [,, draftPath, title, category, description, keywords] = process.argv;

if (!draftPath || !title || !category || !description) {
  console.error('Usage: node add-article.js <draft.md> "<Title>" "<Category>" "<Description>" "[Keywords]"');
  process.exit(1);
}

// --- Helpers ---
function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function estimateReadTime(text) {
  const words = text.split(/\s+/).length;
  const mins = Math.round(words / 200);
  return Math.max(mins, 1) + ' min read';
}

function getMonthYear() {
  const d = new Date();
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function getISODate() {
  return new Date().toISOString().split('T')[0];
}

// --- Markdown to HTML (minimal, handles what the articles use) ---
function mdToHtml(md) {
  let html = md
    // Escape HTML entities first (basic)
    .replace(/&(?!amp;|lt;|gt;|quot;)/g, '&amp;')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# .+$/gm, '') // skip H1 — used as article title
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$1">$2</a>')
    .replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, '<a href="/$2">$1</a>')
    // Horizontal rules
    .replace(/^---+$/gm, '<hr class="blog-post-divider">')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // Lists — group consecutive list items
  const lines = html.split('\n');
  const result = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ulMatch = line.match(/^- (.+)$/);
    const olMatch = line.match(/^\d+\. (.+)$/);

    if (ulMatch) {
      if (!inUl) { result.push('<ul>'); inUl = true; }
      result.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (!inOl) { result.push('<ol>'); inOl = true; }
      result.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(line);
    }
  }
  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');

  html = result.join('\n');

  // Wrap paragraphs — lines that aren't already HTML tags
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|ul|ol|li|blockquote|hr|div|p)/.test(trimmed)) return trimmed;
    if (/^<\/(ul|ol|div)>/.test(trimmed)) return trimmed;
    return `<p>${trimmed}</p>`;
  }).filter(l => l !== '').join('\n      ');

  return html;
}

// --- Read draft ---
const draftRaw = fs.readFileSync(draftPath, 'utf8');
const bodyHtml = mdToHtml(draftRaw);
const slug = slugify(title);
const readTime = estimateReadTime(draftRaw);
const monthYear = getMonthYear();
const isoDate = getISODate();
const kw = keywords || '';
const articleUrl = `https://bipassai.com/blog/${slug}.html`;

// --- Build full HTML ---
const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <meta name="keywords" content="${kw}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${articleUrl}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:site_name" content="Bipass AI">
  <meta property="og:image" content="https://bipassai.com/favicon.png">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:image" content="https://bipassai.com/favicon.png">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <title>${title} — Bipass AI</title>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title}",
    "description": "${description}",
    "url": "${articleUrl}",
    "datePublished": "${isoDate}",
    "dateModified": "${isoDate}",
    "author": {"@type": "Organization", "name": "Bipass AI"},
    "publisher": {
      "@type": "Organization",
      "name": "Bipass AI",
      "logo": {"@type": "ImageObject", "url": "https://bipassai.com/favicon.png"}
    },
    "image": "https://bipassai.com/favicon.png",
    "mainEntityOfPage": {"@type": "WebPage", "@id": "${articleUrl}"}
  }
  <\/script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/style.css?v=43">
  <style>
    .blog-post-wrap{max-width:760px;margin:0 auto;padding:0 24px 100px}
    .blog-post-header{padding:64px 0 40px}
    .blog-post-tag{font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--g400);margin:0 0 14px;display:block}
    .blog-post-header h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,5vw,3.6rem);letter-spacing:.04em;line-height:1.1;color:#0d0d0d;margin:0 0 16px}
    .blog-post-meta{color:var(--g400);font-size:.82rem;display:flex;gap:12px;align-items:center;margin:0 0 36px}
    .blog-post-meta-dot{width:3px;height:3px;border-radius:50%;background:var(--g300)}
    .blog-post-divider{border:none;border-top:1px solid var(--g150);margin:0 0 40px}
    .blog-post-body{font-size:1.02rem;line-height:1.75;color:#1a1a1a}
    .blog-post-body h2{font-family:'Syne',sans-serif;font-size:1.45rem;font-weight:700;color:#0d0d0d;margin:48px 0 16px;line-height:1.3}
    .blog-post-body h3{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:#0d0d0d;margin:32px 0 12px}
    .blog-post-body p{margin:0 0 20px}
    .blog-post-body ul,.blog-post-body ol{margin:0 0 20px;padding-left:24px}
    .blog-post-body li{margin-bottom:8px}
    .blog-post-body strong{color:#0d0d0d}
    .blog-post-body a{color:#0d0d0d;text-decoration:underline}
    .blog-post-body blockquote{border-left:3px solid #0d0d0d;margin:32px 0;padding:16px 24px;background:var(--g050);border-radius:0 8px 8px 0}
    .blog-post-body blockquote p{margin:0;color:var(--g600);font-style:italic}
    .blog-cta-box{background:#0d0d0d;color:#fff;border-radius:12px;padding:32px 36px;margin:48px 0;text-align:center}
    .blog-cta-box h3{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:.04em;margin:0 0 10px;color:#fff}
    .blog-cta-box p{color:rgba(255,255,255,.7);margin:0 0 20px;font-size:.95rem}
    .blog-cta-btn{display:inline-block;background:#fff;color:#0d0d0d;font-weight:700;font-size:.95rem;padding:12px 28px;border-radius:8px;text-decoration:none;transition:opacity .2s}
    .blog-cta-btn:hover{opacity:.85}
    .blog-tip-box{border:1px solid var(--g200);border-radius:10px;padding:20px 24px;margin:24px 0;background:var(--g050)}
    .blog-tip-box p{margin:0;font-size:.9rem;color:var(--g600)}
    .blog-tip-box strong{color:#0d0d0d}
    .blog-related{margin:60px 0 0;padding-top:40px;border-top:1px solid var(--g150)}
    .blog-related h3{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:var(--g400);text-transform:uppercase;letter-spacing:.08em;margin:0 0 20px}
    .blog-related-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    @media(max-width:560px){.blog-related-grid{grid-template-columns:1fr}}
    .blog-related-card{border:1px solid var(--g150);border-radius:10px;padding:18px;text-decoration:none;display:block;transition:box-shadow .2s}
    .blog-related-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)}
    .blog-related-card span{font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--g400);display:block;margin-bottom:6px}
    .blog-related-card p{font-size:.9rem;font-weight:600;color:#0d0d0d;margin:0;line-height:1.4}
    .blog-breadcrumb{padding:24px 0 0;font-size:.82rem;color:var(--g400)}
    .blog-breadcrumb a{color:var(--g400);text-decoration:underline}
  </style>
</head>
<body class="editor-page">

  <div class="bg-dots" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>

  <nav class="navbar">
    <div class="nav-inner">
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
      <a class="nav-logo" href="/home">BIPASS AI</a>
      <div class="nav-links">
        <a class="nav-link" href="/home">Home</a>
        <a class="nav-link" href="/about.html">About</a>
        <a class="nav-link" href="/history.html">History</a>
        <a class="nav-link" href="/plans.html">Plans</a>
        <a class="nav-link" href="/howto.html">How to Use</a>
        <a class="nav-link" href="/settings.html">Settings</a>
      </div>
      <div class="nav-user" id="nav-user"></div>
    </div>
  </nav>

  <div class="drawer-overlay" id="drawer-overlay"></div>
  <aside class="drawer" id="drawer" aria-label="Navigation menu">
    <div class="drawer-head">
      <span class="drawer-brand">BIPASS AI</span>
      <button class="drawer-close" id="drawer-close" aria-label="Close menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="drawer-user" id="drawer-user"></div>
    <div class="drawer-plan" id="drawer-plan"></div>
    <nav class="drawer-nav">
      <a class="drawer-item" href="/home">Home</a>
      <a class="drawer-item" href="/about.html">About</a>
      <a class="drawer-item" href="/history.html">History</a>
      <a class="drawer-item" href="/plans.html">Plans</a>
      <a class="drawer-item" href="/howto.html">How to Use</a>
      <a class="drawer-item" href="/settings.html">Settings</a>
    </nav>
    <div class="drawer-footer">
      <button class="drawer-signout-btn" id="drawer-signout-btn">Sign out</button>
    </div>
  </aside>

  <div class="blog-post-wrap">
    <div class="blog-breadcrumb">
      <a href="/blog/">Blog</a> &rsaquo; ${category}
    </div>

    <div class="blog-post-header">
      <span class="blog-post-tag">${category}</span>
      <h1>${title}</h1>
      <div class="blog-post-meta">
        <span>${monthYear}</span>
        <span class="blog-post-meta-dot"></span>
        <span>${readTime}</span>
        <span class="blog-post-meta-dot"></span>
        <span>By Bipass AI</span>
      </div>
    </div>
    <hr class="blog-post-divider">

    <div class="blog-post-body">
      ${bodyHtml}
    </div>
  </div>

  <script src="/script.js" defer></script>
  <script src="/auth.js?v=3" defer></script>
</body>
</html>`;

// --- Write article file ---
const outPath = path.join(__dirname, 'blog', `${slug}.html`);
if (fs.existsSync(outPath)) {
  console.log(`⚠️  Skipped — article already exists: blog/${slug}.html`);
  process.exit(0);
}
fs.writeFileSync(outPath, articleHtml, 'utf8');
console.log(`✅ Article written: blog/${slug}.html`);

// --- Add card to blog/index.html ---
const indexPath = path.join(__dirname, 'blog', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const newCard = `
      <a class="blog-card" href="/blog/${slug}.html">
        <div class="blog-card-body">
          <div class="blog-card-tag">${category}</div>
          <h2>${title}</h2>
          <p>${description}</p>
          <div class="blog-card-meta">
            <span>${monthYear}</span>
            <span class="blog-card-dot"></span>
            <span>${readTime}</span>
          </div>
        </div>
      </a>`;

// Insert before closing </div> of blog-grid
const marker = '</div>\n\n  <script';
if (!indexHtml.includes(marker)) {
  console.error('❌ Could not find insertion point in blog/index.html');
  process.exit(1);
}
indexHtml = indexHtml.replace(marker, `${newCard}\n    </div>\n\n  <script`);
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log(`✅ Card added to blog/index.html`);
console.log(`🌐 Will be live at: ${articleUrl}`);
