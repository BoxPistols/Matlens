import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAI } from './useAI';

beforeEach(() => {
  // Remove the stored key instead of clear() which may not be available
  try { localStorage.removeItem('matlens_own_openai_key'); } catch (_) {}
  // Mock the initial fetch for /api/ai (rate info) so the hook doesn't throw
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    const method = (init?.method || 'GET').toUpperCase();

    if (url === '/api/ai' && method === 'GET') {
      return new Response(JSON.stringify({ remaining: 20, limit: 30 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url === '/api/ai' && method === 'POST') {
      return new Response(JSON.stringify({ text: 'mocked AI response', remaining: 19, limit: 30 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('{}', { status: 404 });
  });
});

describe('useAI', () => {
  it('initial provider is openai-nano', () => {
    const { result } = renderHook(() => useAI());
    expect(result.current.provider).toBe('openai-nano');
  });

  it('providers array has 3 items', () => {
    const { result } = renderHook(() => useAI());
    expect(result.current.providers).toHaveLength(3);
  });

  it('providers include expected ids', () => {
    const { result } = renderHook(() => useAI());
    const ids = result.current.providers.map(p => p.id);
    expect(ids).toContain('openai-nano');
    expect(ids).toContain('openai-mini');
    expect(ids).toContain('gemini-flash');
  });

  it('hasOwnKey is false initially', () => {
    const { result } = renderHook(() => useAI());
    expect(result.current.hasOwnKey).toBe(false);
  });

  it('ownKey is empty string initially', () => {
    const { result } = renderHook(() => useAI());
    expect(result.current.ownKey).toBe('');
  });

  it('providerDef matches the selected provider', () => {
    const { result } = renderHook(() => useAI());
    expect(result.current.providerDef.id).toBe('openai-nano');
  });

  it('setProvider changes the provider', () => {
    const { result } = renderHook(() => useAI());
    act(() => {
      result.current.setProvider('gemini-flash');
    });
    expect(result.current.provider).toBe('gemini-flash');
  });

  it('call function returns a string', async () => {
    const { result } = renderHook(() => useAI());

    let response: string = '';
    await act(async () => {
      response = await result.current.call('test prompt');
    });

    expect(typeof response).toBe('string');
    expect(response).toBe('mocked AI response');
  });

  it('call sends POST to /api/ai for proxy providers', async () => {
    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.call('test prompt');
    });

    // Verify fetch was called with POST /api/ai
    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls;
    const postCall = calls.find(
      (c: any) => c[0] === '/api/ai' && c[1]?.method === 'POST'
    );
    expect(postCall).toBeDefined();
  });

  it('rateInfo is populated after initial fetch', async () => {
    const { result } = renderHook(() => useAI());

    await waitFor(() => {
      expect(result.current.rateInfo.remaining).toBe(20);
      expect(result.current.rateInfo.limit).toBe(30);
    });
  });

  it('setOwnKey stores a key and switches to openai-mini', () => {
    const { result } = renderHook(() => useAI());

    act(() => {
      result.current.setOwnKey('sk-test-key-12345');
    });

    expect(result.current.hasOwnKey).toBe(true);
    expect(result.current.ownKey).toBe('sk-test-key-12345');
    expect(result.current.provider).toBe('openai-mini');
  });

  it('clearing ownKey reverts provider to openai-nano', () => {
    const { result } = renderHook(() => useAI());

    act(() => {
      result.current.setOwnKey('sk-test-key-12345');
    });
    expect(result.current.provider).toBe('openai-mini');

    act(() => {
      result.current.setOwnKey('');
    });
    expect(result.current.hasOwnKey).toBe(false);
    expect(result.current.provider).toBe('openai-nano');
  });
});
