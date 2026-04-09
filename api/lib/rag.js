// Server-side RAG library for Matlens
// Embedding: AI SDK + OpenAI text-embedding-3-small (1536dim)
// Vector Store: Upstash Vector

import { embedMany, embed as embedOne } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Index } from '@upstash/vector';

const embeddingModel = openai.embedding('text-embedding-3-small');

// --- Upstash Vector singleton ---
let _index = null;

function getIndex() {
  if (!_index) {
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!url || !token) return null;
    _index = new Index({ url, token });
  }
  return _index;
}

// --- Embedding ---
export async function embed(texts) {
  const { embeddings } = await embedMany({ model: embeddingModel, values: texts });
  return embeddings;
}

export async function embedQuery(query) {
  const { embedding } = await embedOne({ model: embeddingModel, value: query });
  return embedding;
}

// --- Material text for embedding ---
export function buildMaterialText(mat) {
  return [
    `[材料] ${mat.name}`,
    `カテゴリ: ${mat.cat}`,
    `組成: ${mat.comp}`,
    `硬度: ${mat.hv}HV, 引張強度: ${mat.ts}MPa, 密度: ${mat.dn}g/cm³`,
    mat.memo ? `備考: ${mat.memo}` : '',
  ].filter(Boolean).join('\n');
}

// --- Category mapping for metadata filter ---
function categorize(cat) {
  if (cat.includes('金属')) return 'METAL';
  if (cat.includes('セラミ')) return 'CERAMIC';
  if (cat.includes('ポリマー')) return 'POLYMER';
  if (cat.includes('複合')) return 'COMPOSITE';
  return 'OTHER';
}

// --- Vector search ---
export async function search(query, k = 6, filterCategory) {
  const index = getIndex();
  if (!index) throw new Error('UPSTASH_VECTOR_REST_URL / TOKEN が未設定です');
  const qv = await embedQuery(query);
  const res = await index.query({
    vector: qv,
    topK: k,
    includeMetadata: true,
    filter: filterCategory ? `category = '${filterCategory}'` : undefined,
  });
  return res.map(r => {
    const m = r.metadata ?? {};
    return {
      id: String(r.id),
      score: r.score,
      source: m.source ?? 'OTHER',
      name: m.name ?? '',
      cat: m.category ?? '',
      comp: m.comp ?? '',
      hv: Number(m.hv) || 0,
      ts: Number(m.ts) || 0,
      dn: Number(m.dn) || 0,
      snippet: m.text ?? '',
    };
  });
}

// --- Batch ingest ---
export async function ingestMaterials(materials) {
  const index = getIndex();
  if (!index) throw new Error('UPSTASH_VECTOR_REST_URL / TOKEN が未設定です');
  const BATCH = 20;
  let total = 0;
  for (let i = 0; i < materials.length; i += BATCH) {
    const batch = materials.slice(i, i + BATCH);
    const texts = batch.map(buildMaterialText);
    const vectors = await embed(texts);
    await index.upsert(
      batch.map((mat, j) => ({
        id: mat.id,
        vector: vectors[j],
        metadata: {
          source: categorize(mat.cat),
          name: mat.name,
          category: mat.cat,
          comp: mat.comp,
          text: texts[j].slice(0, 300),
          hv: String(mat.hv),
          ts: String(mat.ts),
          dn: String(mat.dn),
        },
      }))
    );
    total += batch.length;
  }
  return total;
}

// --- Keyword fallback (when Upstash is not configured) ---
export function keywordSearch(db, query, topK = 6) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 0);
  return db
    .map(r => {
      const text = `${r.name} ${r.cat} ${r.comp} ${r.memo}`.toLowerCase();
      const matchCount = words.filter(w => text.includes(w)).length;
      return { ...r, score: words.length > 0 ? matchCount / words.length : 0 };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
