#!/usr/bin/env npx tsx
// Usage: npx tsx scripts/ingest-materials.ts
//
// Ingests all materials from INITIAL_DB into Upstash Vector.
// Requires: OPENAI_API_KEY, UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN in .env.local

import 'dotenv/config';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Index } from '@upstash/vector';

// Import material data
import { INITIAL_DB } from '../src/data/initialDb.js';

const embeddingModel = openai.embedding('text-embedding-3-small');

function buildMaterialText(mat: typeof INITIAL_DB[0]): string {
  return [
    `[材料] ${mat.name}`,
    `カテゴリ: ${mat.cat}`,
    `組成: ${mat.comp}`,
    `硬度: ${mat.hv}HV, 引張強度: ${mat.ts}MPa, 密度: ${mat.dn}g/cm³`,
    mat.memo ? `備考: ${mat.memo}` : '',
  ].filter(Boolean).join('\n');
}

function categorize(cat: string): string {
  if (cat.includes('金属')) return 'METAL';
  if (cat.includes('セラミ')) return 'CERAMIC';
  if (cat.includes('ポリマー')) return 'POLYMER';
  if (cat.includes('複合')) return 'COMPOSITE';
  return 'OTHER';
}

async function main() {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!url || !token) {
    console.error('UPSTASH_VECTOR_REST_URL と UPSTASH_VECTOR_REST_TOKEN を .env.local に設定してください');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY を .env.local に設定してください');
    process.exit(1);
  }

  const index = new Index({ url, token });
  const materials = INITIAL_DB;
  const BATCH = 20;

  console.log(`材料データ ${materials.length} 件をインジェストします...`);

  for (let i = 0; i < materials.length; i += BATCH) {
    const batch = materials.slice(i, i + BATCH);
    const texts = batch.map(buildMaterialText);

    const { embeddings } = await embedMany({ model: embeddingModel, values: texts });

    await index.upsert(
      batch.map((mat, j) => ({
        id: mat.id,
        vector: embeddings[j],
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

    console.log(`  ${Math.min(i + BATCH, materials.length)} / ${materials.length} 件完了`);
  }

  console.log('インジェスト完了');
}

main().catch(e => { console.error(e); process.exit(1); });
