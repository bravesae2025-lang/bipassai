#!/usr/bin/env node
/*
 * Bipass AI SEO article pipeline
 * Usage:  node generate-article.js "how to bypass turnitin ai detection"
 *
 * What it does:
 *   1. Asks DeepSeek (via OpenRouter) to write an SEO article for the keyword
 *   2. Saves it as a static HTML file in blog/ that matches the real site template
 *   3. Inserts a card into blog/index.html at the <!-- ARTICLE_CARDS --> marker (newest first)
 *
 * It does NOT ping IndexNow and does NOT deploy. Review the article, push to Railway
 * yourself, then run:  node ping-indexnow.js https://bipassai.com/blog/<slug>.html
 */

import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- CONFIG ----------
const CONFIG = {
  openRouterKey: process.env.OPENROUTER_API_KEY,   // set as an env var, never hardcode
  model: "deepseek/deepseek-chat",                 // DeepSeek V3 on OpenRouter
  blogDir: path.join(__dirname, "blog"),
  baseUrl: "https://bipassai.com",
  cssHref: "/style.css?v=43",                      // real versioned stylesheet
  brand: "Bipass AI",
};

// Allowed category tags (must match the existing blog cards)
const TAGS = ["AI Detection", "Tools", "How To", "Comparison"];
// -----------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
}

// Escape a string for use inside an HTML attribute value
function escapeAttr(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function monthYear(date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

// Verbatim navbar + drawer block used on every blog page
const NAV_HTML = `  <nav class="navbar">
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
  </aside>`;

// Verbatim inline style block used by every article (blog/best-free-ai-humanizer.html)
const ARTICLE_STYLE = `  <style>
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
    .blog-post-body ul,
    .blog-post-body ol{margin:0 0 20px;padding-left:24px}
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
    .blog-tool-card{border:1px solid var(--g150);border-radius:12px;padding:24px;margin:24px 0;background:#fff}
    .blog-tool-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
    .blog-tool-card-head h3{margin:0;font-size:1.1rem}
    .blog-tool-badge{font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:20px;white-space:nowrap}
    .badge-best{background:#0d0d0d;color:#fff}
    .badge-good{background:var(--g100);color:var(--g600)}
    .badge-limited{background:#fff3cd;color:#856404;border:1px solid #ffc107}
    .blog-tool-card p{margin:0 0 14px;font-size:.92rem;color:var(--g600)}
    .blog-tool-pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
    @media(max-width:480px){.blog-tool-pros-cons{grid-template-columns:1fr}}
    .blog-tool-pros,.blog-tool-cons{font-size:.84rem}
    .blog-tool-pros strong,.blog-tool-cons strong{display:block;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;color:var(--g400)}
    .blog-tool-pros li,.blog-tool-cons li{margin-bottom:4px;color:var(--g600);list-style:none;padding-left:16px;position:relative}
    .blog-tool-pros li::before{content:"\\2713";position:absolute;left:0;color:#22c55e;font-weight:700}
    .blog-tool-cons li::before{content:"\\2717";position:absolute;left:0;color:#ef4444;font-weight:700}
    .blog-compare-table{width:100%;border-collapse:collapse;margin:24px 0;font-size:.88rem}
    .blog-compare-table th{background:#0d0d0d;color:#fff;padding:10px 14px;text-align:left;font-weight:600}
    .blog-compare-table td{padding:10px 14px;border-bottom:1px solid var(--g100);vertical-align:top}
    .blog-compare-table tr:last-child td{border-bottom:none}
    .blog-compare-table tr:nth-child(even) td{background:var(--g050)}
    .tbl-yes{color:#16a34a;font-weight:600}
    .tbl-no{color:#dc2626;font-weight:600}
    .tbl-partial{color:#d97706;font-weight:600}
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
    .blog-rank-number{display:inline-block;width:28px;height:28px;background:#0d0d0d;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:.82rem;font-weight:700;margin-right:8px;vertical-align:middle}
  </style>`;

// Call OpenRouter and get back: {title, metaDescription, keywords, tag, excerpt, readMinutes, bodyHtml}
function generateArticle(keyword) {
  const systemPrompt =
    "You are an expert SEO writer for " + CONFIG.brand + ", a tool that humanizes AI text and helps " +
    "students avoid AI detection. Return ONLY valid JSON, no markdown, no backticks. " +
    'Shape: {"title": string, "metaDescription": string, "keywords": string, "tag": string, ' +
    '"excerpt": string, "readMinutes": number, "bodyHtml": string}. ' +
    "title: under 60 chars, includes the keyword. " +
    "metaDescription: under 155 chars, compelling, includes the keyword. " +
    "keywords: 6-12 comma-separated SEO keywords. " +
    "tag: EXACTLY one of these categories: " + TAGS.map((t) => '"' + t + '"').join(", ") + ". " +
    "excerpt: a punchy summary under 130 chars for the blog card. " +
    "readMinutes: integer estimate of reading time (4-10). " +
    "bodyHtml: the article body as clean HTML using ONLY these tags: " +
    "<h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <a>, <blockquote>. " +
    "800-1200 words, genuinely helpful, naturally mentions " + CONFIG.brand +
    " as a solution once or twice without being spammy. " +
    "Do NOT include an <h1>, a title, a call-to-action box, or any <html>/<head>/<body> tags.";

  const payload = JSON.stringify({
    model: CONFIG.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Write an SEO article targeting this keyword: " + keyword },
    ],
  });

  const options = {
    hostname: "openrouter.ai",
    path: "/api/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + CONFIG.openRouterKey,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const content = json.choices[0].message.content.trim();
          const clean = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
          const article = JSON.parse(clean);
          if (!TAGS.includes(article.tag)) article.tag = TAGS[0];
          if (!article.readMinutes) article.readMinutes = 6;
          if (!article.excerpt) article.excerpt = article.metaDescription;
          resolve(article);
        } catch (err) {
          reject(new Error("Failed to parse model response: " + err.message + "\nRaw: " + data.slice(0, 500)));
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// Assemble the full standalone HTML page, matching the real bipassai.com article template
function buildArticlePage({ title, metaDescription, keywords, tag, readMinutes, bodyHtml, url }) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const t = escapeAttr(title);
  const d = escapeAttr(metaDescription);
  const ctaBox =
    `      <div class="blog-cta-box">\n` +
    `        <h3>Try ${CONFIG.brand} free — 2,000 credits, no card</h3>\n` +
    `        <p>Humanize, level-adjust, and auto-type into Google Docs. New accounts get 2,000 credits and a free 24-hour pass instantly.</p>\n` +
    `        <a class="blog-cta-btn" href="/home">Get Started Free &rarr;</a>\n` +
    `      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${d}">
  <meta name="keywords" content="${escapeAttr(keywords || "")}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="${CONFIG.brand}">
  <meta property="og:image" content="${CONFIG.baseUrl}/favicon.png">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:image" content="${CONFIG.baseUrl}/favicon.png">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <title>${t}</title>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(title)},
    "description": ${JSON.stringify(metaDescription)},
    "url": ${JSON.stringify(url)},
    "datePublished": "${today}",
    "dateModified": "${today}",
    "author": {"@type": "Organization", "name": ${JSON.stringify(CONFIG.brand)}},
    "publisher": {
      "@type": "Organization",
      "name": ${JSON.stringify(CONFIG.brand)},
      "logo": {"@type": "ImageObject", "url": "${CONFIG.baseUrl}/favicon.png"}
    },
    "image": "${CONFIG.baseUrl}/favicon.png",
    "mainEntityOfPage": {"@type": "WebPage", "@id": ${JSON.stringify(url)}}
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="${CONFIG.cssHref}">
${ARTICLE_STYLE}
</head>
<body class="editor-page">

  <div class="bg-dots" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>

${NAV_HTML}

  <div class="blog-post-wrap">
    <div class="blog-breadcrumb">
      <a href="/blog/">Blog</a> &rsaquo; ${tag}
    </div>

    <div class="blog-post-header">
      <span class="blog-post-tag">${tag}</span>
      <h1>${title}</h1>
      <div class="blog-post-meta">
        <span>${monthYear(now)}</span>
        <span class="blog-post-meta-dot"></span>
        <span>${readMinutes} min read</span>
        <span class="blog-post-meta-dot"></span>
        <span>By ${CONFIG.brand}</span>
      </div>
    </div>
    <hr class="blog-post-divider">

    <div class="blog-post-body">
${bodyHtml}
${ctaBox}
    </div>
  </div>

  <script src="/script.js" defer></script>
  <script src="/auth.js?v=3" defer></script>
  <script src="/cursor.js?v=4" defer></script>
</body>
</html>
`;
}

// Insert a card into blog/index.html at the marker (newest first)
function insertCard({ title, tag, excerpt, readMinutes, slug }) {
  const indexPath = path.join(CONFIG.blogDir, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  const marker = "<!-- ARTICLE_CARDS -->";
  if (!html.includes(marker)) {
    throw new Error("Marker " + marker + " not found in blog/index.html. Add it right after <div class=\"blog-grid\">.");
  }
  const card = `<a class="blog-card" href="/blog/${slug}.html">
        <div class="blog-card-body">
          <div class="blog-card-tag">${tag}</div>
          <h2>${title}</h2>
          <p>${excerpt}</p>
          <div class="blog-card-meta">
            <span>${monthYear(new Date())}</span>
            <span class="blog-card-dot"></span>
            <span>${readMinutes} min read</span>
          </div>
        </div>
      </a>

      ${marker}`;
  html = html.replace(marker, card);
  fs.writeFileSync(indexPath, html);
}

// Read a topics file: one topic per line, blank lines and #comments ignored
function readTopicsFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

// Generate one article. Returns the URL on success, or null if skipped.
async function generateOne(keyword) {
  console.log("\n→ Generating article for:", keyword);
  const article = await generateArticle(keyword);
  const slug = slugify(article.title);
  const url = `${CONFIG.baseUrl}/blog/${slug}.html`;
  const filePath = path.join(CONFIG.blogDir, slug + ".html");

  // Skip-if-exists guard: don't overwrite an article or add a duplicate card
  if (fs.existsSync(filePath)) {
    console.log("  Skipped — blog/" + slug + ".html already exists.");
    return null;
  }

  const page = buildArticlePage({ ...article, url });
  fs.writeFileSync(filePath, page);
  console.log("  Wrote blog/" + slug + ".html  [" + article.tag + ", " + article.readMinutes + " min]");

  insertCard({ title: article.title, tag: article.tag, excerpt: article.excerpt, readMinutes: article.readMinutes, slug });
  console.log("  Added card to blog/index.html (top of grid)");
  return url;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage:');
    console.error('  node generate-article.js "your topic here"            # one article');
    console.error('  node generate-article.js "topic 1" "topic 2" ...      # several articles');
    console.error('  node generate-article.js --file topics.txt            # one per line in the file');
    process.exit(1);
  }
  if (!CONFIG.openRouterKey) {
    console.error("Set OPENROUTER_API_KEY env var first.");
    process.exit(1);
  }

  // Build the list of topics from either --file or inline args
  let topics;
  if (args[0] === "--file") {
    const filePath = args[1];
    if (!filePath) {
      console.error("Usage: node generate-article.js --file topics.txt");
      process.exit(1);
    }
    if (!fs.existsSync(filePath)) {
      console.error("Topics file not found:", filePath);
      process.exit(1);
    }
    topics = readTopicsFile(filePath);
    if (topics.length === 0) {
      console.error("No topics found in", filePath, "(one topic per line; # for comments).");
      process.exit(1);
    }
  } else {
    topics = args;
  }

  console.log("Topics to generate:", topics.length);
  const created = [];
  let skipped = 0;
  for (const topic of topics) {
    try {
      const url = await generateOne(topic);
      if (url) created.push(url);
      else skipped++;
    } catch (err) {
      console.error("  Failed for \"" + topic + "\":", err.message);
    }
  }

  console.log("\nDone. Created " + created.length + ", skipped " + skipped + ", of " + topics.length + " topics.");
  console.log("Review locally, then push to Railway yourself.");
  if (created.length) {
    console.log("After they're live, submit to IndexNow:");
    for (const url of created) console.log("  node ping-indexnow.js " + url);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}

export { slugify, buildArticlePage, insertCard, generateArticle, generateOne, readTopicsFile, CONFIG, TAGS };
