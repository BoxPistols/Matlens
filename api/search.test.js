import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from './search.js';

function mockReq({
  method = 'POST',
  body = {},
  headers = { 'content-type': 'application/json' },
  url = '/api/search',
} = {}) {
  return { method, headers, body, query: {}, url };
}

function mockRes() {
  const headers = {};
  const res = {
    statusCode: 200,
    body: null,
    headers,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end() { return this; },
  };
  return res;
}

const SEED_DB = [
  {
    id: 'MAT-0001',
    name: 'SUS304',
    cat: '金属合金',
    comp: 'Fe-18Cr-8Ni',
    hv: 170,
    ts: 520,
    memo: '汎用ステンレス',
  },
  {
    id: 'MAT-0002',
    name: 'Ti-6Al-4V',
    cat: '金属合金',
    comp: 'Ti-6Al-4V',
    hv: 340,
    ts: 950,
    memo: '航空宇宙用途',
  },
  {
    id: 'MAT-0003',
    name: 'アルミナ',
    cat: 'セラミクス',
    comp: 'Al2O3',
    hv: 1800,
    ts: 250,
    memo: '耐熱セラミック',
  },
];

describe('POST /api/search', () => {
  const envKeys = ['UPSTASH_VECTOR_REST_URL', 'UPSTASH_VECTOR_REST_TOKEN', 'OPENAI_API_KEY'];
  const saved = {};

  beforeEach(() => {
    for (const k of envKeys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });
  afterEach(() => {
    for (const k of envKeys) {
      if (saved[k] !== undefined) process.env[k] = saved[k];
      else delete process.env[k];
    }
    vi.restoreAllMocks();
  });

  it('rejects non-JSON content-type with 415', async () => {
    const req = mockReq({
      headers: { 'content-type': 'text/plain' },
      body: { query: 'test', db: SEED_DB },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(415);
  });

  it('rejects empty query with 400', async () => {
    const req = mockReq({ body: { db: SEED_DB } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects oversized query with 400', async () => {
    const req = mockReq({ body: { query: 'a'.repeat(1000), db: SEED_DB } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects out-of-range topK with 400', async () => {
    const req = mockReq({ body: { query: 'SUS', k: 999, db: SEED_DB } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('falls back to keyword search when Upstash is not configured', async () => {
    const req = mockReq({ body: { query: 'SUS', db: SEED_DB } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.engine).toBe('keyword');
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0].id).toBe('MAT-0001');
  });

  it('returns empty results when neither Upstash nor db is provided', async () => {
    const req = mockReq({ body: { query: 'SUS' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.engine).toBe('none');
    expect(res.body.results).toEqual([]);
  });

  it('rejects disallowed origins with 403', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', origin: 'https://evil.example.com' },
      body: { query: 'SUS', db: SEED_DB },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it('echoes request id header', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', 'x-request-id': 'trace-99' },
      body: { query: 'SUS', db: SEED_DB },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.headers['x-request-id']).toBe('trace-99');
  });

  it('handles OPTIONS preflight', async () => {
    const req = mockReq({ method: 'OPTIONS' });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  it('rejects non-POST methods', async () => {
    const req = mockReq({ method: 'DELETE' });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('caps db array size so huge bodies cannot exhaust memory', async () => {
    const hugeDb = Array.from({ length: 5000 }, (_, i) => ({
      id: `MAT-${String(i).padStart(4, '0')}`,
      name: 'Noise',
      cat: '金属合金',
      comp: 'x',
      hv: 0,
      ts: 0,
      memo: '',
    }));
    const req = mockReq({ body: { query: 'SUS', db: hugeDb } });
    const res = mockRes();
    await handler(req, res);
    // The handler slices the db to 1000 rows internally; this just verifies
    // the request doesn't blow up.
    expect(res.statusCode).toBe(200);
  });
});
