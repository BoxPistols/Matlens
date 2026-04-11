import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { MaterialWithScore } from '../../types';
import { INITIAL_DB } from '../../data/initialDb';
import { resetTfjsEmbeddingCacheForTests } from '../../services/tfjsSemanticSearch';
import { useEmbedding } from './useEmbedding';

const tinyDb = INITIAL_DB.slice(0, 5);

describe('useEmbedding', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetTfjsEmbeddingCacheForTests();
  });

  it('starts with pending engine before any search', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);
    const { result } = renderHook(() => useEmbedding(tinyDb));
    expect(result.current.engine).toBe('pending');
  });

  it('falls back to tfjs and sets engine when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useEmbedding(tinyDb));
    let rows: MaterialWithScore[] = [];
    await act(async () => {
      rows = await result.current.search('alloy', 3);
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(result.current.engine).toBe('tfjs');
  });

  it('uses API rows and engine when fetch succeeds with results', async () => {
    const id = tinyDb[0]!.id;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        engine: 'upstash',
        results: [{ id, score: 0.91 }],
      }),
    } as Response);
    const { result } = renderHook(() => useEmbedding(tinyDb));
    let rows: MaterialWithScore[] = [];
    await act(async () => {
      rows = await result.current.search('q', 3);
    });
    expect(rows[0]?.id).toBe(id);
    expect(result.current.engine).toBe('upstash');
  });

  it('sets keyword engine when API returns empty results', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ engine: 'upstash', results: [] }),
    } as Response);
    const { result } = renderHook(() => useEmbedding(tinyDb));
    await act(async () => {
      await result.current.search('zzzznonexistent', 3);
    });
    expect(result.current.engine).toBe('keyword');
  });
});
