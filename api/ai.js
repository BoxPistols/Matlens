// Vercel Serverless Function — AI API Proxy with Rate Limiting
// 環境変数: OPENAI_API_KEY, GEMINI_API_KEY, DAILY_LIMIT (default: 30)

// --- In-memory rate limit store (per warm instance) ---
// Production recommendation: replace with Vercel KV or Upstash Redis
const rateLimitStore = new Map(); // key: "ip:date" → count

const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || '30', 10);

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `${ip}:${today}`;

  // Clean up old entries (different dates)
  for (const k of rateLimitStore.keys()) {
    if (!k.endsWith(`:${today}`)) rateLimitStore.delete(k);
  }

  const current = rateLimitStore.get(key) || 0;
  if (current >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: DAILY_LIMIT };
  }
  rateLimitStore.set(key, current + 1);
  return { allowed: true, remaining: DAILY_LIMIT - current - 1, limit: DAILY_LIMIT };
}

function getRemainingCount(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `${ip}:${today}`;
  const current = rateLimitStore.get(key) || 0;
  return { remaining: Math.max(0, DAILY_LIMIT - current), limit: DAILY_LIMIT };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ip = getClientIP(req);

  // GET /api/ai → return rate limit status
  if (req.method === 'GET') {
    const { remaining, limit } = getRemainingCount(ip);
    return res.status(200).json({ remaining, limit });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { provider, prompt, system } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  // Rate limit check
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return res.status(429).json({
      error: `本日の利用上限（${rl.limit}回/日）に達しました。明日リセットされます。自分のAPIキーを設定すると無制限で利用できます。`,
      remaining: 0,
      limit: rl.limit,
    });
  }

  const sys = system || 'あなたは材料科学の専門家AIアシスタントです。Matlens に組み込まれています。Markdown形式で簡潔・実用的な日本語で回答してください。';

  try {
    let text;

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
      if (d.error) return res.status(502).json({ error: `Gemini: ${d.error.message}`, remaining: rl.remaining, limit: rl.limit });
      text = d.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini 応答エラー';

    } else {
      // OpenAI — only nano via server proxy (mini requires user's own key)
      const key = process.env.OPENAI_API_KEY;
      if (!key) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const d = await resp.json();
      if (d.error) return res.status(502).json({ error: `OpenAI: ${d.error.message}`, remaining: rl.remaining, limit: rl.limit });
      text = d.choices?.[0]?.message?.content || '応答を取得できませんでした。';
    }

    return res.status(200).json({ text, remaining: rl.remaining, limit: rl.limit });
  } catch (e) {
    return res.status(500).json({ error: `API接続エラー: ${e.message}` });
  }
}
