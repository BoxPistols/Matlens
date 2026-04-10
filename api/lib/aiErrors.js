// Classify AI SDK / fetch errors into stable error codes the UI can switch on.
//
// Codes:
//   UNAUTHORIZED   — 401 / missing or invalid key
//   RATE_LIMIT     — 429 / quota exceeded
//   SERVER_ERROR   — 5xx upstream
//   TIMEOUT        — AbortError / explicit timeout
//   NETWORK        — fetch failed (DNS, TLS, no route)
//   UNKNOWN        — fallthrough

import { APICallError, LoadAPIKeyError, RetryError } from 'ai';

export function classifyAIError(e) {
  if (!e) return { code: 'UNKNOWN', message: 'Unknown error' };

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
    return { code: 'UNKNOWN', message: e.message || 'API呼び出しエラー', status };
  }
  if (e instanceof RetryError) {
    return classifyAIError(e.lastError ?? e.errors?.[e.errors.length - 1]);
  }

  // Bare fetch failure (DNS, socket, TLS)
  if (e.name === 'TypeError' && /fetch/i.test(e.message ?? '')) {
    return { code: 'NETWORK', message: 'ネットワークエラーが発生しました' };
  }

  return { code: 'UNKNOWN', message: e.message || String(e) };
}
