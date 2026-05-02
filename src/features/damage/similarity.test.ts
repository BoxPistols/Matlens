import { describe, it, expect } from 'vitest';
import type { DamageFinding } from '@/domain/types';
import { damageSimilarity, rankSimilarDamages } from './similarity';

const audit = {
  createdAt: '2026-04-17T10:00:00+09:00',
  updatedAt: '2026-04-17T10:00:00+09:00',
  createdBy: 'u',
  updatedBy: 'u',
};

const make = (over: Partial<DamageFinding> = {}): DamageFinding => ({
  id: over.id ?? 'd-base',
  reportId: 'r-1',
  testId: 't-1',
  type: 'fatigue',
  location: 'fillet R',
  rootCauseHypothesis: '',
  confidenceLevel: 'medium',
  images: [],
  similarCaseIds: [],
  tags: [],
  ...audit,
  ...over,
});

describe('damageSimilarity', () => {
  it('returns 0 for the same id', () => {
    const a = make({ id: 'x' });
    expect(damageSimilarity(a, a)).toBe(0);
  });

  it('rewards same type with 0.5', () => {
    const a = make({ id: 'a', type: 'fatigue', tags: [], location: '', confidenceLevel: 'low' });
    const b = make({ id: 'b', type: 'fatigue', tags: [], location: '', confidenceLevel: 'high' });
    expect(damageSimilarity(a, b)).toBeCloseTo(0.5, 5);
  });

  it('rewards tag overlap up to 0.25 (Jaccard)', () => {
    // 異なる type / 異なる location トークン / 異なる conf にして、tag 寄与だけ残す
    const a = make({
      id: 'a',
      tags: ['fillet', 'high-cycle'],
      type: 'creep',
      location: 'A',
      confidenceLevel: 'low',
    });
    const b = make({
      id: 'b',
      tags: ['fillet', 'high-cycle'],
      type: 'fatigue',
      location: 'B',
      confidenceLevel: 'high',
    });
    // 完全 tag overlap → +0.25
    expect(damageSimilarity(a, b)).toBeCloseTo(0.25, 5);
  });

  it('rewards location token overlap', () => {
    const a = make({ id: 'a', location: 'fillet R' });
    const b = make({ id: 'b', location: 'fillet near R' });
    // same type 0.5 + location tokens "fillet"+"r" vs "fillet"+"near"+"r" => 2/3 overlap
    // same conf medium => 0.1
    const s = damageSimilarity(a, b);
    expect(s).toBeGreaterThan(0.5 + 0.1);
    expect(s).toBeLessThan(1);
  });

  it('caps the score at 1', () => {
    const a = make({ id: 'a', tags: ['x'], location: 'foo bar' });
    const b = make({ id: 'b', tags: ['x'], location: 'foo bar' });
    expect(damageSimilarity(a, b)).toBeLessThanOrEqual(1);
  });
});

describe('rankSimilarDamages', () => {
  const target = make({ id: 'target', type: 'fatigue', tags: ['fillet'], location: 'fillet R' });
  const exact = make({ id: 'exact', type: 'fatigue', tags: ['fillet'], location: 'fillet R' });
  const sameType = make({ id: 'same-type', type: 'fatigue', tags: [], location: 'tip' });
  const otherType = make({ id: 'other', type: 'creep', tags: ['fillet'], location: 'fillet R' });
  const unrelated = make({
    id: 'unrelated',
    type: 'wear',
    tags: [],
    location: 'completely different',
    confidenceLevel: 'low',
  });

  it('sorts by score desc and drops the target itself', () => {
    const out = rankSimilarDamages(target, [target, exact, sameType, otherType, unrelated], 5);
    const ids = out.map((r) => r.damage.id);
    expect(ids[0]).toBe('exact');
    // target itself is filtered
    expect(ids).not.toContain('target');
  });

  it('limits to N', () => {
    const out = rankSimilarDamages(target, [exact, sameType, otherType, unrelated], 2);
    expect(out).toHaveLength(2);
  });

  it('drops zero-score candidates', () => {
    const target2 = make({
      id: 'target2',
      type: 'fatigue',
      tags: [],
      location: 'A',
      confidenceLevel: 'high',
    });
    const zero = make({
      id: 'zero',
      type: 'thermal',
      tags: [],
      location: 'B',
      confidenceLevel: 'low',
    });
    const out = rankSimilarDamages(target2, [zero], 5);
    expect(out).toHaveLength(0);
  });
});
