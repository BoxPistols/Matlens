// Vite dev server plugin — local proxy for /api/ai
// Reads OPENAI_API_KEY / GEMINI_API_KEY from .env.local via Vite's loadEnv

export function devApiProxy() {
  let envVars = {};

  return {
    name: 'dev-api-proxy',
    configResolved(config) {
      // Vite loads .env.local automatically into config.env (VITE_ prefixed)
      // but we need unprefixed vars, so read from process.env (dotenv loaded by Vite)
    },
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

        // Parse body
        const body = await new Promise((resolve) => {
          let data = '';
          req.on('data', (chunk) => { data += chunk; });
          req.on('end', () => {
            try { resolve(JSON.parse(data)); } catch { resolve({}); }
          });
        });

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
    },
  };
}
