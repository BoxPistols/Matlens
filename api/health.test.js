import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import handler from './health.js';

function mockReq(method = 'GET', headers = {}) {
  return { method, headers, query: {}, url: '/api/health' };
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

describe('GET /api/health', () => {
  const envKeys = [
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'UPSTASH_VECTOR_REST_URL',
    'UPSTASH_VECTOR_REST_TOKEN',
  ];
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
  });

  it('returns 503 degraded when OPENAI_API_KEY is missing', async () => {
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.services.openai).toBe('not_configured');
  });

  it('returns 200 ok when OPENAI_API_KEY is set', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.services.openai).toBe('ok');
  });

  it('reports each service independently', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.UPSTASH_VECTOR_REST_URL = 'https://x.upstash.io';
    process.env.UPSTASH_VECTOR_REST_TOKEN = 't';
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res.body.services.openai).toBe('ok');
    expect(res.body.services.upstashVector).toBe('ok');
    expect(res.body.services.upstashRedis).toBe('not_configured');
    expect(res.body.services.gemini).toBe('not_configured');
  });

  it('accepts GEMINI_API_KEY as alias for gemini', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.GEMINI_API_KEY = 'AI-test';
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(res.body.services.gemini).toBe('ok');
  });

  it('exposes a request id on the response header', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const req = mockReq('GET', { 'x-request-id': 'trace-42' });
    const res = mockRes();
    await handler(req, res);
    expect(res.headers['x-request-id']).toBe('trace-42');
    expect(res.body.requestId).toBe('trace-42');
  });

  it('rejects non-GET methods', async () => {
    const req = mockReq('POST');
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('includes a timestamp', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const req = mockReq();
    const res = mockRes();
    await handler(req, res);
    expect(typeof res.body.timestamp).toBe('string');
    expect(Date.parse(res.body.timestamp)).not.toBeNaN();
  });
});
