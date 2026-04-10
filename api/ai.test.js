import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the AI SDK so we never hit OpenAI / Gemini during tests. We also
// export stub error classes so classifyAIError's `instanceof` checks don't
// crash. The factory is hoisted to the top of the file by Vitest, so the
// classes must be declared *inside* the factory (referencing hoisted vars
// would throw "Cannot access X before initialization").
vi.mock('ai', () => {
  class StubAPICallError extends Error {
    constructor(message = 'stub', statusCode) {
      super(message);
      this.name = 'APICallError';
      this.statusCode = statusCode;
    }
  }
  class StubLoadAPIKeyError extends Error {}
  class StubRetryError extends Error {}
  return {
    generateText: vi.fn().mockResolvedValue({ text: 'mock response' }),
    streamText: vi.fn(),
    APICallError: StubAPICallError,
    LoadAPIKeyError: StubLoadAPIKeyError,
    RetryError: StubRetryError,
  };
});
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => ({ modelId: 'mock-openai' })),
}));
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({ modelId: 'mock-gemini' })),
}));

// Mock the rate limiter so every request is allowed by default.
vi.mock('../lib/ratelimit.js', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 29, limit: 30 }),
  getRemainingQuota: vi.fn().mockResolvedValue({ remaining: 29, limit: 30 }),
}));

import handler from './ai.js';
import { generateText } from 'ai';
import { checkRateLimit } from '../lib/ratelimit.js';

function mockReq({
  method = 'POST',
  body = {},
  headers = { 'content-type': 'application/json' },
  url = '/api/ai',
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

describe('POST /api/ai', () => {
  const envKeys = ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'];
  const saved = {};

  beforeEach(() => {
    for (const k of envKeys) {
      saved[k] = process.env[k];
    }
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'AI-test';
    vi.mocked(generateText).mockClear();
    vi.mocked(checkRateLimit).mockClear();
    vi.mocked(generateText).mockResolvedValue({ text: 'mock response' });
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, remaining: 29, limit: 30 });
  });
  afterEach(() => {
    for (const k of envKeys) {
      if (saved[k] !== undefined) process.env[k] = saved[k];
      else delete process.env[k];
    }
  });

  it('returns the generated text for a valid openai request', async () => {
    const req = mockReq({ body: { provider: 'openai-nano', prompt: 'hello' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBe('mock response');
    expect(res.body.remaining).toBe(29);
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it('accepts gemini as provider', async () => {
    const req = mockReq({ body: { provider: 'gemini', prompt: 'hello' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  it('rejects non-JSON content-type with 415', async () => {
    const req = mockReq({
      headers: { 'content-type': 'text/plain' },
      body: { provider: 'openai-nano', prompt: 'hello' },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(415);
  });

  it('rejects unknown provider with 400', async () => {
    const req = mockReq({ body: { provider: 'claude', prompt: 'hello' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid provider/);
  });

  it('rejects empty prompt with 400', async () => {
    const req = mockReq({ body: { provider: 'openai-nano', prompt: '' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects prompt over 4000 chars with 400', async () => {
    const req = mockReq({ body: { provider: 'openai-nano', prompt: 'a'.repeat(5000) } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/too long/);
  });

  it('rejects prompt containing a null byte with 400', async () => {
    const req = mockReq({ body: { provider: 'openai-nano', prompt: 'hello\x00world' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/null byte/);
  });

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, limit: 30 });
    const req = mockReq({ body: { provider: 'openai-nano', prompt: 'hello' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(429);
    expect(res.body.code).toBe('RATE_LIMIT');
  });

  it('returns 500 with UNAUTHORIZED when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const req = mockReq({ body: { provider: 'openai-nano', prompt: 'hello' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('GET returns rate limit status', async () => {
    const req = mockReq({ method: 'GET', body: undefined });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.remaining).toBe(29);
    expect(res.body.limit).toBe(30);
  });

  it('handles OPTIONS preflight', async () => {
    const req = mockReq({ method: 'OPTIONS' });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  it('rejects disallowed origins with 403', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', origin: 'https://evil.example.com' },
      body: { provider: 'openai-nano', prompt: 'hello' },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it('echoes request id header', async () => {
    const req = mockReq({
      headers: { 'content-type': 'application/json', 'x-request-id': 'trace-1' },
      body: { provider: 'openai-nano', prompt: 'hello' },
    });
    const res = mockRes();
    await handler(req, res);
    expect(res.headers['x-request-id']).toBe('trace-1');
  });

  it('does not leak upstream error messages on 502', async () => {
    vi.mocked(generateText).mockRejectedValueOnce(
      Object.assign(new Error('OpenAI rate limit with secret token sk-leaked'), { status: 429 })
    );
    const req = mockReq({ body: { provider: 'openai-nano', prompt: 'hello' } });
    const res = mockRes();
    await handler(req, res);
    expect(res.statusCode).toBe(502);
    // The classified error message is what gets returned, not the raw
    // Error string — it should not contain the stray token from the mock.
    expect(res.body.error).not.toMatch(/sk-leaked/);
  });
});
