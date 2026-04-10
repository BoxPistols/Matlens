import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isOriginAllowed, applyCors } from './cors.js';

describe('isOriginAllowed', () => {
  const originalEnv = process.env.ALLOWED_ORIGINS;
  afterEach(() => {
    process.env.ALLOWED_ORIGINS = originalEnv;
  });

  it('allows matlens production domain', () => {
    expect(isOriginAllowed('https://matlens.vercel.app')).toBe(true);
  });

  it('allows matlens preview deployments', () => {
    expect(isOriginAllowed('https://matlens-git-feat-foo.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://matlens-abc123xyz.vercel.app')).toBe(true);
  });

  it('allows matlens-storybook domains', () => {
    expect(isOriginAllowed('https://matlens-storybook.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://matlens-storybook-git-main.vercel.app')).toBe(true);
  });

  it('allows localhost with any port', () => {
    expect(isOriginAllowed('http://localhost')).toBe(true);
    expect(isOriginAllowed('http://localhost:5173')).toBe(true);
    expect(isOriginAllowed('http://localhost:3000')).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:8080')).toBe(true);
  });

  it('rejects arbitrary third-party origins', () => {
    expect(isOriginAllowed('https://evil.example.com')).toBe(false);
    expect(isOriginAllowed('https://matlens.evil.com')).toBe(false);
    expect(isOriginAllowed('https://fake-matlens.vercel.app.evil.com')).toBe(false);
  });

  it('rejects http://matlens.vercel.app (must be https)', () => {
    expect(isOriginAllowed('http://matlens.vercel.app')).toBe(false);
  });

  it('returns true for missing origin (same-origin / non-browser)', () => {
    expect(isOriginAllowed(undefined)).toBe(true);
    expect(isOriginAllowed('')).toBe(true);
    expect(isOriginAllowed(null)).toBe(true);
  });

  it('honors the ALLOWED_ORIGINS env var', () => {
    process.env.ALLOWED_ORIGINS = 'https://staging.example.com,https://demo.example.com';
    expect(isOriginAllowed('https://staging.example.com')).toBe(true);
    expect(isOriginAllowed('https://demo.example.com')).toBe(true);
    expect(isOriginAllowed('https://other.example.com')).toBe(false);
  });
});

describe('applyCors', () => {
  // Minimal fake res that records headers
  function makeRes() {
    const headers = {};
    return {
      headers,
      setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    };
  }

  it('echoes allowed origin and sets Vary: Origin', () => {
    const res = makeRes();
    const allowed = applyCors({ headers: { origin: 'http://localhost:5173' } }, res);
    expect(allowed).toBe(true);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['vary']).toBe('Origin');
  });

  it('does not set Allow-Origin when origin is rejected', () => {
    const res = makeRes();
    const allowed = applyCors({ headers: { origin: 'https://evil.com' } }, res);
    expect(allowed).toBe(false);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('always sets Allow-Methods and Allow-Headers', () => {
    const res = makeRes();
    applyCors({ headers: { origin: 'https://matlens.vercel.app' } }, res);
    expect(res.headers['access-control-allow-methods']).toContain('POST');
    expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
  });

  it('sets a reasonable Access-Control-Max-Age', () => {
    const res = makeRes();
    applyCors({ headers: { origin: 'https://matlens.vercel.app' } }, res);
    expect(Number(res.headers['access-control-max-age'])).toBeGreaterThan(0);
  });

  it('returns true for same-origin requests without setting Allow-Origin', () => {
    const res = makeRes();
    const allowed = applyCors({ headers: {} }, res);
    expect(allowed).toBe(true);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
