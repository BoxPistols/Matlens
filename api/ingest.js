// Vercel Serverless Function — Material Data Ingest API
// POST /api/ingest { materials: Material[] }

import { ingestMaterials } from './lib/rag.js';
import {
  ValidationError,
  validateIngestMaterials,
  assertJsonContentType,
} from './lib/validation.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY が未設定です' });
  if (!process.env.UPSTASH_VECTOR_REST_URL) return res.status(500).json({ error: 'UPSTASH_VECTOR_REST_URL が未設定です' });

  // Input validation — enforce JSON content type, array shape, per-record
  // string / numeric types, and the hard max of N materials per request.
  let materials;
  try {
    assertJsonContentType(req);
    materials = validateIngestMaterials(req.body?.materials);
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(e.status || 400).json({ error: e.message });
    }
    throw e;
  }

  try {
    const count = await ingestMaterials(materials);
    return res.status(200).json({ ok: true, count });
  } catch (e) {
    // Log the full error server-side but hand the client a generic message
    // so stack traces / provider internals never hit the wire.
    console.error('[api/ingest]', e);
    return res.status(500).json({ error: 'インジェスト中にエラーが発生しました' });
  }
}
