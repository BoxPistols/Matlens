import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  validatePrompt,
  validateOptionalSystem,
  validateProvider,
  validateSearchQuery,
  validateTopK,
  validateCategoryFilter,
  validateIngestMaterials,
  assertJsonContentType,
  LIMITS,
} from './validation.js';

describe('validatePrompt', () => {
  it('accepts a short valid prompt', () => {
    expect(validatePrompt('hello')).toBe('hello');
  });

  it('normalizes Unicode to NFKC', () => {
    // Full-width digits should fold to ASCII
    expect(validatePrompt('１２３')).toBe('123');
  });

  it('rejects non-string input', () => {
    expect(() => validatePrompt(42)).toThrow(ValidationError);
    expect(() => validatePrompt(null)).toThrow(ValidationError);
    expect(() => validatePrompt(undefined)).toThrow(ValidationError);
  });

  it('rejects empty string', () => {
    expect(() => validatePrompt('')).toThrow(/empty/);
  });

  it('rejects null bytes', () => {
    expect(() => validatePrompt('hello\x00world')).toThrow(/null byte/);
  });

  it('rejects prompts over MAX_PROMPT_LENGTH', () => {
    const huge = 'a'.repeat(LIMITS.MAX_PROMPT_LENGTH + 1);
    expect(() => validatePrompt(huge)).toThrow(/too long/);
  });
});

describe('validateOptionalSystem', () => {
  it('returns undefined for missing input', () => {
    expect(validateOptionalSystem(undefined)).toBeUndefined();
    expect(validateOptionalSystem(null)).toBeUndefined();
  });
  it('validates like a prompt when provided', () => {
    expect(validateOptionalSystem('sys')).toBe('sys');
    expect(() => validateOptionalSystem('x\x00')).toThrow(/null byte/);
  });
});

describe('validateProvider', () => {
  it('accepts allowlisted providers', () => {
    expect(validateProvider('openai-nano')).toBe('openai-nano');
    expect(validateProvider('openai-mini')).toBe('openai-mini');
    expect(validateProvider('gemini')).toBe('gemini');
  });
  it('rejects unknown providers', () => {
    expect(() => validateProvider('openai-gpt4')).toThrow(/invalid provider/);
    expect(() => validateProvider('claude')).toThrow(/invalid provider/);
    expect(() => validateProvider('')).toThrow(/invalid provider/);
  });
  it('rejects non-string input', () => {
    expect(() => validateProvider(42)).toThrow(/string/);
  });
});

describe('validateSearchQuery', () => {
  it('accepts valid queries', () => {
    expect(validateSearchQuery('耐熱合金')).toBe('耐熱合金');
  });
  it('rejects queries over MAX_QUERY_LENGTH', () => {
    expect(() => validateSearchQuery('a'.repeat(LIMITS.MAX_QUERY_LENGTH + 1))).toThrow(/too long/);
  });
});

describe('validateTopK', () => {
  it('defaults to fallback when undefined', () => {
    expect(validateTopK(undefined)).toBe(6);
    expect(validateTopK(undefined, 10)).toBe(10);
  });
  it('accepts integers in range', () => {
    expect(validateTopK(1)).toBe(1);
    expect(validateTopK(20)).toBe(20);
  });
  it('rejects non-integer or out-of-range values', () => {
    expect(() => validateTopK(0)).toThrow(/between/);
    expect(() => validateTopK(21)).toThrow(/between/);
    expect(() => validateTopK(1.5)).toThrow(/integer/);
    expect(() => validateTopK('5')).toThrow(/integer/);
  });
});

describe('validateCategoryFilter', () => {
  it('accepts allowlisted categories', () => {
    expect(validateCategoryFilter('METAL')).toBe('METAL');
    expect(validateCategoryFilter('CERAMIC')).toBe('CERAMIC');
  });
  it('returns undefined for empty', () => {
    expect(validateCategoryFilter(undefined)).toBeUndefined();
    expect(validateCategoryFilter('')).toBeUndefined();
  });
  it('rejects unknown categories', () => {
    expect(() => validateCategoryFilter('WOOD')).toThrow(/invalid category/);
  });
});

describe('validateIngestMaterials', () => {
  const valid = {
    id: 'MAT-0001',
    name: 'SUS316L',
    cat: '金属合金',
    comp: 'Fe-17Cr-12Ni',
    memo: '',
    hv: 186,
    ts: 520,
    el: 193,
    dn: 7.98,
  };

  it('accepts and normalizes a single valid material', () => {
    const result = validateIngestMaterials([valid]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('MAT-0001');
  });

  it('rejects non-array input', () => {
    expect(() => validateIngestMaterials('nope')).toThrow(/array/);
    expect(() => validateIngestMaterials({})).toThrow(/array/);
  });

  it('rejects empty array', () => {
    expect(() => validateIngestMaterials([])).toThrow(/empty/);
  });

  it('rejects arrays over the ingest limit', () => {
    const many = Array.from({ length: LIMITS.MAX_MATERIALS_PER_INGEST + 1 }, (_, i) => ({
      ...valid,
      id: `MAT-${i}`,
    }));
    expect(() => validateIngestMaterials(many)).toThrow(/too many/);
  });

  it('rejects materials missing an id', () => {
    expect(() => validateIngestMaterials([{ ...valid, id: '' }])).toThrow(/required/);
  });

  it('rejects non-finite numeric fields', () => {
    expect(() => validateIngestMaterials([{ ...valid, hv: NaN }])).toThrow(/finite number/);
    expect(() => validateIngestMaterials([{ ...valid, ts: Infinity }])).toThrow(/finite number/);
  });

  it('rejects null bytes in string fields', () => {
    expect(() => validateIngestMaterials([{ ...valid, name: 'x\x00y' }])).toThrow(/null byte/);
  });
});

describe('assertJsonContentType', () => {
  it('accepts application/json', () => {
    expect(() => assertJsonContentType({ headers: { 'content-type': 'application/json' } })).not.toThrow();
  });
  it('accepts application/json with charset', () => {
    expect(() =>
      assertJsonContentType({ headers: { 'content-type': 'application/json; charset=utf-8' } })
    ).not.toThrow();
  });
  it('rejects form-urlencoded', () => {
    expect(() =>
      assertJsonContentType({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    ).toThrow(/Unsupported Media Type/);
  });
  it('rejects missing content-type', () => {
    expect(() => assertJsonContentType({ headers: {} })).toThrow();
  });
});
