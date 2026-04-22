import { describe, it, expect } from 'vitest';
import {
  GLOSSARY_MAPPINGS,
  MACHINING_FUNDAMENTALS_BASE_URL,
  urlForTerm,
  urlForChapter,
  isPendingTerm,
} from './glossaryMapping';

describe('glossaryMapping', () => {
  it('contains at least the 24 anchors delivered by peer (2026-04-23)', () => {
    expect(GLOSSARY_MAPPINGS.length).toBeGreaterThanOrEqual(24);
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
    it('builds the agreed URL shape <base>#/chapter/<id>/<term-id> (slash separator)', () => {
      // 2026-04-23: peer が RFC 3986 §3.5 理由で slash 形式に確定。ADR-013 Minor Revision 参照
      expect(urlForTerm('VB')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/8/VB`);
      expect(urlForTerm('Taylor')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/8/Taylor`);
      expect(urlForTerm('SLD')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/10/SLD`);
      expect(urlForTerm('atom')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/a1/atom`);
      expect(urlForTerm('chatter')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/10/chatter`);
    });

    it('falls back to base URL for unknown termId (peer guarantees home fallback)', () => {
      expect(urlForTerm('nonexistent-term')).toBe(MACHINING_FUNDAMENTALS_BASE_URL);
    });

    it('accepts a custom base URL (for staging / fixture)', () => {
      expect(urlForTerm('VB', 'https://example.test/')).toBe('https://example.test/#/chapter/8/VB');
    });
  });

  describe('urlForChapter', () => {
    it('returns chapter URL without anchor', () => {
      expect(urlForChapter('8')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/8`);
      expect(urlForChapter('a4')).toBe(`${MACHINING_FUNDAMENTALS_BASE_URL}#/chapter/a4`);
    });
  });

  describe('isPendingTerm', () => {
    // 2026-04-23: peer が Part A 全章 + 補強完了、pending フラグは全解除済
    it('returns false for all anchors currently in mapping (all 24 delivered)', () => {
      for (const m of GLOSSARY_MAPPINGS) {
        expect(isPendingTerm(m.termId)).toBe(false);
      }
    });

    it('returns false for unknown term', () => {
      expect(isPendingTerm('unknown')).toBe(false);
    });
  });
});
