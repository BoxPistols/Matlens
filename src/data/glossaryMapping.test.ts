import { describe, it, expect } from 'vitest';
import {
  GLOSSARY_MAPPINGS,
  MACHINING_FUNDAMENTALS_BASE_URL,
  urlForTerm,
  urlForChapter,
  isPendingTerm,
} from './glossaryMapping';

describe('glossaryMapping', () => {
  it('contains at least the 20 terms agreed with peer', () => {
    expect(GLOSSARY_MAPPINGS.length).toBeGreaterThanOrEqual(20);
  });

  it('all terms have unique termId', () => {
    const ids = GLOSSARY_MAPPINGS.map((m) => m.termId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all terms have non-empty chapter / anchor', () => {
    for (const m of GLOSSARY_MAPPINGS) {
      expect(m.chapterRef).toMatch(/^[a-z0-9-]+$/i);
      expect(m.anchor.length).toBeGreaterThan(0);
    }
  });

  describe('urlForTerm', () => {
    it('builds the agreed URL shape <base>#/chapter/<id>#<term-id>', () => {
      expect(urlForTerm('VB')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/8#VB`);
      expect(urlForTerm('Taylor')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/8#Taylor`);
      expect(urlForTerm('SLD')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/10#SLD`);
      expect(urlForTerm('atom')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/a1#atom`);
    });

    it('falls back to base URL for unknown termId (peer guarantees home fallback)', () => {
      expect(urlForTerm('nonexistent-term')).toBe(MACHINING_FUNDAMENTALS_BASE_URL);
    });

    it('accepts a custom base URL (for staging / fixture)', () => {
      expect(urlForTerm('VB', 'https://example.test/')).toBe('https://example.test/#/chapter/8#VB');
    });
  });

  describe('urlForChapter', () => {
    it('returns chapter URL without anchor', () => {
      expect(urlForChapter('8')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/8`);
      expect(urlForChapter('a4')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/a4`);
    });
  });

  describe('isPendingTerm', () => {
    it('returns true for pending anchors (Part A not yet published)', () => {
      expect(isPendingTerm('metallic-bond')).toBe(true);
      expect(isPendingTerm('dislocation')).toBe(true);
    });

    it('returns false for already-published anchors', () => {
      expect(isPendingTerm('VB')).toBe(false);
      expect(isPendingTerm('Taylor')).toBe(false);
      expect(isPendingTerm('atom')).toBe(false); // A1 は公開済と peer が報告
    });

    it('returns false for unknown term', () => {
      expect(isPendingTerm('unknown')).toBe(false);
    });
  });
});
