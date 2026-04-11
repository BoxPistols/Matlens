// AI call layer for ChatSupport.
//
// Two independent call paths:
//
//   1. Shared pool (default) — cross-origin POST to the Matlens main app's
//      `/api/ai` endpoint. The backend owns the provider API key, runs
//      `lib/ratelimit.js` (30 req / IP / day by default) and stamps
//      `X-RateLimit-Remaining` / `X-RateLimit-Limit` on the response so
//      the UI can render a quota chip.
//
//   2. Own key — fully client-side. The browser talks to OpenAI or Google
//      directly using a user-supplied API key. The key never touches our
//      backend, so there's no server-side rate limit and the full-fat
//      `gpt-5.4` model becomes available. This path exists so power users
//      can keep working after they've burned through the shared pool.
//
// Errors are surfaced as typed exception classes so ChatSupport can
// render different CTAs (quota → "try again tomorrow / set own key",
// auth → "check your key", user-key-required → "set own key", network →
// "check connection / fallback to FAQ"). The plain Error fallthrough is
// reserved for truly unexpected failures.

import type { Provider, StoryContext, RateLimitInfo } from './chatSupportTypes'
import { SYSTEM_PROMPT } from './chatSupportConstants'

// Injected at Storybook build time via `.storybook/main.ts` → viteFinal
// define. Falling back to '' makes fetch() a same-origin call, which is
// handy when the main Matlens app itself ever uses this module.
const API_BASE: string =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_MATLENS_API_BASE ?? ''

// ── Typed errors ─────────────────────────────────────────────────────

export class AiQuotaExceededError extends Error {
  readonly remaining: number
  readonly limit: number
  constructor(remaining: number, limit: number) {
    super(`本日の無料枠（${limit} 回/日）を使い切りました`)
    this.name = 'AiQuotaExceededError'
    this.remaining = remaining
    this.limit = limit
  }
}

export class AiAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiAuthError'
  }
}

export class AiUserKeyRequiredError extends Error {
  constructor() {
    super('このモデルは自前 API キーが必要です')
    this.name = 'AiUserKeyRequiredError'
  }
}

export class AiNetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiNetworkError'
  }
}

// ── Result shape ─────────────────────────────────────────────────────

export interface AiResponse {
  text: string
  /** Only populated on the shared-pool path. Own-key calls don't hit the rate limiter. */
  rateLimit?: RateLimitInfo
}

// ── Internal helpers ─────────────────────────────────────────────────

function buildSystemPrompt(storyContext: StoryContext | null): string {
  if (!storyContext) return SYSTEM_PROMPT
  const ctxLines = [
    '',
    '## 現在のコンテキスト',
    `- ストーリー: ${storyContext.title} / ${storyContext.name}`,
    `- 説明: ${storyContext.description || 'なし'}`,
  ]
  return SYSTEM_PROMPT + '\n' + ctxLines.join('\n')
}

function parseRateLimit(res: Response): RateLimitInfo | undefined {
  const remaining = res.headers.get('X-RateLimit-Remaining')
  const limit = res.headers.get('X-RateLimit-Limit')
  if (remaining == null || limit == null) return undefined
  const r = Number.parseInt(remaining, 10)
  const l = Number.parseInt(limit, 10)
  if (!Number.isFinite(r) || !Number.isFinite(l)) return undefined
  return { remaining: r, limit: l }
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

// ── Shared-pool path ─────────────────────────────────────────────────

async function callSharedPool(
  userMessage: string,
  provider: Provider,
  storyContext: StoryContext | null,
): Promise<AiResponse> {
  // Full `gpt-5.4` is a user-key-only model; don't even ask the backend.
  if (provider === 'openai') throw new AiUserKeyRequiredError()

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        prompt: userMessage,
        system: buildSystemPrompt(storyContext),
      }),
      // 45s covers worst-case cold-start + long completion. Anything
      // beyond that is almost certainly a hung connection.
      signal: AbortSignal.timeout(45000),
    })
  } catch (e) {
    throw new AiNetworkError((e as Error).message || 'network error')
  }

  const rateLimit = parseRateLimit(res)

  if (res.status === 429) {
    // Backend may also report quota in the JSON body — prefer headers
    // since they're consistent with the streaming path.
    const body = await safeJson(res)
    throw new AiQuotaExceededError(
      rateLimit?.remaining ?? (body.remaining as number) ?? 0,
      rateLimit?.limit ?? (body.limit as number) ?? 30,
    )
  }
  if (res.status === 401) {
    throw new AiAuthError('API 認証に失敗しました（バックエンド側の鍵設定を確認してください）')
  }
  if (res.status === 403) {
    const body = await safeJson(res)
    if (body.code === 'USER_KEY_REQUIRED') throw new AiUserKeyRequiredError()
    throw new AiAuthError((body.error as string) || 'リクエストが拒否されました')
  }
  if (!res.ok) {
    const body = await safeJson(res)
    throw new Error((body.error as string) || `API エラー (${res.status})`)
  }

  const body = await safeJson(res)
  const text = typeof body.text === 'string' ? body.text : ''
  return { text, rateLimit }
}

// ── Own-key path ─────────────────────────────────────────────────────

function openaiModelIdFor(provider: Provider): string {
  if (provider === 'openai') return 'gpt-5.4'
  if (provider === 'openai-mini') return 'gpt-5.4-mini'
  return 'gpt-5.4-nano'
}

async function callOwnKeyGemini(
  userMessage: string,
  systemPrompt: string,
  apiKey: string,
): Promise<AiResponse> {
  let res: Response
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        }),
        signal: AbortSignal.timeout(45000),
      },
    )
  } catch (e) {
    throw new AiNetworkError((e as Error).message || 'network error')
  }

  if (res.status === 401 || res.status === 403) {
    throw new AiAuthError('Gemini API キーが無効です')
  }
  if (!res.ok) {
    throw new Error(`Gemini API エラー (${res.status})`)
  }

  const data = (await safeJson(res)) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini からの応答を解析できませんでした')
  return { text }
}

async function callOwnKeyOpenAI(
  userMessage: string,
  provider: Provider,
  systemPrompt: string,
  apiKey: string,
): Promise<AiResponse> {
  const model = openaiModelIdFor(provider)
  let res: Response
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_completion_tokens: 1024,
      }),
      signal: AbortSignal.timeout(45000),
    })
  } catch (e) {
    throw new AiNetworkError((e as Error).message || 'network error')
  }

  if (res.status === 401) {
    throw new AiAuthError('OpenAI API キーが無効です')
  }
  if (!res.ok) {
    const body = await safeJson(res)
    const msg = (body.error as { message?: string } | undefined)?.message
    throw new Error(msg || `OpenAI API エラー (${res.status})`)
  }

  const data = (await safeJson(res)) as {
    choices?: { message?: { content?: string } }[]
  }
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI からの応答を解析できませんでした')
  return { text }
}

async function callOwnKey(
  userMessage: string,
  provider: Provider,
  storyContext: StoryContext | null,
  apiKey: string,
): Promise<AiResponse> {
  const systemPrompt = buildSystemPrompt(storyContext)
  if (provider === 'gemini') {
    return callOwnKeyGemini(userMessage, systemPrompt, apiKey)
  }
  return callOwnKeyOpenAI(userMessage, provider, systemPrompt, apiKey)
}

// ── Public entry point ───────────────────────────────────────────────

/**
 * Dispatch a chat turn to the appropriate path based on whether the user
 * has supplied their own API key. Throws typed errors for classified
 * failures; ChatSupport matches on instanceof to render targeted CTAs.
 */
export async function callAi(
  userMessage: string,
  provider: Provider,
  storyContext: StoryContext | null,
  apiKey: string,
): Promise<AiResponse> {
  const hasUserKey = apiKey.trim().length > 0
  if (hasUserKey) {
    return callOwnKey(userMessage, provider, storyContext, apiKey)
  }
  return callSharedPool(userMessage, provider, storyContext)
}
