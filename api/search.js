// Vercel Serverless Function — Vector Search API
// POST /api/search { query, k?, category? }

import { search, keywordSearch } from './lib/rag.js';
import {
  ValidationError,
  validateSearchQuery,
  validateTopK,
  validateCategoryFilter,
  assertJsonContentType,
} from './lib/validation.js';
import { applyCors } from './lib/cors.js';

export default async function handler(req, res) {
  const corsAllowed = applyCors(req, res);
  if (!corsAllowed) return res.status(403).json({ error: 'Origin not allowed' });
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Input validation — reject non-JSON bodies, oversized queries, and
  // out-of-range topK before any expensive work.
  let query;
  let k;
  let category;
  try {
    assertJsonContentType(req);
    const body = req.body || {};
    query = validateSearchQuery(body.query);
    k = validateTopK(body.k, 6);
    category = validateCategoryFilter(body.category);
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(e.status || 400).json({ error: e.message });
    }
    throw e;
  }

  // `db` is an optional client-side fallback used in dev when Upstash isn't
  // configured; don't validate every row, just bound the array size so a
  // malicious client can't force us to scan a huge list.
  const db = Array.isArray(req.body?.db) ? req.body.db.slice(0, 1000) : null;

  const hasUpstash = process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN;

  try {
    if (hasUpstash && process.env.OPENAI_API_KEY) {
      const results = await search(query, k, category);
      return res.status(200).json({ results, engine: 'upstash' });
    }

    // Fallback: keyword search (requires db from client)
    if (db) {
      const results = keywordSearch(db, query, k);
      return res.status(200).json({ results, engine: 'keyword' });
    }

    return res.status(200).json({ results: [], engine: 'none', message: 'UPSTASH_VECTOR未設定。キーワード検索にはdbパラメータが必要です。' });
  } catch (e) {
    // Log internal errors server-side but return a generic message to the
    // client so we don't leak stack traces or provider internals.
    console.error('[api/search]', e);
    return res.status(500).json({ error: '検索中にエラーが発生しました' });
  }
}
