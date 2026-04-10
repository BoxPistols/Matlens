import { useState, useCallback, useEffect, useRef } from 'react';
import type { Material, MaterialWithScore, EmbeddingHook } from '../../types';

// Tokenize query for keyword matching (Japanese-aware)
function tokenize(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  // Split on whitespace, punctuation (Japanese and ASCII), and common separators
  const tokens = q
    .split(/[\s、。・，．,.\/\\\-_;:!?"'（）()「」『』【】\[\]]+/)
    .filter(t => t.length > 0);
  // If tokenization yielded only one long Japanese token, generate character bigrams.
  // Hoist tokens[0] into a local so strict mode's noUncheckedIndexedAccess is happy.
  const first = tokens[0];
  if (tokens.length === 1 && first !== undefined && /[^\x00-\x7F]/.test(first) && first.length >= 3) {
    const bigrams: string[] = [];
    for (let i = 0; i < first.length - 1; i++) {
      bigrams.push(first.slice(i, i + 2));
    }
    return [...tokens, ...bigrams];
  }
  return tokens;
}

// Keyword fallback for when server search returns no results or errors
function keywordSearch(db: Material[], query: string, topK: number): MaterialWithScore[] {
  const words = tokenize(query);
  if (words.length === 0) return [];
  return db
    .map(r => {
      const text = `${r.name} ${r.cat} ${r.comp} ${r.memo}`.toLowerCase();
      const matchCount = words.filter(w => text.includes(w)).length;
      return { ...r, score: matchCount / words.length };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function useEmbedding(db: Material[]): EmbeddingHook {
  const [engine, setEngine] = useState<string>('ready');
  // Track the in-flight AbortController so each new search cancels the
  // previous one. Without this, a user typing fast in the search box races
  // multiple /api/search round-trips and whichever finishes *last* wins,
  // even if that's the older request. We also abort on unmount to keep
  // setEngine from firing on a torn-down component.
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const search = useCallback(async (query: string, topK: number = 5): Promise<MaterialWithScore[]> => {
    // Cancel any still-pending search before kicking off a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, k: topK, db }),
        signal: controller.signal,
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
    } catch (err) {
      // An AbortError is a deliberate cancellation (user typed a new
      // query, or the component unmounted). Return an empty list without
      // touching engine state so the superseding search stays in control.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return [];
      }
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
