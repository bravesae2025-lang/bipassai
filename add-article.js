#!/usr/bin/env node
/*
 * Bipass AI — publish a hand-written / pasted article into the blog.
 * Use this when the article TEXT already exists (e.g. from OpenClaw) and you
 * just need it wrapped in the real site template + a card added.
 *
 * Usage:
 *   node add-article.js draft.md                       # title from first "# " line
 *   node add-article.js draft.md "My Title"            # explicit title
 *   node add-article.js draft.md "My Title" "Tools"    # explicit title + category
 *
 * Accepts EITHER Markdown (## headings, **bold**, - lists, > quotes, [a](url))
 * OR ready-made HTML body (<h2>/<p>/<ul>...). It auto-detects which.
 *
 * It writes blog/<slug>.html and inserts a card into blog/index.html, using the
 * exact same template as generate-article.js. It does NOT call any AI and does
 * NOT deploy — review locally, then push yourself (or let your bot push).
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { buildArticlePage, insertCard, slugify, CONFIG, TAGS } from "./generate-article.js";

// --- tiny inline-markdown helpers ---
function inline(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

// Convert a Markdown string to the limited HTML our article CSS styles.
// Returns { title, bodyHtml }.
function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let title = null;
  let i = 0;

  const flushList = (items, ordered) => {
    out.push("      <" + (ordered ? "ol" : "ul") + ">");
    for (const it of items) out.push("        <li>" + inline(it) + "</li>");
    out.push("      </" + (ordered ? "ol" : "ul") + ">");
  };

  while (i < lines.length) {
    let line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    // Title (first # heading)
    if (/^#\s+/.test(trimmed) && title === null) {
      title = trimmed.replace(/^#\s+/, "").trim();
      i++; continue;
    }
    // Headings
    if (/^###\s+/.test(trimmed)) { out.push("      <h3>" + inline(trimmed.replace(/^###\s+/, "")) + "</h3>"); i++; continue; }
    if (/^##\s+/.test(trimmed))  { out.push("      <h2>" + inline(trimmed.replace(/^##\s+/, ""))  + "</h2>"); i++; continue; }
    if (/^#\s+/.test(trimmed))   { out.push("      <h2>" + inline(trimmed.replace(/^#\s+/, ""))   + "</h2>"); i++; continue; }

    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) { quote.push(lines[i].trim().replace(/^>\s?/, "")); i++; }
      out.push("      <blockquote><p>" + inline(quote.join(" ")) + "</p></blockquote>");
      continue;
    }
    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, "")); i++; }
      flushList(items, false);
      continue;
    }
    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s+/, "")); i++; }
      flushList(items, true);
      continue;
    }
    // Paragraph (gather consecutive non-blank, non-special lines)
    const para = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l || /^(#{1,3}\s+|>\s?|[-*]\s+|\d+\.\s+)/.test(l)) break;
      para.push(l);
      i++;
    }
    out.push("      <p>" + inline(para.join(" ")) + "</p>");
  }

  return { title, bodyHtml: out.join("\n") };
}

// Strip tags + collapse whitespace, for excerpt / read-time
function plainText(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function firstSentence(text, max) {
  const t = text.slice(0, max + 60);
  const cut = t.indexOf(". ");
  let s = cut > 40 && cut < max ? t.slice(0, cut + 1) : t.slice(0, max);
  if (s.length >= max) s = s.replace(/\s+\S*$/, "") + "…";
  return s.trim();
}

function main() {
  const [draftPath, titleArg, tagArg] = process.argv.slice(2);
  if (!draftPath) {
    console.error('Usage: node add-article.js <draft-file> ["Title"] ["Category"]');
    console.error('Categories: ' + TAGS.join(", "));
    process.exit(1);
  }
  if (!fs.existsSync(draftPath)) {
    console.error("Draft file not found:", draftPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(draftPath, "utf8").trim();
  const looksLikeHtml = /<(p|h2|h3|ul|ol|li|strong|a|blockquote)\b/i.test(raw);

  let title = titleArg || null;
  let bodyHtml;

  if (looksLikeHtml) {
    bodyHtml = raw;
    if (!title) {
      const m = raw.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (m) { title = m[1].replace(/<[^>]+>/g, "").trim(); bodyHtml = raw.replace(m[0], "").trim(); }
    }
  } else {
    const md = markdownToHtml(raw);
    bodyHtml = md.bodyHtml;
    if (!title) title = md.title;
  }

  if (!title) {
    console.error("No title found. Add a \"# Title\" line to the draft or pass it as the 2nd argument.");
    process.exit(1);
  }

  let tag = tagArg || "How To";
  if (!TAGS.includes(tag)) {
    console.error('Warning: "' + tag + '" is not a known category; using "How To". Valid: ' + TAGS.join(", "));
    tag = "How To";
  }

  const text = plainText(bodyHtml);
  const words = text ? text.split(" ").length : 0;
  const readMinutes = Math.max(3, Math.round(words / 200));
  const metaDescription = firstSentence(text, 155);
  const excerpt = firstSentence(text, 125);
  const keywords = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3).slice(0, 8).join(", ");

  const slug = slugify(title);
  const url = `${CONFIG.baseUrl}/blog/${slug}.html`;
  const filePath = path.join(CONFIG.blogDir, slug + ".html");

  if (fs.existsSync(filePath)) {
    console.error("Skipped — blog/" + slug + ".html already exists. Rename the title or delete the old file.");
    process.exit(1);
  }

  const page = buildArticlePage({ title, metaDescription, keywords, tag, readMinutes, bodyHtml, url });
  fs.writeFileSync(filePath, page);
  console.log("Wrote blog/" + slug + ".html  [" + tag + ", " + readMinutes + " min, " + words + " words]");

  insertCard({ title, tag, excerpt, readMinutes, slug });
  console.log("Added card to blog/index.html (top of grid)");

  console.log("\nDone. Review it locally, then push to deploy.");
  console.log("After it's live:  node ping-indexnow.js " + url);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
