// Regression tests for the gateway/direct resolver in lib/models.js.
//
// The load-bearing invariant: `detectGatewayMode` and `hasProviderKey`
// must accept the same set of signals. If one of them forgets about a
// signal (e.g. `VERCEL_OIDC_TOKEN`), OIDC-only Vercel deployments will
// silently 500 at the `/api/ai` credential gate even though the gateway
// would have authenticated the request fine.
//
// Because `USE_GATEWAY` is resolved once at module load, each test has
// to use `vi.resetModules()` + a fresh `import('./models.js')` to re-run
// `detectGatewayMode` under the mutated env.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ENV_KEYS = [
  'AI_GATEWAY_API_KEY',
  'AI_GATEWAY_ENABLED',
  'VERCEL_OIDC_TOKEN',
  'OPENAI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'GEMINI_API_KEY',
];

const saved = {};

beforeEach(() => {
  for (const k of ENV_KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  vi.resetModules();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] !== undefined) process.env[k] = saved[k];
    else delete process.env[k];
  }
});

async function loadModels() {
  return await import('./models.js');
}

describe('detectGatewayMode', () => {
  it('is false when no signals are set', async () => {
    const { USE_GATEWAY } = await loadModels();
    expect(USE_GATEWAY).toBe(false);
  });

  it('is true when AI_GATEWAY_API_KEY is set', async () => {
    process.env.AI_GATEWAY_API_KEY = 'gw-test';
    const { USE_GATEWAY } = await loadModels();
    expect(USE_GATEWAY).toBe(true);
  });

  it('is true when VERCEL_OIDC_TOKEN alone is set (recommended Vercel path)', async () => {
    process.env.VERCEL_OIDC_TOKEN = 'oidc-test';
    const { USE_GATEWAY } = await loadModels();
    expect(USE_GATEWAY).toBe(true);
  });

  it('is true when AI_GATEWAY_ENABLED=1 is set without any other signal', async () => {
    process.env.AI_GATEWAY_ENABLED = '1';
    const { USE_GATEWAY } = await loadModels();
    expect(USE_GATEWAY).toBe(true);
  });

  it('is false when AI_GATEWAY_ENABLED=0 overrides a present key', async () => {
    process.env.AI_GATEWAY_API_KEY = 'gw-test';
    process.env.AI_GATEWAY_ENABLED = '0';
    const { USE_GATEWAY } = await loadModels();
    expect(USE_GATEWAY).toBe(false);
  });
});

describe('hasProviderKey', () => {
  // Gateway mode cases — the regression surface for PR #14's OIDC bug.
  it('returns true in gateway mode when AI_GATEWAY_API_KEY is set', async () => {
    process.env.AI_GATEWAY_API_KEY = 'gw-test';
    const { hasProviderKey } = await loadModels();
    expect(hasProviderKey('openai')).toBe(true);
    expect(hasProviderKey('gemini')).toBe(true);
  });

  it('returns true in gateway mode when only VERCEL_OIDC_TOKEN is set', async () => {
    // This is the exact scenario that would have returned 500 on every
    // Vercel production/preview deployment using the recommended OIDC
    // auth path before the fix.
    process.env.VERCEL_OIDC_TOKEN = 'oidc-test';
    const { hasProviderKey } = await loadModels();
    expect(hasProviderKey('openai')).toBe(true);
    expect(hasProviderKey('gemini')).toBe(true);
  });

  it('returns true in gateway mode when only AI_GATEWAY_ENABLED=1 is set', async () => {
    // Operator opt-in for testing the gateway path locally without
    // provisioning a real credential. The flag's entire purpose is
    // defeated if hasProviderKey still demands an API key.
    process.env.AI_GATEWAY_ENABLED = '1';
    const { hasProviderKey } = await loadModels();
    expect(hasProviderKey('openai')).toBe(true);
    expect(hasProviderKey('gemini')).toBe(true);
  });

  // Direct mode cases — each provider needs its own key.
  it('returns true for openai in direct mode when OPENAI_API_KEY is set', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const { hasProviderKey } = await loadModels();
    expect(hasProviderKey('openai')).toBe(true);
    expect(hasProviderKey('gemini')).toBe(false);
  });

  it('returns true for gemini in direct mode when either Google env var is set', async () => {
    process.env.GEMINI_API_KEY = 'gm-test';
    const { hasProviderKey } = await loadModels();
    expect(hasProviderKey('gemini')).toBe(true);
    expect(hasProviderKey('openai')).toBe(false);
  });

  it('returns false in direct mode when no provider keys are set', async () => {
    const { hasProviderKey } = await loadModels();
    expect(hasProviderKey('openai')).toBe(false);
    expect(hasProviderKey('gemini')).toBe(false);
  });
});
