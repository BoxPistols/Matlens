// Vite dev server plugin — local proxy for /api/ai
// Reads OPENAI_API_KEY / GEMINI_API_KEY from .env.local via Vite's loadEnv

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

        try {
          let text;

          if (provider === 'gemini') {
            const key = process.env.GEMINI_API_KEY;
            if (!key) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY が .env.local に設定されていません' }));
              return;
            }
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
            if (d.error) {
              res.statusCode = 502;
              res.end(JSON.stringify({ error: `Gemini: ${d.error.message}` }));
              return;
            }
            text = d.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini 応答エラー';
          } else {
            const key = process.env.OPENAI_API_KEY;
            if (!key) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'OPENAI_API_KEY が .env.local に設定されていません' }));
              return;
            }
            const model = provider === 'openai-mini' ? 'gpt-5.4-mini' : 'gpt-5.4-nano';
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
            if (d.error) {
              res.statusCode = 502;
              res.end(JSON.stringify({ error: `OpenAI: ${d.error.message}` }));
              return;
            }
            text = d.choices?.[0]?.message?.content || '応答を取得できませんでした。';
          }

          res.end(JSON.stringify({ text, remaining: 999, limit: 999 }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: `API接続エラー: ${e.message}` }));
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
