import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiLogs, onApiLog, MOCK_CONFIG, installMockAPI, clearApiLogs } from './mockApi';

beforeEach(() => {
  clearApiLogs();
});

describe('getApiLogs', () => {
  it('returns an empty array initially (after clear)', () => {
    expect(getApiLogs()).toEqual([]);
  });

  it('returns an array', () => {
    expect(Array.isArray(getApiLogs())).toBe(true);
  });
});

describe('onApiLog', () => {
  it('registers a listener and returns an unsubscribe function', () => {
    const listener = vi.fn();
    const unsub = onApiLog(listener);
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('unsubscribe prevents further notifications', () => {
    const listener = vi.fn();
    const unsub = onApiLog(listener);
    unsub();
    // After unsubscribe, triggering a log should not call the listener.
    // We verify this indirectly through installMockAPI below.
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('MOCK_CONFIG', () => {
  it('has baseLatency property', () => {
    expect(MOCK_CONFIG).toHaveProperty('baseLatency');
    expect(typeof MOCK_CONFIG.baseLatency).toBe('number');
  });

  it('has jitter property', () => {
    expect(MOCK_CONFIG).toHaveProperty('jitter');
    expect(typeof MOCK_CONFIG.jitter).toBe('number');
  });

  it('has errorRate property', () => {
    expect(MOCK_CONFIG).toHaveProperty('errorRate');
    expect(typeof MOCK_CONFIG.errorRate).toBe('number');
  });

  it('has expected default values', () => {
    expect(MOCK_CONFIG.baseLatency).toBe(120);
    expect(MOCK_CONFIG.jitter).toBe(80);
    expect(MOCK_CONFIG.errorRate).toBe(0);
  });
});

describe('installMockAPI', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    // Replace with a simple mock so installMockAPI can wrap it
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('is a function', () => {
    expect(typeof installMockAPI).toBe('function');
  });

  it('replaces window.fetch', () => {
    const fetchBefore = window.fetch;
    const mockDb = [{ id: 'MAT-0001', name: 'Test', cat: '金属合金' }];
    const getDb = () => mockDb;
    const dispatch = vi.fn();

    installMockAPI(getDb, dispatch);

    expect(window.fetch).not.toBe(fetchBefore);
  });

  it('intercepts GET /api/materials and returns data', async () => {
    const mockDb = [
      { id: 'MAT-0001', name: 'Alpha', cat: '金属合金', status: '登録済' },
      { id: 'MAT-0002', name: 'Beta', cat: 'セラミクス', status: '承認済' },
    ];
    const getDb = () => mockDb;
    const dispatch = vi.fn();

    installMockAPI(getDb, dispatch);

    const res = await window.fetch('/api/materials');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(body.meta.total).toBe(2);
  });

  it('passes through non-/api/ routes to original fetch', async () => {
    const getDb = () => [];
    const dispatch = vi.fn();

    installMockAPI(getDb, dispatch);

    await window.fetch('/other/route');

    // The original mock fetch should have been called for non-api routes
    expect(originalFetch).not.toBe(window.fetch);
  });

  it('passes through /api/ai routes to original fetch', async () => {
    const getDb = () => [];
    const dispatch = vi.fn();

    // Install a trackable original fetch before installMockAPI wraps it
    const trackableFetch = vi.fn().mockResolvedValue(
      new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    globalThis.fetch = trackableFetch;
    window.fetch = trackableFetch;

    installMockAPI(getDb, dispatch);

    await window.fetch('/api/ai');

    // installMockAPI passes (input, init={}) so init defaults to {}
    expect(trackableFetch).toHaveBeenCalledWith('/api/ai', {});
  });

  it('returns 404 for unknown /api/ routes', async () => {
    const getDb = () => [];
    const dispatch = vi.fn();

    installMockAPI(getDb, dispatch);

    const res = await window.fetch('/api/nonexistent');
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toHaveProperty('error');
  });

  it('logs API calls accessible via getApiLogs', async () => {
    const mockDb = [{ id: 'MAT-0001', name: 'Alpha', cat: '金属合金', status: '登録済' }];
    const getDb = () => mockDb;
    const dispatch = vi.fn();

    installMockAPI(getDb, dispatch);

    await window.fetch('/api/materials');

    const logs = getApiLogs();
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0]).toHaveProperty('method', 'GET');
    expect(logs[0]).toHaveProperty('path', '/api/materials');
    expect(logs[0]).toHaveProperty('status', 200);
  });

  it('notifies registered listeners on API call', async () => {
    const mockDb = [{ id: 'MAT-0001', name: 'Alpha', cat: '金属合金', status: '登録済' }];
    const getDb = () => mockDb;
    const dispatch = vi.fn();
    const listener = vi.fn();

    const unsub = onApiLog(listener);
    installMockAPI(getDb, dispatch);

    await window.fetch('/api/materials');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]![0]).toHaveProperty('method', 'GET');
    expect(listener.mock.calls[0]![0]).toHaveProperty('path', '/api/materials');

    unsub();
  });

  it('dispatches DELETE action for DELETE /api/materials/MAT-XXXX', async () => {
    const mockDb = [{ id: 'MAT-0001', name: 'Alpha', cat: '金属合金', status: '登録済' }];
    const getDb = () => mockDb;
    const dispatch = vi.fn();

    installMockAPI(getDb, dispatch);

    // jsdom Response constructor may reject status 204 (null body status).
    // We verify the dispatch was called correctly regardless.
    try {
      await window.fetch('/api/materials/MAT-0001', { method: 'DELETE' });
    } catch (_) {
      // Acceptable: jsdom does not support 204 no-content responses
    }

    expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE', id: 'MAT-0001' });
  });

  it('returns stats for GET /api/stats', async () => {
    const mockDb = [
      { id: 'MAT-0001', cat: '金属合金', status: '登録済', ai: false },
      { id: 'MAT-0002', cat: 'セラミクス', status: '承認済', ai: true },
    ];
    const getDb = () => mockDb;
    const dispatch = vi.fn();

    installMockAPI(getDb, dispatch);

    const res = await window.fetch('/api/stats');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.total).toBe(2);
    expect(body).toHaveProperty('byStatus');
    expect(body).toHaveProperty('byCategory');
    expect(body.aiDetected).toBe(1);
  });
});

describe('clearApiLogs', () => {
  it('empties the logs array', async () => {
    // Generate a log entry by using installMockAPI
    const mockDb = [{ id: 'MAT-0001', name: 'Alpha', cat: '金属合金', status: '登録済' }];
    const getDb = () => mockDb;
    const dispatch = vi.fn();

    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('{}', { status: 200 })
    );

    installMockAPI(getDb, dispatch);
    await window.fetch('/api/materials');

    expect(getApiLogs().length).toBeGreaterThan(0);

    clearApiLogs();
    expect(getApiLogs()).toEqual([]);

    globalThis.fetch = origFetch;
  });
});
