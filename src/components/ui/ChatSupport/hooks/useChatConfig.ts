// Chat configuration state — the user-facing settings that survive
// across sessions: which model to call, the user's own API key (if any),
// the panel layout mode, and the sidebar width when in sidebar mode.
//
// Response mode (FAQ / AI) is intentionally *not* stored here. It is
// derived from `apiKey` presence in `useChatMessage`: no key → shared
// pool via /api/ai proxy (FAQ-first layering for fast local answers),
// with key → direct provider with FAQ fallback on AI failure. Adding an
// explicit mode toggle on top would just duplicate what `apiKey` already
// encodes.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Provider } from '../chatSupportTypes'
import { CHAT_STORAGE_KEY, MODELS } from '../chatSupportConstants'
import { SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH } from './useResize'

const SETTINGS_KEY = `${CHAT_STORAGE_KEY}-settings`
const LAYOUT_KEY = `${CHAT_STORAGE_KEY}-layout`
const SIDEBAR_WIDTH_KEY = `${CHAT_STORAGE_KEY}-sidebar-width`

// ── Layout mode ──────────────────────────────────────────────────────
//
// `closed`   — Panel hidden, only the FAB is visible.
// `floating` — Classic bottom-right floating panel, drag-resizable on
//              the top / left / top-left edges.
// `sidebar`  — Fixed right-edge panel, drag-resizable on the left edge.
//              Useful for reading docs while chatting.
export type LayoutMode = 'closed' | 'floating' | 'sidebar'

const DEFAULT_SIDEBAR_WIDTH = 400

interface PersistedSettings {
  provider: Provider
  key: string
}

const VALID_PROVIDERS: readonly Provider[] = MODELS.map(m => m.value)

function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { provider: 'openai-nano', key: '' }
    const parsed = JSON.parse(raw) as { provider?: string; key?: string }
    // Pre-refactor storage used `'openai'` to mean "the OpenAI family"
    // (i.e. nano). Under the new enum `'openai'` is specifically the
    // full gpt-5.4 which requires a user key — silently promoting a
    // legacy `'openai'` value would strand users on a locked model.
    let provider: Provider = 'openai-nano'
    if (parsed.provider === 'openai') {
      provider = 'openai-nano'
    } else if (
      typeof parsed.provider === 'string' &&
      (VALID_PROVIDERS as readonly string[]).includes(parsed.provider)
    ) {
      provider = parsed.provider as Provider
    }
    return { provider, key: typeof parsed.key === 'string' ? parsed.key : '' }
  } catch {
    localStorage.removeItem(SETTINGS_KEY)
    return { provider: 'openai-nano', key: '' }
  }
}

function saveSettings(settings: PersistedSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* noop */
  }
}

function loadLayout(): LayoutMode {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY)
    if (raw === 'sidebar' || raw === 'floating' || raw === 'closed') return raw
  } catch {
    /* fall through */
  }
  return 'closed'
}

function loadSidebarWidth(): number {
  try {
    const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY)
    if (!raw) return DEFAULT_SIDEBAR_WIDTH
    const n = Number.parseInt(raw, 10)
    if (Number.isFinite(n) && n >= SIDEBAR_MIN_WIDTH && n <= SIDEBAR_MAX_WIDTH) {
      return n
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_SIDEBAR_WIDTH
}

export interface UseChatConfigResult {
  provider: Provider
  setProvider: (p: Provider) => void
  apiKey: string
  setApiKey: (k: string) => void
  hasUserKey: boolean
  layoutMode: LayoutMode
  setLayoutMode: (m: LayoutMode) => void
  sidebarWidth: number
  setSidebarWidth: (w: number) => void
}

export function useChatConfig(): UseChatConfigResult {
  const initial = useRef(loadSettings())
  const [provider, setProviderState] = useState<Provider>(
    initial.current.provider,
  )
  const [apiKey, setApiKeyState] = useState(initial.current.key)
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(loadLayout)
  const [sidebarWidth, setSidebarWidthState] = useState<number>(loadSidebarWidth)

  useEffect(() => {
    saveSettings({ provider, key: apiKey })
  }, [provider, apiKey])

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, layoutMode)
    } catch {
      /* noop */
    }
  }, [layoutMode])

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth))
    } catch {
      /* noop */
    }
  }, [sidebarWidth])

  // Auto-downgrade to nano if the user selected a requires-user-key
  // model and then cleared their key — otherwise the next send throws
  // `AiUserKeyRequiredError` on every attempt.
  useEffect(() => {
    if (!apiKey) {
      const model = MODELS.find(m => m.value === provider)
      if (model?.requiresUserKey) setProviderState('openai-nano')
    }
  }, [apiKey, provider])

  const setProvider = useCallback((p: Provider) => setProviderState(p), [])
  const setApiKey = useCallback((k: string) => setApiKeyState(k), [])
  const setLayoutMode = useCallback(
    (m: LayoutMode) => setLayoutModeState(m),
    [],
  )
  const setSidebarWidth = useCallback(
    (w: number) => setSidebarWidthState(w),
    [],
  )

  return {
    provider,
    setProvider,
    apiKey,
    setApiKey,
    hasUserKey: apiKey.trim().length > 0,
    layoutMode,
    setLayoutMode,
    sidebarWidth,
    setSidebarWidth,
  }
}
