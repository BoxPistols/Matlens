// シンプルなテキスト一致によるモック検索
// 将来 pgvector/Pinecone 等に差し替える想定

import { delay } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import type {
  SearchEntityType,
  SearchHit,
  SearchQuery,
  SearchRepository,
} from '../interfaces/search.repo';

const scoreTextMatch = (query: string, target: string): number => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!t.includes(q)) return 0;
  // 完全一致寄与 + 長さ正規化
  const hits = (t.match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
  return Math.min(0.98, 0.4 + 0.1 * hits + 0.2 * (q.length / Math.max(10, t.length)));
};

const extractHighlights = (query: string, text: string, maxLen = 180): string => {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text.slice(0, maxLen);
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 100);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
};

export const createMockSearchRepository = (): SearchRepository => ({
  async semantic(query: SearchQuery): Promise<SearchHit[]> {
    await delay(250);
    const db = getMockDatabase();
    const hits: SearchHit[] = [];
    const types: SearchEntityType[] = query.entityTypes ?? ['damage', 'material', 'project', 'report'];

    if (types.includes('damage')) {
      for (const d of db.damages.getAll()) {
        const text = `${d.location} ${d.rootCauseHypothesis} ${d.tags.join(' ')}`;
        const s = scoreTextMatch(query.query, text);
        if (s > 0) {
          hits.push({
            entityType: 'damage',
            entityId: d.id,
            title: `${d.type} - ${d.location}`,
            snippet: extractHighlights(query.query, d.rootCauseHypothesis),
            score: s,
            highlights: [query.query],
          });
        }
      }
    }

    if (types.includes('material')) {
      for (const m of db.materials.getAll()) {
        const text = `${m.designation} ${m.category} ${m.description ?? ''}`;
        const s = scoreTextMatch(query.query, text);
        if (s > 0) {
          hits.push({
            entityType: 'material',
            entityId: m.id,
            title: m.designation,
            snippet: extractHighlights(query.query, m.description ?? m.designation),
            score: s * 0.9,
            highlights: [query.query],
          });
        }
      }
    }

    if (types.includes('project')) {
      for (const p of db.projects.getAll()) {
        const s = scoreTextMatch(query.query, `${p.code} ${p.title}`);
        if (s > 0) {
          hits.push({
            entityType: 'project',
            entityId: p.id,
            title: p.title,
            snippet: p.code,
            score: s * 0.85,
            highlights: [query.query],
          });
        }
      }
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, query.limit ?? 20);
  },

  async similarImages(_imageUrl, limit = 12) {
    await delay(400);
    // モックでは最新の損傷所見を返すだけ
    return getMockDatabase()
      .damages.getAll()
      .slice(0, limit)
      .map((d) => ({
        entityType: 'damage' as const,
        entityId: d.id,
        title: `${d.type} - ${d.location}`,
        snippet: d.rootCauseHypothesis,
        score: 0.5 + Math.random() * 0.4,
        highlights: [],
      }));
  },

  async suggestions(partial) {
    await delay(50);
    const db = getMockDatabase();
    const q = partial.toLowerCase();
    if (q.length < 2) return [];
    const pool = new Set<string>();
    db.materials.getAll().forEach((m) => {
      if (m.designation.toLowerCase().includes(q)) pool.add(m.designation);
    });
    db.damages.getAll().forEach((d) => {
      if (d.location.toLowerCase().includes(q)) pool.add(d.location);
    });
    return Array.from(pool).slice(0, 8);
  },
});
