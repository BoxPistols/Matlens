// 損傷所見の類似度スコアリング（純関数）。
//
// 「過去の類似事例を上位 N 件」のサジェスト用途。スコアは 0..1 の範囲で、
// 重み付きの加点で算出する。透明性を優先しているため数式は単純：
//
//   sameType         : 0.50 (同一の damage type)
//   tagJaccard       : 0.25 * |共通タグ| / |いずれかのタグ|
//   locationOverlap  : 0.15 * 共通する 1 文字以上のトークン比
//   sameConfidence   : 0.10 (確信度が一致)
//
// 高度な ML を使わない理由は、PoC で説明可能性を担保しつつ、後から
// embedding 等に差し替える際にもインタフェース（純関数）が崩れないため。

import type { DamageFinding } from '@/domain/types';

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[\s,;/／、。・()\[\]【】]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const x of setA) if (setB.has(x)) intersection += 1;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function damageSimilarity(target: DamageFinding, candidate: DamageFinding): number {
  if (target.id === candidate.id) return 0;
  let score = 0;
  if (target.type === candidate.type) score += 0.5;
  score += 0.25 * jaccard(target.tags, candidate.tags);
  score += 0.15 * jaccard(tokenize(target.location), tokenize(candidate.location));
  if (target.confidenceLevel === candidate.confidenceLevel) score += 0.1;
  return Math.min(score, 1);
}

export interface RankedDamage {
  damage: DamageFinding;
  score: number;
}

export function rankSimilarDamages(
  target: DamageFinding,
  candidates: DamageFinding[],
  limit: number,
): RankedDamage[] {
  return candidates
    .filter((d) => d.id !== target.id)
    .map((d) => ({ damage: d, score: damageSimilarity(target, d) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
