# BLOG_BOT.md — OpenClaw Blog Bot Instructions

This file tells OpenClaw exactly how to publish a new blog article to BipassAI.

## Stack
- Static HTML site, Express, deployed on Railway
- Railway auto-deploys from `main` branch
- Articles live at: `https://bipassai.com/blog/<slug>.html`

## How to Publish an Article

### Step 1 — Clone or pull the repo
```bash
cd /tmp
if [ -d bipassai ]; then
  cd bipassai && git pull origin main
else
  git clone https://github.com/bravesae2025-lang/bipassai.git && cd bipassai
fi
```

### Step 2 — Write the article as a .md file
Save the article markdown to `/tmp/<slug>.md`

### Step 3 — Run add-article.js
```bash
cd /tmp/bipassai
node add-article.js /tmp/<slug>.md "<Full Title>" "<Category>" "<One sentence description>" "<keyword1, keyword2, keyword3>"
```

Categories available: `AI Detection` | `Tools` | `How To` | `Student Guide`

### Step 4 — Commit and push
```bash
cd /tmp/bipassai
git add blog/<slug>.html blog/index.html
git commit -m "blog: add <slug>"
git push origin main
```

Railway auto-deploys. Live in ~2 minutes at `https://bipassai.com/blog/<slug>.html`

## Hard Rules — Never Break These
- Only modify files inside `blog/` — never touch `style.css`, `server.js`, `script.js`, `auth.js`, or any app pages
- Never force push, rebase, or reset
- Never push to any branch except `main`
- If `blog/<slug>.html` already exists, the script will skip it automatically
- Always report back with the live URL after pushing

## Git Auth
Use the GitHub PAT stored in the environment as `GITHUB_PAT`.
Configure git before pushing:
```bash
git remote set-url origin https://$GITHUB_PAT@github.com/bravesae2025-lang/bipassai.git
git config user.email "bot@bipassai.com"
git config user.name "BipassAI Bot"
```
