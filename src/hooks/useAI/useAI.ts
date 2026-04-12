import { useState, useEffect, useCallback, useRef } from 'react';
import { PROVIDERS, OWN_KEY_STORAGE } from '../../data/constants';
import type {
  AIHook,
  RateInfo,
  AICallError,
  AIErrorCode,
  StreamCallbacks,
} from '../../types';

const isDev = import.meta.env.DEV;

const DEFAULT_SYSTEM =
  'あなたは材料科学の専門家AIアシスタントです。Matlens に組み込まれています。Markdown形式で簡潔・実用的な日本語で回答してください。';

// The user's own OpenAI key lives in sessionStorage (not localStorage) so it
// is scoped to the browser tab and discarded when the tab closes. That gives
// us "persistent enough for reloads" behaviour without leaving a durable
// secret on shared or borrowed devices, and shrinks the blast radius of any
// DOM-level XSS — an attacker who can read sessionStorage can only do so
// from the same tab, not from another open session or a new window.
//
// We also migrate any legacy key from localStorage once so existing users
// don't lose their setting on this upgrade, then wipe the old copy.
function loadOwnKey(): string {
  try {
    const fromSession = sessionStorage.getItem(OWN_KEY_STORAGE);
    if (fromSession) return fromSession;
    const legacy = localStorage.getItem(OWN_KEY_STORAGE);
    if (legacy) {
      sessionStorage.setItem(OWN_KEY_STORAGE, legacy);
      localStorage.removeItem(OWN_KEY_STORAGE);
      return legacy;
    }
    return '';
  } catch {
    return '';
  }
}
function saveOwnKey(k: string): void {
  try {
    if (k) sessionStorage.setItem(OWN_KEY_STORAGE, k);
    else sessionStorage.removeItem(OWN_KEY_STORAGE);
    // Always clean up any stale localStorage copy so a user can't end up
    // with two sources of truth after a partial update.
    localStorage.removeItem(OWN_KEY_STORAGE);
  } catch {
    /* sessionStorage may be disabled in private mode */
  }
}

function devFallback(prompt: string): string {
  const trimmed = prompt.slice(0, 120) + (prompt.length > 120 ? '...' : '');
  return `### ローカル開発モード\n\nAPI サーバー（Vercel Functions）に接続できないため、デモ応答を表示しています。\n\n本番環境（Vercel）へのデプロイ、またはAPIキーを設定すると、AIによる実際の回答が得られます。\n\n---\n\n受信したプロンプト:\n\n> ${trimmed}`;
}

function codeFromStatus(status: number): AIErrorCode {
  if (status === 401 || status === 403) return 'UNAUTHORIZED';
  if (status === 429) return 'RATE_LIMIT';
  if (status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

// ユーザー向けのエラーガイダンスメッセージ
function guidanceForCode(code: AIErrorCode): string {
  switch (code) {
    case 'RATE_LIMIT':
      return 'レート制限に達しました。しばらくお待ちください。';
    case 'UNAUTHORIZED':
      return 'APIキーが無効です。設定を確認してください。';
    case 'NETWORK':
      return 'ネットワークエラーです。接続を確認してください。';
    case 'SERVER_ERROR':
      return 'サーバーエラーが発生しました。しばらく後に再試行してください。';
    case 'TIMEOUT':
      return 'リクエストがタイムアウトしました。';
    default:
      return 'AI リクエストに失敗しました。';
  }
}

export function useAI(): AIHook {
  const [provider, setProvider] = useState<string>('openai-nano');
  const [ownKey, setOwnKeyState] = useState<string>(loadOwnKey);
  const [rateInfo, setRateInfo] = useState<RateInfo>({ remaining: null, limit: null });
  const [lastError, setLastError] = useState<AICallError | null>(null);
  // PROVIDERS is a non-empty constant tuple, so PROVIDERS[0] is always defined.
  // The non-null assertion keeps strict mode quiet without a runtime check.
  const providerDef = PROVIDERS.find(p => p.id === provider) ?? PROVIDERS[0]!;
  const hasOwnKey = !!ownKey;

  // Refs so the latest values are available inside long-running stream reads
  // without forcing the callback to re-create on every state change.
  const providerRef = useRef(provider);
  providerRef.current = provider;
  const ownKeyRef = useRef(ownKey);
  ownKeyRef.current = ownKey;

  useEffect(() => {
    fetch('/api/ai')
      .then(r => r.json())
      .then(d => setRateInfo({ remaining: d.remaining, limit: d.limit }))
      .catch(() => {
        if (isDev) setRateInfo({ remaining: 30, limit: 30 });
      });
  }, []);

  const setOwnKey = useCallback((key: string) => {
    saveOwnKey(key);
    setOwnKeyState(key);
    if (key) setProvider('openai-mini');
    else if (provider === 'openai-mini') setProvider('openai-nano');
  }, [provider]);

  // --- Own-key direct call (OpenAI only, non-streaming) ---
  const callWithOwnKey = useCallback(async (prompt: string, system: string): Promise<string> => {
    const model = providerRef.current === 'openai-mini' ? 'gpt-5.4-mini' : 'gpt-5.4-nano';
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownKeyRef.current}`,
        },
        body: JSON.stringify({
          model,
          max_completion_tokens: 1000,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) {
        const code = codeFromStatus(res.status);
        setLastError({ code, message: guidanceForCode(code) });
        return guidanceForCode(code);
      }
      const d = await res.json();
      if (d.error) {
        setLastError({ code: 'UNKNOWN', message: d.error.message });
        return guidanceForCode('UNKNOWN');
      }
      setLastError(null);
      return d.choices?.[0]?.message?.content || '応答を取得できませんでした。';
    } catch {
      setLastError({ code: 'NETWORK', message: guidanceForCode('NETWORK') });
      return guidanceForCode('NETWORK');
    }
  }, []);

  // --- Server-proxy non-streaming call ---
  const call = useCallback(async (prompt: string, system?: string): Promise<string> => {
    const sys = system || DEFAULT_SYSTEM;

    if (hasOwnKey && (providerRef.current === 'openai-mini' || providerRef.current === 'openai-nano')) {
      return callWithOwnKey(prompt, sys);
    }

    const effectiveProvider = providerRef.current === 'gemini-flash' ? 'gemini' : providerRef.current;
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: effectiveProvider, prompt, system }),
      });
      const d = await res.json();
      if (d.remaining !== undefined) setRateInfo({ remaining: d.remaining, limit: d.limit });
      if (d.error) {
        const code: AIErrorCode = d.code || codeFromStatus(res.status);
        setLastError({ code, message: guidanceForCode(code) });
        if (isDev) return devFallback(prompt);
        return guidanceForCode(code);
      }
      setLastError(null);
      return d.text || '応答を取得できませんでした。';
    } catch {
      setLastError({ code: 'NETWORK', message: guidanceForCode('NETWORK') });
      if (isDev) return devFallback(prompt);
      return guidanceForCode('NETWORK');
    }
  }, [hasOwnKey, callWithOwnKey]);

  // --- Server-proxy streaming call ---
  // Reads `/api/ai?stream=1` text/plain stream and invokes onChunk() per chunk.
  // Falls back to the non-streaming `call` path when an own key is in use
  // (own key routes directly to OpenAI, which would need its own stream path).
  const callStream = useCallback(async (
    prompt: string,
    callbacks: StreamCallbacks,
    system?: string,
  ): Promise<string> => {
    const sys = system || DEFAULT_SYSTEM;

    // Own-key path: not yet streamed — fall back to non-streaming call and
    // emit the full result as a single chunk for callback parity.
    if (hasOwnKey && (providerRef.current === 'openai-mini' || providerRef.current === 'openai-nano')) {
      const text = await callWithOwnKey(prompt, sys);
      if (text) callbacks.onChunk(text);
      return text;
    }

    const effectiveProvider = providerRef.current === 'gemini-flash' ? 'gemini' : providerRef.current;

    try {
      const res = await fetch('/api/ai?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: effectiveProvider, prompt, system }),
        signal: callbacks.signal,
      });

      if (!res.ok) {
        // Error path — server returned JSON error instead of a stream.
        let errBody: { error?: string; code?: AIErrorCode } = {};
        try {
          errBody = await res.json();
        } catch {
          // Body was empty or malformed; fall back to the default.
        }
        const code: AIErrorCode = errBody.code || codeFromStatus(res.status);
        setLastError({ code, message: guidanceForCode(code) });
        const fallback = isDev ? devFallback(prompt) : guidanceForCode(code);
        callbacks.onChunk(fallback);
        return fallback;
      }

      // Rate limit info comes via headers on the streaming path.
      const remaining = Number(res.headers.get('X-RateLimit-Remaining'));
      const limit = Number(res.headers.get('X-RateLimit-Limit'));
      if (!Number.isNaN(remaining) && !Number.isNaN(limit) && limit > 0) {
        setRateInfo({ remaining, limit });
      }

      if (!res.body) {
        setLastError({ code: 'UNKNOWN', message: 'Empty response body' });
        return '';
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          full += chunk;
          callbacks.onChunk(chunk);
        }
      }
      const tail = decoder.decode();
      if (tail) {
        full += tail;
        callbacks.onChunk(tail);
      }
      setLastError(null);
      return full;
    } catch (e) {
      const err = e as Error;
      // AbortError is not an actual error — the caller cancelled.
      if (err.name === 'AbortError') {
        setLastError({ code: 'TIMEOUT', message: 'Request aborted' });
        return '';
      }
      setLastError({ code: 'NETWORK', message: guidanceForCode('NETWORK') });
      const fallback = isDev ? devFallback(prompt) : guidanceForCode('NETWORK');
      callbacks.onChunk(fallback);
      return fallback;
    }
  }, [hasOwnKey, callWithOwnKey]);

  return {
    call,
    callStream,
    provider,
    setProvider,
    providerDef,
    providers: PROVIDERS,
    hasOwnKey,
    ownKey,
    setOwnKey,
    rateInfo,
    lastError,
  };
}
