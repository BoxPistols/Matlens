// Chat message state + persistence.
//
// All the transient-but-sticky state the ChatSupport panel needs:
//   - The rolling log of user / assistant messages
//   - Auto-persist to localStorage (clears if the tab writes invalid JSON)
//   - Trim to MAX_MESSAGES so a long session doesn't blow the quota
//   - Export / clear utilities for the header toolbar
//
// Keeping this in a hook means the main component only handles dispatch,
// not storage wiring — and it lets the tests instantiate the hook with
// a fake localStorage to cover edge cases without rendering React.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../chatSupportTypes'
import { CHAT_STORAGE_KEY, MAX_MESSAGES } from '../chatSupportConstants'

// Module-scope counter so every generated id is unique even across the
// short window when React strict mode double-invokes the component.
let messageIdCounter = 0
const genId = () => `msg-${Date.now()}-${++messageIdCounter}`

function loadInitial(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : []
  } catch {
    // Defensive: corrupt JSON from a previous crash or an interrupted
    // write. Wipe it so the next save doesn't pile on top of garbage.
    localStorage.removeItem(CHAT_STORAGE_KEY)
    return []
  }
}

function persist(messages: ChatMessage[]) {
  try {
    const trimmed =
      messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // QuotaExceededError or a host that disallows storage (private
    // mode on some browsers). We'd rather lose history than crash the
    // panel, so swallow.
    localStorage.removeItem(CHAT_STORAGE_KEY)
  }
}

export interface UseChatResult {
  messages: ChatMessage[]
  addMessage: (
    role: ChatMessage['role'],
    content: string,
    source?: ChatMessage['source'],
  ) => void
  clearMessages: () => void
  /** 会話履歴を即ダウンロード (内部 API — 通常は getExportPayload + DownloadPreviewModal を使う) */
  downloadMessages: () => void
  /**
   * エクスポート内容とファイル名を生成して返す (ダウンロードはしない)。
   * 呼出側でプレビューモーダルに渡してから実ダウンロードへ繋げる用途。
   */
  getExportPayload: () => { content: string; filename: string }
  hasMessages: boolean
}

/**
 * Chat log state with auto-persist. The returned callbacks are stable
 * so child components can be wrapped in `memo` without re-rendering on
 * every parent render.
 */
export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>(loadInitial)

  // Keep a ref aligned with state so downloadMessages can read the
  // latest snapshot without being rebuilt whenever a message lands.
  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
    persist(messages)
  }, [messages])

  const addMessage = useCallback(
    (
      role: ChatMessage['role'],
      content: string,
      source?: ChatMessage['source'],
    ) => {
      setMessages(prev => {
        const next: ChatMessage[] = [
          ...prev,
          { id: genId(), role, content, source, timestamp: Date.now() },
        ]
        return next.slice(-MAX_MESSAGES)
      })
    },
    [],
  )

  const clearMessages = useCallback(() => {
    // Native confirm is ugly but it's inside an iframe'd Storybook
    // preview where bringing in a full dialog component is overkill —
    // users are almost always on desktop and the confirm is a 1-tap.
    const ok =
      typeof window === 'undefined' ||
      window.confirm('会話履歴をすべて削除しますか？ この操作は元に戻せません。')
    if (!ok) return
    setMessages([])
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    } catch {
      /* noop */
    }
  }, [])

  /** エクスポートペイロード生成（ダウンロードはしない） */
  const getExportPayload = useCallback(() => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      source: 'matlens-storybook-chatsupport',
      messages: messagesRef.current,
    }
    // ISO date in filename for easy sorting. Colons are illegal on
    // Windows filenames, so strip them.
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    return {
      content: JSON.stringify(snapshot, null, 2),
      filename: `matlens-chat-${timestamp}.json`,
    }
  }, [])

  /**
   * 下位互換用: 即ダウンロード (プレビューなし)。
   * 新しい呼出側は getExportPayload + DownloadPreviewModal を使うことを推奨。
   */
  const downloadMessages = useCallback(() => {
    const { content, filename } = getExportPayload()
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [getExportPayload])

  return {
    messages,
    addMessage,
    clearMessages,
    downloadMessages,
    getExportPayload,
    hasMessages: messages.length > 0,
  }
}
