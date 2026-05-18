import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT || 3000;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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

  const apiKey = process.env.GEMINI_API_KEY;
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

// ─── Start ─────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bipass AI running on port ${PORT}`);
  console.log(`GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
});
