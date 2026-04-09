import { useState, useEffect, useRef, useCallback } from 'react';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { OWN_KEY_STORAGE } from '../../data/constants';
import type { Material, MaterialWithScore, EmbeddingHook } from '../../types';

function getOwnKey(): string {
  try { return localStorage.getItem(OWN_KEY_STORAGE) || ''; } catch { return ''; }
}

// --- OpenAI Embeddings API ---
async function openaiEmbed(texts: string[], apiKey: string): Promise<number[][]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: texts }),
  });
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return d.data.map((item: { embedding: number[] }) => item.embedding);
}

// --- Cosine similarity ---
function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

// --- Keyword fallback search ---
function keywordSearch(db: Material[], query: string, topK: number): MaterialWithScore[] {
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

export function useEmbedding(db: Material[]): EmbeddingHook {
  const [embeddings, setEmbeddings] = useState<Record<string, number[]>>({});
  const [status, setStatus] = useState<string>('idle');
  const modelRef = useRef<any>(null);
  const engineRef = useRef<'openai' | 'tfjs' | 'keyword'>('keyword');

  useEffect(() => {
    let cancelled = false;
    const ownKey = getOwnKey();

    (async () => {
      // Strategy 1: OpenAI Embeddings (if user has own key)
      if (ownKey) {
        setStatus('loading');
        try {
          const texts = db.map(r =>
            `${r.name} ${r.cat} ${r.comp} 硬度${r.hv}HV 引張${r.ts}MPa ${r.memo}`.trim()
          );
          // Batch in chunks of 20 to respect rate limits
          const allEmbeddings: number[][] = [];
          for (let i = 0; i < texts.length; i += 20) {
            const batch = texts.slice(i, i + 20);
            setStatus(`indexing`);
            const batchResult = await openaiEmbed(batch, ownKey);
            allEmbeddings.push(...batchResult);
          }
          if (cancelled) return;
          const map: Record<string, number[]> = {};
          db.forEach((r, i) => { map[r.id] = allEmbeddings[i]; });
          setEmbeddings(map);
          engineRef.current = 'openai';
          setStatus('ready');
          return;
        } catch (e) {
          console.warn('OpenAI Embeddings failed, falling back to TF.js:', e);
        }
      }

      // Strategy 2: TF.js Universal Sentence Encoder (free, browser-side)
      setStatus('loading');
      try {
        const m = await use.load();
        if (cancelled) return;
        modelRef.current = m;
        const texts = db.map(r =>
          `${r.name} ${r.cat} ${r.comp} 硬度${r.hv}HV 引張${r.ts}MPa ${r.memo}`.trim()
        );
        setStatus('indexing');
        const emb = await m.embed(texts);
        const arr = await emb.array();
        emb.dispose();
        if (cancelled) return;
        const map: Record<string, number[]> = {};
        db.forEach((r, i) => { map[r.id] = arr[i]; });
        setEmbeddings(map);
        engineRef.current = 'tfjs';
        setStatus('ready');
      } catch (e) {
        // Strategy 3: Keyword fallback
        if (!cancelled) {
          engineRef.current = 'keyword';
          setStatus('fallback');
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const search = useCallback(async (query: string, topK: number = 5): Promise<MaterialWithScore[]> => {
    const ownKey = getOwnKey();

    // OpenAI path: embed query via API
    if (engineRef.current === 'openai' && ownKey) {
      try {
        const [qVec] = await openaiEmbed([query], ownKey);
        return db
          .map(r => ({ ...r, score: embeddings[r.id] ? cosineSim(qVec, embeddings[r.id]) : 0 }))
          .sort((a, b) => b.score - a.score)
          .slice(0, topK);
      } catch {
        // Fall through to TF.js or keyword
      }
    }

    // TF.js path: embed query in browser
    if (modelRef.current) {
      const t = await modelRef.current.embed([query]);
      const arr = await t.array();
      t.dispose();
      const qVec = arr[0];
      return db
        .map(r => ({ ...r, score: embeddings[r.id] ? cosineSim(qVec, embeddings[r.id]) : 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    }

    // Keyword fallback
    return keywordSearch(db, query, topK);
  }, [db, embeddings]);

  const addToIndex = useCallback(async (record: Material): Promise<void> => {
    const text = `${record.name} ${record.cat} ${record.comp} 硬度${record.hv}HV 引張${record.ts}MPa ${record.memo}`.trim();
    const ownKey = getOwnKey();

    if (engineRef.current === 'openai' && ownKey) {
      try {
        const [vec] = await openaiEmbed([text], ownKey);
        setEmbeddings(prev => ({ ...prev, [record.id]: vec }));
        return;
      } catch { /* fall through */ }
    }

    if (modelRef.current) {
      const emb = await modelRef.current.embed([text]);
      const arr = await emb.array();
      emb.dispose();
      setEmbeddings(prev => ({ ...prev, [record.id]: arr[0] }));
    }
  }, []);

  const engineLabel = engineRef.current === 'openai' ? 'OpenAI' : engineRef.current === 'tfjs' ? 'TF.js' : 'Keyword';

  return {
    status,
    embeddings,
    search,
    addToIndex,
    embCount: Object.keys(embeddings).length,
    engine: engineLabel,
  };
}
