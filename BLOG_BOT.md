# Blog automation — instructions for the article bot

This repo is the Bipass AI website: a **static HTML site** served by Express
(`server.js` → `express.static(__dirname)`), deployed on **Railway**. Pushing to
`main` auto-deploys. Blog articles are standalone `.html` files in `blog/`.

**Do not hand-write article HTML.** Two scripts already produce correctly-templated
articles (matching the site's nav, fonts, dark theme, meta/OG/JSON-LD, and CTA) and
insert the blog card automatically. Use them.

## Categories
Every article has one category tag, exactly one of:
`AI Detection`, `Tools`, `How To`, `Comparison`.

## Option A — you write the article yourself (no API key needed)
1. Write the article as **Markdown**: start with `# Title`, use `##` for sections,
   `-` for bullets, `**bold**`, and `[text](url)` for links.
2. Save it to a file, e.g. `draft.md`.
3. Run:
   ```
   node add-article.js draft.md "The Title" "AI Detection"
   ```
   (Title and category are optional — title falls back to the first `# ` line,
   category defaults to "How To".) This writes `blog/<slug>.html`, inserts the card
   into `blog/index.html`, and auto-fills the meta description, excerpt, and read time.
   It skips if an article with that slug already exists.

## Option B — let the script write it via OpenRouter (needs OPENROUTER_API_KEY)
```
node generate-article.js "a keyword or topic"
node generate-article.js --file topics.txt        # batch: one topic per line
```

## Publish (this is what makes it live — no human step)
```
git add -A
git commit -m "blog: add <slug>"
git push origin main
```
Railway redeploys from `main`; the article is live at
`https://bipassai.com/blog/<slug>.html` within a minute or two.

## Optional — tell search engines (only AFTER it's live)
```
node ping-indexnow.js https://bipassai.com/blog/<slug>.html
```

## Rules
- Only create/modify files under `blog/` (plus `topics.txt`). Never touch
  `style.css`, `server.js`, `app.html`, or other app pages.
- Tone: casual, student-to-student, honest, beginner-friendly. Target student
  keywords around AI detection, Turnitin, GPTZero, humanizing AI text, AI writing tools.
- Mention "Bipass AI" naturally once or twice — never spammy. Don't claim
  "100% undetectable."
