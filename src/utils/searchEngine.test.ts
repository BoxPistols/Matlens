import { describe, expect, it } from 'vitest';
import { formatSearchEngineLabel } from './searchEngine';

describe('formatSearchEngineLabel', () => {
  it('returns null for pending and undefined', () => {
    expect(formatSearchEngineLabel('pending')).toBeNull();
    expect(formatSearchEngineLabel(undefined)).toBeNull();
  });

  it('maps known engines', () => {
    expect(formatSearchEngineLabel('upstash')).toBe('Upstash');
    expect(formatSearchEngineLabel('keyword')).toBe('キーワード');
    expect(formatSearchEngineLabel('tfjs')).toBe('TF.js USE');
    expect(formatSearchEngineLabel('server')).toBe('サーバー');
  });

  it('passes through unknown ids for forward compatibility', () => {
    expect(formatSearchEngineLabel('future-engine')).toBe('future-engine');
  });
});
