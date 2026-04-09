import { useState, useCallback } from 'react';
import type { Material, MaterialWithScore, EmbeddingHook } from '../../types';

// Keyword fallback for when server search returns no results or errors
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
  const [engine, setEngine] = useState<string>('ready');

  const search = useCallback(async (query: string, topK: number = 5): Promise<MaterialWithScore[]> => {
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, k: topK, db }),
      });
      if (!res.ok) throw new Error('Search API error');
      const data = await res.json();
      setEngine(data.engine || 'server');

      if (data.results && data.results.length > 0) {
        // Map server results back to MaterialWithScore
        // Server may return full Material objects (keyword) or partial (upstash)
        return data.results.map((r: any) => {
          // If result came from keyword search, it already has full Material fields
          if (r.date !== undefined) return r as MaterialWithScore;
          // Upstash results: find matching material in local db, attach score
          const local = db.find(m => m.id === r.id);
          if (local) return { ...local, score: r.score ?? 0 };
          // Construct minimal result from server metadata
          return {
            id: r.id, name: r.name || '', cat: r.cat || '金属合金',
            hv: r.hv || 0, ts: r.ts || 0, el: 0, pf: null, el2: 0, dn: r.dn || 0,
            comp: r.comp || '', batch: '', date: '', author: '', status: '登録済' as const,
            ai: false, memo: '', score: r.score ?? 0,
          } as MaterialWithScore;
        });
      }
    } catch {
      // Server unavailable — use client-side keyword fallback
      setEngine('keyword');
    }

    return keywordSearch(db, query, topK);
  }, [db]);

  const addToIndex = useCallback(async (_record: Material): Promise<void> => {
    // Server-side indexing is handled by /api/ingest
    // No-op on client side
  }, []);

  return { status: 'ready', search, addToIndex, embCount: db.length, engine };
}
