// Vite dev server plugin — local proxy for /api/ai
// Reads OPENAI_API_KEY / GEMINI_API_KEY from .env.local via Vite's loadEnv
// Uses AI SDK v6 (ai + @ai-sdk/openai + @ai-sdk/google) so the dev behavior
// matches the Vercel Function in api/ai.js.

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

function resolveModel(provider) {
  if (provider === 'gemini') return google('gemini-2.5-flash');
  if (provider === 'openai-mini') return openai('gpt-5.4-mini');
  return openai('gpt-5.4-nano');
}

export function devApiProxy() {
  return {
    name: 'dev-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        // GET — rate limit status (unlimited in dev)
        if (req.method === 'GET') {
          res.end(JSON.stringify({ remaining: 999, limit: 999 }));
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const body = await parseBody(req);
        const { provider, prompt, system } = body;
        if (!prompt) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'prompt is required' }));
          return;
        }

        const sys = system || 'あなたは材料科学の専門家AIアシスタントです。Matlens に組み込まれています。Markdown形式で簡潔・実用的な日本語で回答してください。';

        // @ai-sdk/google reads from GOOGLE_GENERATIVE_AI_API_KEY; accept the
        // GEMINI_API_KEY alias Matlens uses elsewhere.
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_API_KEY) {
          process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
        }

        // Pre-flight key check — friendlier than downstream auth errors.
        if (provider === 'gemini' && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY が .env.local に設定されていません' }));
          return;
        }
        if (provider !== 'gemini' && !process.env.OPENAI_API_KEY) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'OPENAI_API_KEY が .env.local に設定されていません' }));
          return;
        }

        try {
          const { text } = await generateText({
            model: resolveModel(provider),
            system: sys,
            messages: [{ role: 'user', content: prompt }],
          });
          res.end(JSON.stringify({
            text: text || '応答を取得できませんでした。',
            remaining: 999,
            limit: 999,
          }));
        } catch (e) {
          const providerLabel = provider === 'gemini' ? 'Gemini' : 'OpenAI';
          res.statusCode = 502;
          res.end(JSON.stringify({ error: `${providerLabel}: ${e.message}` }));
        }
      });

      // /api/search — vector search proxy
      server.middlewares.use('/api/search', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return; }
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' })); return; }

        const body = await parseBody(req);
        const { query, k = 6, category, db } = body;
        if (!query) { res.statusCode = 400; res.end(JSON.stringify({ error: 'query is required' })); return; }

        // Keyword fallback for local dev (Upstash unlikely to be configured locally)
        if (db && Array.isArray(db)) {
          const q = query.toLowerCase();
          const words = q.split(/\s+/).filter(w => w.length > 0);
          const results = db
            .map(r => {
              const text = `${r.name} ${r.cat} ${r.comp} ${r.memo || ''}`.toLowerCase();
              const matchCount = words.filter(w => text.includes(w)).length;
              return { ...r, score: words.length > 0 ? matchCount / words.length : 0 };
            })
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, k);
          res.end(JSON.stringify({ results, engine: 'keyword' }));
          return;
        }

        res.end(JSON.stringify({ results: [], engine: 'none' }));
      });

      // /api/ingest — no-op in dev (Upstash not available locally)
      server.middlewares.use('/api/ingest', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' })); return; }
        res.end(JSON.stringify({ ok: true, count: 0, message: 'ローカル開発モード: インジェストはスキップされました' }));
      });
    },
  };
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
  });
}
