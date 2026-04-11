import type { Material, MaterialWithScore } from '../types';

/** Batch size for USE.embed (balance memory vs round-trips). */
const EMBED_BATCH = 16;

export function materialTextForEmbedding(m: Material): string {
  return `${m.name} ${m.cat} ${m.comp} ${m.memo}`;
}

export function cosineSimilarity(a: ReadonlyArray<number>, b: ReadonlyArray<number>): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom > 0 ? dot / denom : 0;
}

function dbFingerprint(db: Material[]): string {
  return db.map(m => m.id).join('\u0000');
}

type Tensor2DLike = {
  array: () => Promise<number[][]>;
  dispose: () => void;
};

type UniversalSentenceEncoderLike = {
  embed: (inputs: string[] | string) => Promise<Tensor2DLike>;
};

let cachedFingerprint = '';
let vectorsById: Map<string, number[]> | null = null;
let loadPromise: Promise<UniversalSentenceEncoderLike> | null = null;

async function loadEncoder(): Promise<UniversalSentenceEncoderLike> {
  const mod = await import('@tensorflow-models/universal-sentence-encoder');
  return mod.load() as Promise<UniversalSentenceEncoderLike>;
}

async function getModel(): Promise<UniversalSentenceEncoderLike> {
  if (!loadPromise) loadPromise = loadEncoder();
  return loadPromise;
}

/** Vitest などでキャッシュを捨てる */
export function resetTfjsEmbeddingCacheForTests(): void {
  cachedFingerprint = '';
  vectorsById = null;
  loadPromise = null;
}

async function tensorToRows(t: Tensor2DLike): Promise<number[][]> {
  try {
    return await t.array();
  } finally {
    t.dispose();
  }
}

/**
 * `/api/search` が使えないときのブラウザ内フォールバック。
 * Universal Sentence Encoder（512 次元）＋コサイン類似度。動的 import のみ。
 */
export async function semanticSearchWithTfjs(
  db: Material[],
  query: string,
  topK: number,
  signal?: AbortSignal,
): Promise<MaterialWithScore[]> {
  const q = query.trim();
  if (!q || db.length === 0) return [];

  try {
    const model = await getModel();
    if (signal?.aborted) return [];

    const fp = dbFingerprint(db);
    if (fp !== cachedFingerprint || vectorsById === null) {
      const next = new Map<string, number[]>();
      const texts = db.map(materialTextForEmbedding);
      for (let i = 0; i < texts.length; i += EMBED_BATCH) {
        if (signal?.aborted) return [];
        const slice = texts.slice(i, i + EMBED_BATCH);
        const t = await model.embed(slice);
        const rows = await tensorToRows(t);
        for (let j = 0; j < rows.length; j++) {
          const row = rows[j];
          const mat = db[i + j];
          if (row !== undefined && mat !== undefined) next.set(mat.id, row);
        }
      }
      vectorsById = next;
      cachedFingerprint = fp;
    }

    if (signal?.aborted) return [];

    const qt = await model.embed([q]);
    const qRows = await tensorToRows(qt);
    const queryVec = qRows[0];
    if (!queryVec?.length) return [];

    const scored: MaterialWithScore[] = db.map(m => {
      const v = vectorsById?.get(m.id);
      return { ...m, score: v ? cosineSimilarity(queryVec, v) : 0 };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  } catch {
    return [];
  }
}
