import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';
import Stripe from 'stripe';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT || 3000;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const GEMINI_STREAM_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent';

const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL    = 'claude-sonnet-4-6';

async function callClaude(prompt, stream = false) {
  return fetch(CLAUDE_ENDPOINT, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:       CLAUDE_MODEL,
      max_tokens:  8192,
      temperature: 1.0,
      stream,
      messages:    [{ role: 'user', content: prompt }],
    }),
  });
}

const SUPABASE_URL     = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const SUPABASE_ANON_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZXdtdWdxcnBkaHBkZnl2enB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjQ3MzMsImV4cCI6MjA5NDU0MDczM30.euNVW05tZ39McxW9vvgcv527I2Pk8VeeUy1jcu21FSE';
const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REDIRECT_URI         = 'https://bipassai.com/auth/google/callback';

const INITIAL_CREDITS = 5000;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const STRIPE_PRICES = {
  day:     'price_1TeiVy0rExXCXCyXY6r0dH7a',
  weekly:  'price_1TeiWs0rExXCXCyXa6IDQycH',
  monthly: 'price_1TeiXE0rExXCXCyXI5c3l9Hk',
  annual:  'price_1TeiXo0rExXCXCyXVTDAL1cD',
};

async function getUserFromToken(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
  });
  if (!res.ok) return null;
  return res.json();
}

async function updateUserMeta(userId, metaFields) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method:  'PUT',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'apikey':        SUPABASE_SERVICE_KEY,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ user_metadata: metaFields }),
  });
}

async function updateUserCredits(userId, credits) {
  await updateUserMeta(userId, { credits });
}

async function getUserById(userId) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'apikey': SUPABASE_SERVICE_KEY },
  });
  if (!res.ok) return null;
  return res.json();
}

const CREDIT_PACKAGES = {
  c5000:   5_000,
  c20000:  20_000,
  c50000:  50_000,
  c100000: 100_000,
};

const STRIPE_CREDIT_PRICES = {
  c5000:   'price_1Te9500rExXCXCyX8wkXy18D',
  c20000:  'price_1Te95k0rExXCXCyX0KzAO1Im',
  c50000:  'price_1Te96Q0rExXCXCyXvG8Y1Mjq',
  c100000: 'price_1Te96o0rExXCXCyXzMfjMkvG',
};

// In-memory state store for CSRF protection (single instance — fine for Railway hobby)
const oauthStates = new Map();

// ─── Stripe webhook (raw body — must be before express.json()) ─

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(500).json({ error: 'Webhook secret not configured' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const type   = session.metadata?.type;

    if (type === 'credits') {
      const pkg    = session.metadata?.pkg;
      const amount = CREDIT_PACKAGES[pkg];
      if (userId && amount) {
        const user    = await getUserById(userId);
        const current = user?.user_metadata?.credits ?? 0;
        await updateUserMeta(userId, { credits: current + amount });
      }
    } else if (type === 'plan') {
      const plan   = session.metadata?.plan;
      const config = PLAN_CONFIG[plan];
      if (userId && config) {
        await updateUserMeta(userId, {
          tier: plan,
          plan_expires_at: Date.now() + config.ms,
          credits: config.credits,
          credits_expire_at: null,
        });
      }
    }
  }

  res.json({ received: true });
});

// ─── Middleware ────────────────────────────────────────────────

app.use(express.json());

// ─── Serve frontend ────────────────────────────────────────────

app.get('/home',     (_req, res) => res.sendFile(`${__dirname}/app.html`));
app.get('/app',      (_req, res) => res.redirect(301, '/home'));
app.get('/app.html', (_req, res) => res.redirect(301, '/home'));

app.use(express.static(__dirname));

// ─── GET /config ───────────────────────────────────────────────

app.get('/config', (req, res) => {
  res.json({ googleClientId: GOOGLE_CLIENT_ID || '' });
});

// ─── POST /auth/google/exchange-extension ──────────────────────

app.post('/auth/google/exchange-extension', async (req, res) => {
  const { code, redirect_uri } = req.body;
  if (!code || !redirect_uri) return res.status(400).json({ error: 'Missing params' });
  if (!redirect_uri.endsWith('.chromiumapp.org/')) return res.status(400).json({ error: 'Invalid redirect_uri' });

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type:    'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokens.error_description || 'Token exchange failed');

    const payload = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString());
    const { email, name } = payload;

    const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey':        SUPABASE_SERVICE_KEY,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ type: 'magiclink', email, data: { full_name: name, tier: 'free' } }),
    });
    const linkData = await linkRes.json();
    if (!linkRes.ok) throw new Error(linkData.msg || 'Failed to generate link');

    const tokenHash = new URL(linkData.action_link).searchParams.get('token');
    res.json({ token_hash: tokenHash });

  } catch (err) {
    console.error('Extension auth error:', err);
    res.status(500).json({ error: 'Auth failed' });
  }
});

// ─── POST /api/reset-credits (admin only) ────────────────────

app.post('/api/reset-credits', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'brave.sae2025@gmail.com';
  if (user.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Forbidden' });

  const amount = parseInt(req.body?.amount) || 50000;
  const meta = { credits: amount, credits_expire_at: null };
  if (req.body?.tier) meta.tier = req.body.tier;
  if (req.body?.plan_expires_at) meta.plan_expires_at = req.body.plan_expires_at;
  await updateUserMeta(user.id, meta);

  return res.json({ ok: true, credits: amount });
});

// ─── POST /api/activate-plan ──────────────────────────────────

const PLAN_CONFIG = {
  day:     { ms: 86_400_000,             credits: 3_000   },
  weekly:  { ms: 7  * 86_400_000,        credits: 10_000  },
  monthly: { ms: 30 * 86_400_000,        credits: 30_000  },
  annual:  { ms: 365 * 86_400_000,       credits: 100_000 },
};

app.post('/api/activate-plan', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const plan = req.body?.plan;
  const config = PLAN_CONFIG[plan];
  if (!config) return res.status(400).json({ error: 'Invalid plan' });

  const plan_expires_at = Date.now() + config.ms;

  await updateUserMeta(user.id, {
    tier: plan,
    plan_expires_at,
    credits: config.credits,
    credits_expire_at: null,
  });

  return res.json({ ok: true, plan, plan_expires_at, credits: config.credits });
});

// ─── POST /api/create-checkout ───────────────────────────────

app.post('/api/create-checkout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const plan = req.body?.plan;
  if (!STRIPE_PRICES[plan]) return res.status(400).json({ error: 'Invalid plan' });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
    success_url: 'https://bipassai.com/plans.html?activated=1',
    cancel_url:  'https://bipassai.com/plans.html',
    metadata: { user_id: user.id, type: 'plan', plan },
    client_reference_id: user.id,
  });

  return res.json({ url: session.url });
});

// ─── POST /api/create-credit-checkout ────────────────────────

app.post('/api/create-credit-checkout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const pkg = req.body?.pkg;
  if (!STRIPE_CREDIT_PRICES[pkg] || STRIPE_CREDIT_PRICES[pkg] === 'price_PLACEHOLDER')
    return res.status(400).json({ error: 'Invalid package' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: STRIPE_CREDIT_PRICES[pkg], quantity: 1 }],
      success_url: 'https://bipassai.com/plans.html?credits_added=1',
      cancel_url:  'https://bipassai.com/plans.html',
      metadata: { user_id: user.id, type: 'credits', pkg },
      client_reference_id: user.id,
    });
    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe credit checkout error:', err.message);
    return res.status(500).json({ error: 'Payment setup failed. Please try again.' });
  }
});

// ─── POST /api/init-credits ───────────────────────────────────

app.post('/api/init-credits', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  if (user.user_metadata?.signup_welcome_shown) {
    return res.json({ alreadyInit: true });
  }

  const expiresAt = Date.now() + 86400000; // 24 hours
  await updateUserMeta(user.id, {
    credits: INITIAL_CREDITS,
    credits_expire_at: expiresAt,
    signup_welcome_shown: true,
  });

  return res.json({ credits: INITIAL_CREDITS, expiresAt });
});

// ─── POST /api/analyze (auth only, no credit deduction) ───────

app.post('/api/analyze', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

  try {
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, topP: 0.95, maxOutputTokens: 4096 },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({ error: err?.error?.message || 'Gemini error' });
    }

    const data   = await geminiRes.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) return res.status(500).json({ error: 'No output from Gemini' });

    return res.json({ result: result.trim() });
  } catch (err) {
    console.error('/api/analyze error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/adjust-level ───────────────────────────────────

function buildCustomizePrompt(mistakes, lockSentenceStructure, wordCount = 200) {
  // Slider 0 = off. Otherwise scale the target to the text length so a short
  // paragraph gets a few and a long essay gets proportionally more — and the
  // model treats it as a required count, not an optional suggestion.
  const rate = v => {
    v = parseInt(v) || 0;
    if (v <= 0) return null;            // off
    if (v <= 2) return 0.02;            // a touch
    if (v <= 4) return 0.05;
    if (v <= 6) return 0.09;
    if (v <= 8) return 0.15;
    return 0.25;                        // nearly everywhere it applies
  };
  const label = v => {
    const r = rate(v);
    if (r === null) return null;
    const n = Math.max(2, Math.round(wordCount * r));
    return `about ${n} time${n !== 1 ? 's' : ''} across the text (wherever it naturally applies)`;
  };
  const mistakeLines = [];
  if (label(mistakes.grammar))  mistakeLines.push(`- Grammar: introduce subject-verb disagreements or missing/wrong articles ${label(mistakes.grammar)}.`);
  if (label(mistakes.tense))    mistakeLines.push(`- Tense: switch past-tense verbs to present tense ${label(mistakes.tense)} (e.g. "went"→"go", "said"→"say", "was"→"is", "made"→"make").`);
  if (label(mistakes.punct))    mistakeLines.push(`- Punctuation: drop apostrophes on contractions ${label(mistakes.punct)} (dont, cant, its, wont, didnt).`);
  if (label(mistakes.caps))     mistakeLines.push(`- Capitals: lowercase a letter that should be capital (sentence starts, the word "I") ${label(mistakes.caps)}.`);
  if (label(mistakes.spelling)) mistakeLines.push(`- Spelling: misspell common words ${label(mistakes.spelling)} (definately, recieve, seperate, occured, wierd, alot, untill).`);
  const mistakeBlock = mistakeLines.length
    ? `\n\nMISTAKES YOU MUST APPLY — THIS IS REQUIRED, NOT OPTIONAL:\nThe output MUST visibly contain each of the following errors at the stated frequency. These are deliberate human imperfections — do NOT "fix" or clean them up, and do not skip any line. If a category asks for more than the text can fit, apply it everywhere it possibly can.\n${mistakeLines.join('\n')}\nBefore returning, count your changes for each category above and confirm you met the minimum. If you fell short on any, add more until you do.`
    : '';

  const wl = parseInt(mistakes.wordLevel ?? 5);
  const vocabInstruction = wl <= 1
    ? `\n\nWORD LEVEL — ELEMENTARY: Replace every moderately or highly complex word with the absolute simplest everyday equivalent, as if a 10-year-old wrote it. Examples: "demonstrate"→"show", "obtain"→"get", "consider"→"think about", "require"→"need", "provide"→"give", "attempt"→"try", "communicate"→"talk", "approximately"→"about", "substantial"→"really big", "beneficial"→"good", "sufficient"→"enough", "frequently"→"a lot", "residence"→"home", "employed"→"working". Every word should be the first simple word that comes to mind.`
    : wl <= 3
    ? `\n\nWORD LEVEL — BEGINNER: Use simple conversational vocabulary throughout. Replace formal or academic words with plain everyday alternatives a non-native speaker would write. Avoid anything that sounds textbook-like or overly formal.`
    : wl <= 6
    ? `\n\nWORD LEVEL — STUDENT: Use clear plain language a high school student would write. Replace AI buzzwords and obviously academic/formal words, but keep moderately formal words if they fit naturally.`
    : wl <= 8
    ? `\n\nWORD LEVEL — ACADEMIC: Keep vocabulary at a confident, educated level. Only replace the most obvious AI-specific buzzwords (utilize, leverage, facilitate, comprehensive, paramount, meticulous, groundbreaking, transformative, seamless) — leave all other advanced vocabulary unchanged.`
    : `\n\nWORD LEVEL — EXPERT: Minimal vocabulary changes. Only fix the most glaring AI-specific terms (utilize→use, leverage→use, facilitate→help). Preserve all other sophisticated or technical vocabulary exactly as written.`;

  const lockLine = lockSentenceStructure
    ? '\n- STRUCTURE LOCK: every sentence must stay one sentence — word count per sentence must be identical or differ by at most one word.'
    : '';
  return `Scan this text for AI-detection signals and fix them word by word. Your job is word-level replacement only — no sentence restructuring, no paraphrasing.

WHAT TO FIX:
1. AI buzzwords: utilize→use, leverage→use, facilitate→help, comprehensive→complete, robust→strong, individuals→people, crucial→really important, significant→big, furthermore→also, moreover→also, nevertheless→but, paramount→most important, groundbreaking→new, transformative→life-changing, seamless→smooth, meticulous→careful, realm→area, methodology→method, ultimately→in the end, delve→explore, innovative→new, sophisticated→advanced, invaluable→very useful, streamline→simplify, navigate→handle, ecosystem→environment, framework→system, cutting-edge→advanced, state-of-the-art→advanced
2. Overly formal multi-word phrases: "in order to"→"to", "due to the fact that"→"because", "in the event that"→"if", "with regard to"→"about", "a large number of"→"many", "in terms of"→"about", "plays a crucial role"→"is really important", "serves as a testament"→"shows"
3. Any word that sounds unusually polished or formal for a human writer — swap it for the simpler first-instinct word${vocabInstruction}${mistakeBlock}

STRICT RULES:
- Only change individual words or short phrases (2–4 words max)
- Keep ALL sentence structure, punctuation positions, and paragraph breaks IDENTICAL
- Keep proper nouns, numbers, and technical terms unchanged
- Never expand one word into a full phrase that changes sentence rhythm${lockLine}
- No em dashes — replace any with a comma

Return ONLY the modified text, no explanation.`;
}

app.post('/api/adjust-level', async (req, res) => {
  const { text, level, lockSentenceStructure, mistakes } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

  const COHERENCE = ` COHERENCE CHECK (do this before returning): re-read the entire text with your replacements in place. Every replaced word must fit its sentence naturally and be grammatically correct. If any replacement creates a word repeated next to itself (like "new new"), a wrong-grammar fit, or an awkward phrase, fix it — pick a better-fitting word of the same meaning, or minimally adjust only the single adjacent word needed so it reads correctly. Do NOT restructure or rewrite whole sentences. The final text must read smoothly, as if a careful person wrote it.`;

  const LOCK = lockSentenceStructure
    ? ` STRUCTURE LOCK: every sentence in the input must become exactly one sentence in the output. Full stops, question marks, and exclamation points must appear at the same positions as in the input. Replace each word one-for-one — never expand one word into a phrase, never merge two words into one. Word count per sentence must be identical or differ by at most one word.`
    : '';

  const PROMPTS = {
    easy: `Simplify this text for a beginner English learner. Replace every complex, formal, or academic word with the simplest everyday word that keeps the same meaning. STRICT RULES: only change individual words or short phrases (2–4 words max), never rewrite whole sentences, keep all punctuation and sentence structure exactly the same, keep proper nouns and numbers unchanged.${LOCK}${COHERENCE} Return ONLY the modified text with no explanation or commentary.`,
    medium: `Simplify this text for a high school student. Replace academic buzzwords and overly formal vocabulary with clear plain words a teenager would use. STRICT RULES: only change individual words or short phrases, keep sentence structure and punctuation identical, keep proper nouns and numbers unchanged.${LOCK}${COHERENCE} Return ONLY the modified text with no explanation.`,
    hard: `In this text, replace only the most obvious AI-writing buzzwords (such as utilize→use, leverage→use, facilitate→help, comprehensive→complete, paramount→most important, meticulous→careful, groundbreaking→new, transformative→life-changing) with simpler equivalents. Leave all other vocabulary unchanged. STRICT RULES: only change individual words, keep sentence structure and punctuation identical.${LOCK}${COHERENCE} Return ONLY the modified text with no explanation.`,
  };

  const systemPrompt = level === 'customize'
    ? buildCustomizePrompt(mistakes || {}, lockSentenceStructure, (text.trim().match(/\S+/g) || []).length)
    : (PROMPTS[level] || PROMPTS.medium);

  const stripDashes = s => s
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*–\s*/g, ', ')
    .replace(/ - /g, ', ');

  const processedText = level === 'easy' ? stripDashes(text) : text;
  const fullPrompt = `${systemPrompt}\n\nText:\n${processedText}`;

  try {
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.3, topP: 0.95, maxOutputTokens: 8192 },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({ error: err?.error?.message || 'Gemini error' });
    }

    const data   = await geminiRes.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) return res.status(500).json({ error: 'No output from Gemini' });

    const finalResult = level === 'easy' ? stripDashes(result.trim()) : result.trim();
    return res.json({ result: finalResult });
  } catch (err) {
    console.error('/api/adjust-level error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/humanize ────────────────────────────────────────

app.post('/api/humanize', async (req, res) => {
  const { prompt, model = 'gemini' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  // ── Auth + credit check ────────────────────────────────────────
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  // Plan expiry check — blocks regardless of current tier to prevent slip-through after demotion
  const planExpiresAt = user.user_metadata?.plan_expires_at;
  if (planExpiresAt && Date.now() > planExpiresAt) {
    const userTier = user.user_metadata?.tier || 'free';
    if (userTier !== 'free') await updateUserMeta(user.id, { tier: 'free' });
    return res.status(402).json({ error: 'Your plan has expired. Visit Plans to renew.' });
  }

  // Expiry check for free starter credits
  const creditsExpireAt = user.user_metadata?.credits_expire_at;
  if (creditsExpireAt && Date.now() > creditsExpireAt) {
    await updateUserMeta(user.id, { credits: 0, credits_expire_at: null });
    return res.status(402).json({ error: 'Your free credits have expired. Visit Plans to get more.' });
  }

  const credits = user.user_metadata?.credits ?? INITIAL_CREDITS;
  if (credits <= 0) {
    return res.status(402).json({ error: 'No credits remaining', creditsRemaining: 0 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  let cancelled = false;
  req.on('close', () => { cancelled = true; });

  try {
    let result;

    if (model === 'claude') {
      if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Claude not configured' });
      const claudeRes = await callClaude(prompt);
      if (!claudeRes.ok) {
        const err = await claudeRes.json().catch(() => ({}));
        return res.status(claudeRes.status).json({ error: err?.error?.message || 'Claude error' });
      }
      const data = await claudeRes.json();
      result = data?.content?.[0]?.text;
    } else {
      const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 2.0, topP: 0.95, maxOutputTokens: 8192 },
        }),
      });
      if (!geminiRes.ok) {
        const err = await geminiRes.json().catch(() => ({}));
        return res.status(geminiRes.status).json({ error: err?.error?.message || 'Gemini error' });
      }
      const data = await geminiRes.json();
      result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (!result) return res.status(500).json({ error: 'No output from model' });

    // ── Self-detection pass: find + rewrite most AI-sounding sentences ───
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const detectPrompt = `You are reviewing this text to help it pass AI detectors like GPTZero.

Find the 8-10 sentences that sound most AI-generated: overly formal phrasing, predictable structure, academic vocabulary, generic statements, or sentences that follow typical AI patterns.

Rewrite ONLY those sentences to sound more natural and human: casual phrasing, specific concrete details, unexpected word choices, natural speech patterns. Keep the meaning the same.

Return the COMPLETE text with those sentences replaced. Do not change anything else. Return only the final text, no explanation.

TEXT:
${result}`;
        const detectRes = await callClaude(detectPrompt);
        if (detectRes.ok) {
          const detectData = await detectRes.json();
          const improved = detectData?.content?.[0]?.text?.trim();
          if (improved) result = improved;
        }
      } catch {}
    }

    // ── Deduct credits (only on success, only if client didn't cancel) ───
    const resultText  = result.trim();
    if (cancelled) return;

    const creditsUsed = resultText.length;
    const newCredits  = Math.max(0, credits - creditsUsed);
    await updateUserCredits(user.id, newCredits);

    return res.json({ result: resultText, creditsUsed, creditsRemaining: newCredits });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/stream ─────────────────────────────────────────

app.post('/api/stream', async (req, res) => {
  const { prompt, model = 'gemini' } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  // Plan expiry check — blocks regardless of current tier to prevent slip-through after demotion
  const planExpiresAt = user.user_metadata?.plan_expires_at;
  if (planExpiresAt && Date.now() > planExpiresAt) {
    const userTier = user.user_metadata?.tier || 'free';
    if (userTier !== 'free') await updateUserMeta(user.id, { tier: 'free' });
    return res.status(402).json({ error: 'Your plan has expired. Visit Plans to renew.' });
  }

  // Expiry check for free starter credits
  const creditsExpireAt = user.user_metadata?.credits_expire_at;
  if (creditsExpireAt && Date.now() > creditsExpireAt) {
    await updateUserMeta(user.id, { credits: 0, credits_expire_at: null });
    return res.status(402).json({ error: 'Your free credits have expired. Visit Plans to get more.' });
  }

  const credits = user.user_metadata?.credits ?? INITIAL_CREDITS;
  if (credits <= 0) return res.status(402).json({ error: 'No credits remaining', creditsRemaining: 0 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

  let cancelled = false;
  req.on('close', () => { cancelled = true; });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    let fullText     = '';
    let inputTokens  = 0;
    let outputTokens = 0;

    if (model === 'claude') {
      if (!process.env.ANTHROPIC_API_KEY) {
        res.write(`data: ${JSON.stringify({ error: 'Claude not configured' })}\n\n`);
        return res.end();
      }

      const claudeRes = await callClaude(prompt, true);
      if (!claudeRes.ok) {
        const err = await claudeRes.json().catch(() => ({}));
        res.write(`data: ${JSON.stringify({ error: err?.error?.message || 'Claude error' })}\n\n`);
        return res.end();
      }

      const reader  = claudeRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.type === 'content_block_delta' && json.delta?.text) {
              fullText += json.delta.text;
              res.write(`data: ${JSON.stringify({ chunk: json.delta.text, chars: fullText.length })}\n\n`);
            }
            if (json.type === 'message_start' && json.message?.usage) {
              inputTokens = json.message.usage.input_tokens || 0;
            }
            if (json.type === 'message_delta' && json.usage) {
              outputTokens = json.usage.output_tokens || 0;
            }
          } catch {}
        }
      }
    } else {
      const geminiRes = await fetch(`${GEMINI_STREAM_ENDPOINT}?key=${apiKey}&alt=sse`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 2.0, topP: 0.95, maxOutputTokens: 8192 },
        }),
      });

      if (!geminiRes.ok) {
        const err = await geminiRes.json().catch(() => ({}));
        res.write(`data: ${JSON.stringify({ error: err?.error?.message || 'Gemini error' })}\n\n`);
        return res.end();
      }

      const reader  = geminiRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';
      let lastUsage = null;

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const json = JSON.parse(line.slice(6));
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
              fullText += text;
              res.write(`data: ${JSON.stringify({ chunk: text, chars: fullText.length })}\n\n`);
            }
            if (json.usageMetadata) lastUsage = json.usageMetadata;
          } catch {}
        }
      }

      inputTokens  = lastUsage?.promptTokenCount     || 0;
      outputTokens = lastUsage?.candidatesTokenCount || 0;
    }

    if (!cancelled && fullText) {
      // Signal client to update loading message
      res.write(`data: ${JSON.stringify({ polishing: true })}\n\n`);

      // Self-detection pass: find + rewrite the most AI-sounding sentences
      let resultText = fullText.trim();
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const detectPrompt = `You are reviewing this text to help it pass AI detectors like GPTZero.

Find the 8-10 sentences that sound most AI-generated: overly formal phrasing, predictable structure, academic vocabulary, generic statements, or sentences that follow typical AI patterns.

Rewrite ONLY those sentences to sound more natural and human: casual phrasing, specific concrete details, unexpected word choices, natural speech patterns. Keep the meaning the same.

Return the COMPLETE text with those sentences replaced. Do not change anything else. Return only the final text, no explanation.

TEXT:
${resultText}`;
          const detectRes = await callClaude(detectPrompt);
          if (detectRes.ok) {
            const detectData = await detectRes.json();
            const improved = detectData?.content?.[0]?.text?.trim();
            if (improved) resultText = improved;
          }
        } catch {}
      }

      const creditsUsed = resultText.length;
      const newCredits  = Math.max(0, credits - creditsUsed);
      await updateUserCredits(user.id, newCredits);
      res.write(`data: ${JSON.stringify({
        done: true, result: resultText, creditsUsed, creditsRemaining: newCredits,
        inputTokens, outputTokens,
      })}\n\n`);
    }

    res.end();
  } catch (err) {
    console.error('Stream error:', err);
    res.end();
  }
});

// ─── GET /auth/google ──────────────────────────────────────────

app.get('/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.status(500).send('Google OAuth not configured');

  const state = crypto.randomBytes(16).toString('hex');
  const next  = req.query.next || '/home';
  oauthStates.set(state, { next, created: Date.now() });

  // Clean up states older than 10 minutes
  for (const [k, v] of oauthStates) {
    if (Date.now() - v.created > 600_000) oauthStates.delete(k);
  }

  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    state,
    access_type:   'offline',
    prompt:        'select_account',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ─── GET /auth/google/callback ─────────────────────────────────

app.get('/auth/google/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) return res.redirect('/login.html?error=google_denied');
  if (!state || !oauthStates.has(state)) return res.redirect('/login.html?error=invalid_state');

  const { next } = oauthStates.get(state);
  oauthStates.delete(state);

  try {
    // 1. Exchange code for Google tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokens.error_description || 'Token exchange failed');

    // 2. Decode ID token to get user info (no verification needed — came from Google directly)
    const payload  = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString());
    const { email, name } = payload;

    // 3. Generate a Supabase magic-link OTP for this email (creates user if new)
    const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey':        SUPABASE_SERVICE_KEY,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        type:          'magiclink',
        email,
        data:          { full_name: name, tier: 'free' },
      }),
    });
    const linkData = await linkRes.json();
    if (!linkRes.ok) throw new Error(linkData.msg || 'Failed to generate link');

    // 4. Extract token_hash from action_link and send to client to verify
    const actionUrl   = new URL(linkData.action_link);
    const tokenHash   = actionUrl.searchParams.get('token');

    const callbackParams = new URLSearchParams({ token_hash: tokenHash, next: next || '/home' });
    res.redirect(`/auth-callback.html?${callbackParams}`);

  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect('/login.html?error=oauth_failed');
  }
});

// ─── DELETE /api/account ───────────────────────────────────────

app.delete('/api/account', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  try {
    // Delete style profile first
    await fetch(`${SUPABASE_URL}/rest/v1/user_styles?user_id=eq.${user.id}`, {
      method:  'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey':        SUPABASE_SERVICE_KEY,
      },
    });

    // Delete the auth user
    const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method:  'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey':        SUPABASE_SERVICE_KEY,
      },
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json().catch(() => ({}));
      throw new Error(err.msg || 'Delete failed');
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ─── Start ─────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bipass AI running on port ${PORT}`);
  console.log(`API key present: ${!!(process.env.GEMINI_API_KEY)}`);
});
