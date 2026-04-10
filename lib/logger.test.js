import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { log, maskSensitive } from './logger.js';

describe('maskSensitive', () => {
  it('returns primitives unchanged', () => {
    expect(maskSensitive('hello')).toBe('hello');
    expect(maskSensitive(42)).toBe(42);
    expect(maskSensitive(true)).toBe(true);
    expect(maskSensitive(null)).toBe(null);
    expect(maskSensitive(undefined)).toBe(undefined);
  });

  it('redacts top-level sensitive keys', () => {
    const result = maskSensitive({
      apiKey: 'sk-abc',
      api_key: 'sk-xyz',
      token: 'bearer-123',
      password: 'p@ss',
      secret: 'shh',
      authorization: 'Bearer x',
      Cookie: 'session=1',
      safe: 'visible',
    });
    expect(result.apiKey).toBe('***REDACTED***');
    expect(result.api_key).toBe('***REDACTED***');
    expect(result.token).toBe('***REDACTED***');
    expect(result.password).toBe('***REDACTED***');
    expect(result.secret).toBe('***REDACTED***');
    expect(result.authorization).toBe('***REDACTED***');
    expect(result.Cookie).toBe('***REDACTED***');
    expect(result.safe).toBe('visible');
  });

  it('redacts nested sensitive keys recursively', () => {
    const result = maskSensitive({
      meta: {
        request: {
          headers: { Authorization: 'Bearer x' },
          body: { promptText: 'visible', api_key: 'leak' },
        },
      },
    });
    expect(result.meta.request.headers.Authorization).toBe('***REDACTED***');
    expect(result.meta.request.body.api_key).toBe('***REDACTED***');
    expect(result.meta.request.body.promptText).toBe('visible');
  });

  it('walks arrays', () => {
    const result = maskSensitive([
      { token: 'a' },
      { token: 'b' },
    ]);
    expect(result[0].token).toBe('***REDACTED***');
    expect(result[1].token).toBe('***REDACTED***');
  });
});

describe('log', () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('writes a JSON line to stdout for info', () => {
    log.info('hello', { requestId: 'r1' });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('hello');
    expect(parsed.requestId).toBe('r1');
    expect(typeof parsed.timestamp).toBe('string');
  });

  it('writes errors to stderr', () => {
    log.error('boom', { requestId: 'r2' });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('redacts sensitive metadata before serialising', () => {
    log.info('outbound call', {
      headers: { Authorization: 'Bearer secret' },
    });
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);
    expect(parsed.headers.Authorization).toBe('***REDACTED***');
  });

  it('respects LOG_LEVEL filter', () => {
    const previous = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'warn';
    try {
      log.info('should not appear');
      expect(logSpy).not.toHaveBeenCalled();
      log.warn('should appear');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    } finally {
      process.env.LOG_LEVEL = previous;
    }
  });
});
