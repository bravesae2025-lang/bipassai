import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT || 3000;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SUPABASE_URL     = 'https://nvewmugqrpdhpdfyvzpz.supabase.co';
const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REDIRECT_URI         = 'https://bipassai.com/auth/google/callback';

// In-memory state store for CSRF protection (single instance — fine for Railway hobby)
const oauthStates = new Map();

// ─── Middleware ────────────────────────────────────────────────

app.use(express.json());

// ─── Serve frontend ────────────────────────────────────────────

app.use(express.static(__dirname));

// ─── POST /api/humanize ────────────────────────────────────────

app.post('/api/humanize', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.gemeni || process.env['gemeni api key'];
  if (!apiKey) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:     1.0,
          topP:            0.95,
          maxOutputTokens: 8192,
        },
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
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /auth/google ──────────────────────────────────────────

app.get('/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.status(500).send('Google OAuth not configured');

  const state = crypto.randomBytes(16).toString('hex');
  const next  = req.query.next || '/app.html';
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

    const callbackParams = new URLSearchParams({ token_hash: tokenHash, next: next || '/app.html' });
    res.redirect(`/auth-callback.html?${callbackParams}`);

  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect('/login.html?error=oauth_failed');
  }
});

// ─── Start ─────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bipass AI running on port ${PORT}`);
  console.log(`API key present: ${!!(process.env.GEMINI_API_KEY || process.env.gemeni || process.env['gemeni api key'])}`);
});
