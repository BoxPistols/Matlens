// Classify AI SDK / fetch errors into stable error codes the UI can switch on.
//
// Codes:
//   UNAUTHORIZED   — 401 / missing or invalid key
//   RATE_LIMIT     — 429 / quota exceeded
//   SERVER_ERROR   — 5xx upstream
//   TIMEOUT        — AbortError / explicit timeout
//   NETWORK        — fetch failed (DNS, TLS, no route)
//   UNKNOWN        — fallthrough
//
// The returned `message` is user-facing — it's always a fixed Japanese
// string so we never leak upstream provider error text to the client
// (which can contain tokens, request ids, or other sensitive signals).
// The raw error should be logged server-side via the logger with the
// request id so operators can still correlate failures.

import { APICallError, LoadAPIKeyError, RetryError } from 'ai';

// Generic fallback that is safe to surface to end users.
const GENERIC_MESSAGE = 'AIプロバイダーで問題が発生しました。しばらくしてから再度お試しください。';

export function classifyAIError(e) {
  if (!e) return { code: 'UNKNOWN', message: GENERIC_MESSAGE };

  // Abort / timeout
  if (e.name === 'AbortError' || e.name === 'TimeoutError') {
    return { code: 'TIMEOUT', message: 'リクエストがタイムアウトしました' };
  }

  // AI SDK typed errors
  if (e instanceof LoadAPIKeyError) {
    return { code: 'UNAUTHORIZED', message: 'APIキーが読み込めませんでした' };
  }
  if (e instanceof APICallError) {
    const status = e.statusCode;
    if (status === 401 || status === 403) {
      return { code: 'UNAUTHORIZED', message: 'APIキーが無効です', status };
    }
    if (status === 429) {
      return { code: 'RATE_LIMIT', message: 'プロバイダー側の利用上限に達しました', status };
    }
    if (status && status >= 500) {
      return { code: 'SERVER_ERROR', message: 'AIプロバイダーで一時的な障害が発生しています', status };
    }
    // Intentionally do NOT include e.message here — upstream errors
    // sometimes echo the request payload (including auth headers in older
    // SDKs). Use a fixed string and rely on server-side logs for detail.
    return { code: 'UNKNOWN', message: GENERIC_MESSAGE, status };
  }
  if (e instanceof RetryError) {
    return classifyAIError(e.lastError ?? e.errors?.[e.errors.length - 1]);
  }

  // Bare fetch failure (DNS, socket, TLS)
  if (e.name === 'TypeError' && /fetch/i.test(e.message ?? '')) {
    return { code: 'NETWORK', message: 'ネットワークエラーが発生しました' };
  }

  // Fallthrough: any other error becomes UNKNOWN with the generic message.
  // Never echo e.message — it may contain sensitive tokens (see
  // `ai.test.js > does not leak upstream error messages`).
  return { code: 'UNKNOWN', message: GENERIC_MESSAGE };
}
