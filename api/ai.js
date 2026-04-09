// Vercel Serverless Function — AI API Proxy
// 環境変数: OPENAI_API_KEY, GEMINI_API_KEY
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { provider, prompt, system } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const sys = system || 'あなたは材料科学の専門家AIアシスタントです。Matlens に組み込まれています。Markdown形式で簡潔・実用的な日本語で回答してください。';

  try {
    if (provider === 'gemini') {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${sys}\n\n${prompt}` }] }],
            generationConfig: { maxOutputTokens: 1000 },
          }),
        }
      );
      const d = await resp.json();
      if (d.error) return res.status(502).json({ error: `Gemini: ${d.error.message}` });
      const text = d.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini 応答エラー';
      return res.status(200).json({ text });

    } else {
      // Default: OpenAI
      const key = process.env.OPENAI_API_KEY;
      if (!key) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });

      const model = provider === 'openai-mini' ? 'gpt-4.1-mini' : 'gpt-4.1-nano';
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          max_tokens: 1000,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const d = await resp.json();
      if (d.error) return res.status(502).json({ error: `OpenAI: ${d.error.message}` });
      const text = d.choices?.[0]?.message?.content || '応答を取得できませんでした。';
      return res.status(200).json({ text });
    }
  } catch (e) {
    return res.status(500).json({ error: `API接続エラー: ${e.message}` });
  }
}
