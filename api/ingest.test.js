import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the rag module so we never actually touch Upstash or OpenAI during
// tests. The handler talks to ingestMaterials() via the mocked module.
vi.mock('../lib/rag.js', () => ({
  ingestMaterials: vi.fn().mockResolvedValue(3),
}));

// Import the handler *after* the mock so it picks up the stub.
import handler from './ingest.js';
import { ingestMaterials } from '../lib/rag.js';

function mockReq({
  method = 'POST',
  body = {},
  headers = { 'content-type': 'application/json' },
  url = '/api/ingest',
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

const VALID_MATERIAL = {
  id: 'MAT-0001',
  name: 'SUS316L',
  cat: '金属合金',
  comp: 'Fe-17Cr-12Ni-2Mo',
  memo: '',
  hv: 186,
  ts: 520,
  el: 193,
  dn: 7.98,
};

describe('POST /api/ingest', () => {
  const envKeys = ['OPENAI_API_KEY', 'UPSTASH_VECTOR_REST_URL', 'UPSTASH_VECTOR_REST_TOKEN'];
  const saved = {};

  beforeEach(() => {
    for (const k of envKeys) {
      saved[k] = process.env[k];
    }
    // Default: every env is set so the happy path runs.
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.UPSTASH_VECTOR_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_VECTOR_REST_TOKEN = 'test-token';
    vi.mocked(ingestMaterials).mockClear();
    vi.mocked(ingestMaterials).mockResolvedValue(3);
  });
  afterEach(() => {
    for (const k of envKeys) {
      if (saved[k] !== undefined) process.env[k] = saved[k];
      else delete process.env[k];
    }
  });

  it('ingests valid materials and returns the count', async () => {
    const req = mockReq({ body: { materials: [VALID_MATERIAL] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.count).toBe(3);
    expect(ingestMaterials).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const req = mockReq({ body: { materials: [VALID_MATERIAL] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/OPENAI_API_KEY/);
  });

  it('returns 500 when UPSTASH_VECTOR_REST_URL is missing', async () => {
    delete process.env.UPSTASH_VECTOR_REST_URL;
    const req = mockReq({ body: { materials: [VALID_MATERIAL] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/UPSTASH_VECTOR_REST_URL/);
  });

  it('rejects non-JSON content-type with 415', async () => {
    const req = mockReq({
      headers: { 'content-type': 'text/plain' },
      body: { materials: [VALID_MATERIAL] },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(415);
  });

  it('rejects missing materials array with 400', async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects empty materials array with 400', async () => {
    const req = mockReq({ body: { materials: [] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects materials missing an id with 400', async () => {
    const req = mockReq({ body: { materials: [{ ...VALID_MATERIAL, id: '' }] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects non-finite numeric fields with 400', async () => {
    const req = mockReq({ body: { materials: [{ ...VALID_MATERIAL, hv: NaN }] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects disallowed origins with 403', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', origin: 'https://evil.example.com' },
      body: { materials: [VALID_MATERIAL] },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it('echoes request id header', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', 'x-request-id': 'trace-77' },
      body: { materials: [VALID_MATERIAL] },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.headers['x-request-id']).toBe('trace-77');
  });

  it('returns 500 with a generic message when ingestMaterials throws', async () => {
    vi.mocked(ingestMaterials).mockRejectedValueOnce(new Error('upstash connection refused'));
    const req = mockReq({ body: { materials: [VALID_MATERIAL] } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    // Generic message only — the internal error message must not leak.
    expect(res.body.error).toBe('インジェスト中にエラーが発生しました');
    expect(res.body.error).not.toMatch(/upstash/);
  });

  it('rejects non-POST methods', async () => {
    const req = mockReq({ method: 'GET' });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });
});
