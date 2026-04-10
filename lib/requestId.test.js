import { describe, it, expect, vi } from 'vitest';
import { getRequestId, setRequestIdHeader } from './requestId.js';

describe('getRequestId', () => {
  it('uses Vercel-injected x-vercel-id when present', () => {
    expect(getRequestId({ headers: { 'x-vercel-id': 'iad::abc123' } })).toBe('iad::abc123');
  });

  it('falls back to x-request-id', () => {
    expect(getRequestId({ headers: { 'x-request-id': 'client-req-1' } })).toBe('client-req-1');
  });

  it('prefers x-vercel-id over x-request-id when both are present', () => {
    expect(
      getRequestId({ headers: { 'x-vercel-id': 'a', 'x-request-id': 'b' } })
    ).toBe('a');
  });

  it('generates a UUID when neither header is set', () => {
    const id = getRequestId({ headers: {} });
    expect(typeof id).toBe('string');
    // UUID v4 shape
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('handles requests without a headers object', () => {
    const id = getRequestId({});
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('setRequestIdHeader', () => {
  it('writes the id to x-request-id', () => {
    const setHeader = vi.fn();
    setRequestIdHeader({ setHeader }, 'r-123');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'r-123');
  });

  it('is a no-op for objects without setHeader', () => {
    expect(() => setRequestIdHeader({}, 'r-123')).not.toThrow();
    expect(() => setRequestIdHeader(null, 'r-123')).not.toThrow();
  });
});
