import { describe, it, expect, beforeEach } from 'vitest';
import { INITIAL_DB, getNextId, incrementNextId } from './initialDb';
import type { MaterialCategory, MaterialStatus } from '../types';

const VALID_CATEGORIES: MaterialCategory[] = ['金属合金', 'セラミクス', 'ポリマー', '複合材料'];
const VALID_STATUSES: MaterialStatus[] = ['登録済', 'レビュー待', '承認済', '要修正'];

describe('INITIAL_DB', () => {
  it('has at least 15 records and all are well-formed', () => {
    // The seed list has grown as new sample materials were added; we only
    // assert a floor here so new additions don't require touching the test.
    expect(INITIAL_DB.length).toBeGreaterThanOrEqual(15);
  });

  it('every record has all required fields', () => {
    const requiredFields = [
      'id', 'name', 'cat', 'hv', 'ts', 'el',
      'comp', 'batch', 'date', 'author', 'status', 'memo',
    ];
    for (const record of INITIAL_DB) {
      for (const field of requiredFields) {
        expect(record).toHaveProperty(field);
      }
    }
  });

  it('all IDs match the MAT-XXXX pattern', () => {
    const pattern = /^MAT-\d{4}$/;
    for (const record of INITIAL_DB) {
      expect(record.id).toMatch(pattern);
    }
  });

  it('all IDs are unique', () => {
    const ids = INITIAL_DB.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all categories are valid MaterialCategory values', () => {
    for (const record of INITIAL_DB) {
      expect(VALID_CATEGORIES).toContain(record.cat);
    }
  });

  it('all statuses are valid MaterialStatus values', () => {
    for (const record of INITIAL_DB) {
      expect(VALID_STATUSES).toContain(record.status);
    }
  });

  it('all dates are in YYYY-MM-DD format', () => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    for (const record of INITIAL_DB) {
      expect(record.date).toMatch(datePattern);
    }
  });

  it('all numeric fields (hv, ts, el) are numbers', () => {
    for (const record of INITIAL_DB) {
      expect(typeof record.hv).toBe('number');
      expect(typeof record.ts).toBe('number');
      expect(typeof record.el).toBe('number');
    }
  });

  it('contains at least one record from each category', () => {
    for (const cat of VALID_CATEGORIES) {
      const found = INITIAL_DB.some(r => r.cat === cat);
      expect(found).toBe(true);
    }
  });
});

describe('getNextId', () => {
  it('returns a string in MAT-0XXX format', () => {
    const id = getNextId();
    expect(id).toMatch(/^MAT-0\d+$/);
  });

  it('returns an id beyond the last INITIAL_DB record', () => {
    // getNextId is seeded one past the last seed row; the exact number
    // drifts as we add more samples, so assert the invariant rather than
    // a hard-coded value.
    const next = getNextId();
    const nextNum = parseInt(next.replace('MAT-0', ''), 10);
    const maxSeedNum = Math.max(
      ...INITIAL_DB.map(r => parseInt(r.id.replace('MAT-0', ''), 10))
    );
    expect(nextNum).toBeGreaterThan(maxSeedNum);
  });
});

describe('incrementNextId', () => {
  it('increments so getNextId returns the next value', () => {
    const before = getNextId();
    incrementNextId();
    const after = getNextId();
    const beforeNum = parseInt(before.replace('MAT-0', ''), 10);
    const afterNum = parseInt(after.replace('MAT-0', ''), 10);
    expect(afterNum).toBe(beforeNum + 1);
  });

  it('increments multiple times correctly', () => {
    const baseline = getNextId();
    const baseNum = parseInt(baseline.replace('MAT-0', ''), 10);
    incrementNextId();
    incrementNextId();
    const result = getNextId();
    const resultNum = parseInt(result.replace('MAT-0', ''), 10);
    expect(resultNum).toBe(baseNum + 2);
  });
});
