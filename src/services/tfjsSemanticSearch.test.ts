import { describe, expect, it } from 'vitest';
import type { Material } from '../types';
import { cosineSimilarity, materialTextForEmbedding } from './tfjsSemanticSearch';

const sampleMaterial = (): Material => ({
  id: 'm1',
  name: '試料A',
  cat: '金属合金',
  hv: 100,
  ts: 200,
  el: 1,
  pf: null,
  el2: 0,
  dn: 7.8,
  comp: 'Fe-C',
  batch: 'b1',
  date: '2024-01-01',
  author: 't',
  status: '登録済',
  ai: false,
  memo: '高強度',
});

describe('materialTextForEmbedding', () => {
  it('concatenates name, category, composition, memo', () => {
    const t = materialTextForEmbedding(sampleMaterial());
    expect(t).toContain('試料A');
    expect(t).toContain('金属合金');
    expect(t).toContain('Fe-C');
    expect(t).toContain('高強度');
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it('returns 0 for length mismatch or empty', () => {
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
  });
});
