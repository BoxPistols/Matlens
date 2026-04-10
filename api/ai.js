// Vercel Serverless Function — AI API Proxy with Rate Limiting
// 環境変数: OPENAI_API_KEY, GEMINI_API_KEY (→ GOOGLE_GENERATIVE_AI_API_KEY),
//          DAILY_LIMIT (default: 30),
//          UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (persistent rate limit)
//
// Uses Vercel AI SDK v6 (`ai` + `@ai-sdk/openai` + `@ai-sdk/google`) for
// unified provider abstraction — one call site for OpenAI and Gemini.

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { checkRateLimit, getRemainingQuota } from './lib/ratelimit.js';

// @ai-sdk/google reads from GOOGLE_GENERATIVE_AI_API_KEY; accept GEMINI_API_KEY
// as an alias since that's what the rest of the Matlens codebase uses.
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
}

const DEFAULT_SYSTEM =
  'あなたは材料科学の専門家AIアシスタントです。Matlens に組み込まれています。Markdown形式で簡潔・実用的な日本語で回答してください。';

function resolveModel(provider) {
  if (provider === 'gemini') return google('gemini-2.5-flash');
  return openai('gpt-5.4-nano');
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/ai → return rate limit status
  if (req.method === 'GET') {
    const { remaining, limit } = await getRemainingQuota(req);
    return res.status(200).json({ remaining, limit });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { provider, prompt, system } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  // Provider key presence check (friendlier than downstream auth error)
  if (provider === 'gemini') {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }
  } else if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  // Rate limit check (Upstash Redis persistent or in-memory fallback)
  const rl = await checkRateLimit(req);
  if (!rl.allowed) {
    return res.status(429).json({
      error: `本日の利用上限（${rl.limit}回/日）に達しました。明日リセットされます。自分のAPIキーを設定すると無制限で利用できます。`,
      remaining: 0,
      limit: rl.limit,
    });
  }

  try {
    const { text } = await generateText({
      model: resolveModel(provider),
      system: system || DEFAULT_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });

    return res.status(200).json({
      text: text || '応答を取得できませんでした。',
      remaining: rl.remaining,
      limit: rl.limit,
    });
  } catch (e) {
    const providerLabel = provider === 'gemini' ? 'Gemini' : 'OpenAI';
    return res.status(502).json({
      error: `${providerLabel}: ${e.message}`,
      remaining: rl.remaining,
      limit: rl.limit,
    });
  }
}
