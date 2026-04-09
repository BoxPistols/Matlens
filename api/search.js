// Vercel Serverless Function — Vector Search API
// POST /api/search { query, k?, category? }

import { search, keywordSearch } from './lib/rag.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, k = 6, category, db } = req.body || {};
  if (!query) return res.status(400).json({ error: 'query is required' });

  const hasUpstash = process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN;

  try {
    if (hasUpstash && process.env.OPENAI_API_KEY) {
      const results = await search(query, k, category);
      return res.status(200).json({ results, engine: 'upstash' });
    }

    // Fallback: keyword search (requires db from client)
    if (db && Array.isArray(db)) {
      const results = keywordSearch(db, query, k);
      return res.status(200).json({ results, engine: 'keyword' });
    }

    return res.status(200).json({ results: [], engine: 'none', message: 'UPSTASH_VECTOR未設定。キーワード検索にはdbパラメータが必要です。' });
  } catch (e) {
    return res.status(500).json({ error: `検索エラー: ${e.message}` });
  }
}
