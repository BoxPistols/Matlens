import { useState, useCallback, useEffect, useRef } from 'react';
import type { Material, MaterialCategory, MaterialWithScore, EmbeddingHook } from '../../types';
import { semanticSearchWithTfjs } from '../../services/tfjsSemanticSearch';

/** `/api/search` の JSON 行（Upstash メタのみ / キーワード時は Material 近似） */
interface SearchApiRow {
  id: string;
  score?: number;
  date?: string;
  name?: string;
  cat?: string;
  hv?: number;
  ts?: number;
  el?: number;
  pf?: number | null;
  el2?: number;
  dn?: number;
  comp?: string;
  batch?: string;
  author?: string;
  status?: string;
  ai?: boolean;
  memo?: string;
}

function mapSearchRowToMaterial(r: SearchApiRow, db: Material[]): MaterialWithScore {
  if (r.date !== undefined) {
    return r as MaterialWithScore;
  }
  const local = db.find(m => m.id === r.id);
  if (local) return { ...local, score: r.score ?? 0 };
  return {
    id: r.id,
    name: r.name ?? '',
    cat: (r.cat as MaterialCategory) ?? '金属合金',
    hv: r.hv ?? 0,
    ts: r.ts ?? 0,
    el: r.el ?? 0,
    pf: r.pf ?? null,
    el2: r.el2 ?? 0,
    dn: r.dn ?? 0,
    comp: r.comp ?? '',
    batch: r.batch ?? '',
    date: r.date ?? '',
    author: r.author ?? '',
    status: (r.status as Material['status']) ?? '登録済',
    ai: r.ai ?? false,
    memo: r.memo ?? '',
    score: r.score ?? 0,
  };
}

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
      const data: { engine?: string; results?: SearchApiRow[] } = await res.json();
      setEngine(data.engine || 'server');

      if (data.results && data.results.length > 0) {
        return data.results.map(r => mapSearchRowToMaterial(r, db));
      }
    } catch (err) {
      // An AbortError is a deliberate cancellation (user typed a new
      // query, or the component unmounted). Return an empty list without
      // touching engine state so the superseding search stays in control.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return [];
      }
      // サーバー不可時: まず TensorFlow.js + USE（ブラウザ内）、だめならキーワード
      const tfResults = await semanticSearchWithTfjs(db, query, topK, controller.signal);
      if (tfResults.length > 0) {
        setEngine('tfjs');
        return tfResults;
      }
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
