const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:      1.0,
          topP:             0.95,
          maxOutputTokens:  8192,
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

    return res.status(200).json({ result: result.trim() });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
