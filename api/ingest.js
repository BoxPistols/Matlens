// Vercel Serverless Function — Material Data Ingest API
// POST /api/ingest { materials: Material[] }

import { ingestMaterials } from './lib/rag.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY が未設定です' });
  if (!process.env.UPSTASH_VECTOR_REST_URL) return res.status(500).json({ error: 'UPSTASH_VECTOR_REST_URL が未設定です' });

  const { materials } = req.body || {};
  if (!materials || !Array.isArray(materials) || materials.length === 0) {
    return res.status(400).json({ error: 'materials (array) is required' });
  }

  try {
    const count = await ingestMaterials(materials);
    return res.status(200).json({ ok: true, count });
  } catch (e) {
    return res.status(500).json({ error: `インジェストエラー: ${e.message}` });
  }
}
