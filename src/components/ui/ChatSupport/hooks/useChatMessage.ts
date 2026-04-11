// handleSend + response-layer routing logic.
//
// Extracting this out of the main ChatSupport container shrinks it to
// little more than state wiring, and lets the tests exercise the routing
// rules (FAQ → Story Guide → AI) without rendering the UI.
//
// The routing order is:
//   1. FAQ fuzzy search (Fuse.js). Cheap, predictable, no quota cost.
//   2. Story Guide lookup when the query is about the current page
//      (keywords like "ガイド", "ヒント", "使い方", …). Also free.
//   3. AI proxy via `callAi` — shared pool when the user has no key,
//      direct provider when they do. Drains the quota chip.
//
// Each layer falls through when it doesn't have a confident answer;
// the last layer (AI) is the only one that can emit typed errors
// (quota, auth, user-key-required, network).

import { useCallback, useState } from 'react'
import type { Provider, RateLimitInfo, StoryContext } from '../chatSupportTypes'
import { searchFaq } from '../faqService'
import { getStoryGuide } from '../storyGuideMap'
import {
  callAi,
  AiQuotaExceededError,
  AiAuthError,
  AiUserKeyRequiredError,
  AiNetworkError,
} from '../chatAiService'
import type { UseChatResult } from './useChat'

// Queries that should be answered out of the Story Guide layer rather
// than full-text FAQ search. The test is "query contains one of these
// substrings" — cheap, and intent-matching is good enough in practice
// because users who want guide output phrase it explicitly.
const GUIDE_QUERY_HINTS = [
  'ガイド',
  'ヒント',
  'tips',
  '使い方',
  '関連',
  '解説',
  'このページ',
  'この画面',
] as const

function isGuideQuery(query: string): boolean {
  return GUIDE_QUERY_HINTS.some(hint => query.includes(hint))
}

function formatGuide(guide: ReturnType<typeof getStoryGuide>): string {
  if (!guide) return ''
  return [
    `**${guide.title}** のガイド:`,
    ...guide.tips.map(t => `- ${t}`),
    guide.codeRef ? `\nコード参照: \`${guide.codeRef}\`` : '',
    guide.relatedStories?.length
      ? `\n関連ストーリー: ${guide.relatedStories.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export interface UseChatMessageOptions {
  provider: Provider
  apiKey: string
  currentStory: StoryContext | null
  chat: UseChatResult
  onOpenSettings: () => void
}

export interface UseChatMessageResult {
  sending: boolean
  rateLimit: RateLimitInfo | null
  send: (rawQuery: string) => Promise<void>
}

export function useChatMessage(opts: UseChatMessageOptions): UseChatMessageResult {
  const { provider, apiKey, currentStory, chat, onOpenSettings } = opts
  const [sending, setSending] = useState(false)
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null)

  const send = useCallback(
    async (rawQuery: string) => {
      const query = rawQuery.trim()
      if (!query || sending) return

      chat.addMessage('user', query)
      setSending(true)

      // ── Layer 1: FAQ (Fuse.js fuzzy search) ────────────────────
      const faq = searchFaq(query)
      if (faq) {
        chat.addMessage('assistant', faq.answer, 'faq')
        setSending(false)
        return
      }

      // ── Layer 2: Story Guide for contextual queries ────────────
      if (currentStory && isGuideQuery(query)) {
        const guide = getStoryGuide(currentStory.title)
        if (guide) {
          chat.addMessage('assistant', formatGuide(guide), 'guide')
          setSending(false)
          return
        }
      }

      // ── Layer 3: AI proxy / direct provider ────────────────────
      try {
        const result = await callAi(query, provider, currentStory, apiKey)
        if (result.rateLimit) setRateLimit(result.rateLimit)
        chat.addMessage('assistant', result.text, 'ai')
      } catch (e) {
        if (e instanceof AiQuotaExceededError) {
          setRateLimit({ remaining: e.remaining, limit: e.limit })
          chat.addMessage(
            'assistant',
            `本日の無料枠（${e.limit} 回/日）を使い切りました。日次リセットは協定世界時 0:00 です。\n\n` +
              `すぐ使いたい場合は右上の ⚙️ から自前の OpenAI / Gemini API キーを設定してください。自前キーでは無制限 + 全モデルが利用可能です。`,
            'ai',
          )
        } else if (e instanceof AiUserKeyRequiredError) {
          chat.addMessage(
            'assistant',
            'このモデルは自前 API キーが必要です。右上 ⚙️ からキーを入力するか、共有プール対応の nano / mini / Gemini に切り替えてください。',
            'ai',
          )
          onOpenSettings()
        } else if (e instanceof AiAuthError) {
          chat.addMessage('assistant', `認証エラー: ${e.message}`, 'ai')
          onOpenSettings()
        } else if (e instanceof AiNetworkError) {
          chat.addMessage(
            'assistant',
            `通信エラー: ${e.message}\n\nFAQ で答えられる質問はオフラインでも動作します。カラー、テーマ、ボタン等のキーワードを試してみてください。`,
            'ai',
          )
        } else {
          chat.addMessage('assistant', `予期しないエラー: ${(e as Error).message}`, 'ai')
        }
      } finally {
        setSending(false)
      }
    },
    [sending, chat, currentStory, provider, apiKey, onOpenSettings],
  )

  return { sending, rateLimit, send }
}
