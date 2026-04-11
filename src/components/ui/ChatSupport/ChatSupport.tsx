import React from 'react'
import type {
  ChatMessage,
  Provider,
  RateLimitInfo,
  StoryContext,
} from './chatSupportTypes'
import {
  WELCOME_MESSAGE,
  MAX_MESSAGES,
  CHAT_STORAGE_KEY,
  QUICK_SUGGESTIONS,
  MODELS,
} from './chatSupportConstants'
import { searchFaq } from './faqDatabase'
import { getStoryGuide } from './storyGuideMap'
import {
  callAi,
  AiQuotaExceededError,
  AiAuthError,
  AiUserKeyRequiredError,
  AiNetworkError,
} from './chatAiService'
import { CodeBlock } from './CodeBlock'
import { isSubmitShortcut, submitShortcutLabel } from '../../../utils/keyboard'

// Valid `Provider` values — used to clean up old localStorage entries that
// were stored under the pre-refactor `'openai' | 'gemini'` type.
const VALID_PROVIDERS: readonly Provider[] = [
  'openai-nano',
  'openai-mini',
  'openai',
  'gemini',
] as const

interface ChatSupportProps {
  currentStory: StoryContext | null
}

let messageIdCounter = 0
const genId = () => `msg-${++messageIdCounter}`

function renderContent(text: string) {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/)
      if (match) return <CodeBlock key={i} language={match[1] ?? ''} code={(match[2] ?? '').trim()} />
      return <CodeBlock key={i} code={part.replace(/```/g, '').trim()} />
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            padding: '1px 5px',
            borderRadius: 3,
            background: 'var(--bg-raised)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9em',
            color: 'var(--accent)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part.split('\n').map((line, j) => (
      <React.Fragment key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line.replace(/\*\*(.+?)\*\*/g, '⌘$1⌘').split('⌘').map((seg, k) =>
          k % 2 === 1 ? <strong key={k}>{seg}</strong> : seg,
        )}
      </React.Fragment>
    ))
  })
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    localStorage.removeItem(CHAT_STORAGE_KEY)
    return []
  }
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    const trimmed = msgs.length > MAX_MESSAGES ? msgs.slice(-MAX_MESSAGES) : msgs
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    localStorage.removeItem(CHAT_STORAGE_KEY)
  }
}

interface ChatSettings {
  provider: Provider
  key: string
}

function loadSettings(): ChatSettings {
  try {
    const raw = localStorage.getItem(`${CHAT_STORAGE_KEY}-settings`)
    if (!raw) return { provider: 'openai-nano', key: '' }
    const parsed = JSON.parse(raw) as { provider?: string; key?: string }
    // Back-compat: the pre-refactor storage used `'openai' | 'gemini'`,
    // where `'openai'` meant "the OpenAI provider family" (nano). Under
    // the new type `'openai'` is specifically the full gpt-5.4 model
    // which *requires* a user key — so silently promoting a legacy
    // `'openai'` value would strand users on a locked model. Remap it to
    // nano instead.
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
    localStorage.removeItem(`${CHAT_STORAGE_KEY}-settings`)
    return { provider: 'openai-nano', key: '' }
  }
}

function saveSettings(provider: Provider, key: string) {
  try {
    localStorage.setItem(
      `${CHAT_STORAGE_KEY}-settings`,
      JSON.stringify({ provider, key }),
    )
  } catch {
    localStorage.removeItem(`${CHAT_STORAGE_KEY}-settings`)
  }
}

export const ChatSupport = ({ currentStory }: ChatSupportProps) => {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>(loadMessages)
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const settingsRef = React.useRef(loadSettings())
  const [aiProvider, setAiProvider] = React.useState<Provider>(settingsRef.current.provider)
  const [apiKey, setApiKey] = React.useState(settingsRef.current.key)
  const [showSettings, setShowSettings] = React.useState(false)
  // Latest rate-limit snapshot from the shared-pool path. `null` until the
  // first request completes; the header chip stays hidden until then to
  // avoid showing a misleading `30/30` before we actually know.
  const [rateLimit, setRateLimit] = React.useState<RateLimitInfo | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  React.useEffect(() => {
    saveMessages(messages)
  }, [messages])

  React.useEffect(() => {
    saveSettings(aiProvider, apiKey)
  }, [aiProvider, apiKey])

  // If the user clears their API key while a requires-user-key model is
  // selected, silently downgrade to nano so the next request doesn't hit
  // `AiUserKeyRequiredError` on every send.
  React.useEffect(() => {
    if (!apiKey) {
      const model = MODELS.find(m => m.value === aiProvider)
      if (model?.requiresUserKey) setAiProvider('openai-nano')
    }
  }, [apiKey, aiProvider])

  const addMessage = (role: ChatMessage['role'], content: string, source?: ChatMessage['source']) => {
    setMessages(prev => {
      const next = [...prev, { id: genId(), role, content, source, timestamp: Date.now() }]
      return next.slice(-MAX_MESSAGES)
    })
  }

  const handleSend = async () => {
    const q = input.trim()
    if (!q || loading) return

    addMessage('user', q)
    setInput('')
    setLoading(true)

    // Layer 1: FAQ — exact / keyword match against the local database.
    // Zero cost, zero latency, no quota consumption.
    const faq = searchFaq(q)
    if (faq) {
      addMessage('assistant', faq.answer, 'faq')
      setLoading(false)
      return
    }

    // Layer 2: Story Guide — for questions about the currently-viewed
    // story ("このページのヒント", "使い方", …). Also free.
    if (currentStory) {
      const guide = getStoryGuide(currentStory.title)
      if (guide) {
        const guideText = [
          `**${guide.title}** のガイド:`,
          ...guide.tips.map(t => `- ${t}`),
          guide.codeRef ? `\nコード参照: \`${guide.codeRef}\`` : '',
          guide.relatedStories?.length
            ? `\n関連ストーリー: ${guide.relatedStories.join(', ')}`
            : '',
        ]
          .filter(Boolean)
          .join('\n')

        const isGuideRelated =
          q.includes('ガイド') ||
          q.includes('ヒント') ||
          q.includes('tips') ||
          q.includes('使い方') ||
          q.includes('関連')
        if (isGuideRelated) {
          addMessage('assistant', guideText, 'guide')
          setLoading(false)
          return
        }
      }
    }

    // Layer 3: AI. No `apiKey` guard here — `callAi` dispatches to the
    // shared-pool path when the key is empty, which still works for
    // `projectKeyEnabled` models (nano / mini / gemini). `openai` (full)
    // throws `AiUserKeyRequiredError` up front and lands in the catch
    // block below.
    try {
      const result = await callAi(q, aiProvider, currentStory, apiKey)
      if (result.rateLimit) setRateLimit(result.rateLimit)
      addMessage('assistant', result.text, 'ai')
    } catch (e) {
      if (e instanceof AiQuotaExceededError) {
        setRateLimit({ remaining: e.remaining, limit: e.limit })
        addMessage(
          'assistant',
          `本日の無料枠（${e.limit} 回/日）を使い切りました。日次リセットは協定世界時 0:00 です。\n\n` +
            `すぐ使いたい場合は右上の ⚙️ から自前の OpenAI / Gemini API キーを設定してください。自前キーでは無制限 + 全モデルが利用可能です。`,
          'ai',
        )
      } else if (e instanceof AiUserKeyRequiredError) {
        addMessage(
          'assistant',
          'このモデルは自前 API キーが必要です。右上 ⚙️ からキーを入力するか、共有プール対応の nano / mini / Gemini に切り替えてください。',
          'ai',
        )
        setShowSettings(true)
      } else if (e instanceof AiAuthError) {
        addMessage('assistant', `認証エラー: ${e.message}`, 'ai')
        setShowSettings(true)
      } else if (e instanceof AiNetworkError) {
        addMessage(
          'assistant',
          `通信エラー: ${e.message}\n\nFAQ で答えられる質問はオフラインでも動作します。カラー、テーマ、ボタン等のキーワードを試してみてください。`,
          'ai',
        )
      } else {
        addMessage('assistant', `予期しないエラー: ${(e as Error).message}`, 'ai')
      }
    } finally {
      setLoading(false)
    }
  }

  const sourceLabel = (source?: ChatMessage['source']) => {
    if (!source) return null
    const labels = { faq: 'FAQ', guide: 'Guide', ai: 'AI' }
    const colors = { faq: 'var(--ok)', guide: 'var(--vec)', ai: 'var(--ai-col)' }
    return (
      <span style={{ fontSize: 12, fontWeight: 700, color: colors[source], marginLeft: 4 }}>
        {labels[source]}
      </span>
    )
  }

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          title="デザインシステム コンシェルジュ"
        >
          ?
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 380,
            maxHeight: 520,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            fontFamily: 'var(--font-ui)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-faint)',
              background: 'var(--bg-raised)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>
                DS コンシェルジュ
              </span>
              {currentStory && (
                <span style={{ fontSize: 12, color: 'var(--text-lo)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentStory.title}
                </span>
              )}
              {/* Shared-pool quota chip. Stays hidden until the first
                  request completes so we don't show a misleading figure
                  before we actually know. Colour steps through
                  default → warn → error as the budget runs out. */}
              {rateLimit && !apiKey && (
                <span
                  title={`共有プール残り: ${rateLimit.remaining}/${rateLimit.limit}`}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background:
                      rateLimit.remaining === 0
                        ? 'var(--err)'
                        : rateLimit.remaining < 5
                          ? 'var(--warn)'
                          : 'var(--bg-surface)',
                    color:
                      rateLimit.remaining === 0 || rateLimit.remaining < 5
                        ? '#fff'
                        : 'var(--text-md)',
                    border: '1px solid var(--border-faint)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  残 {rateLimit.remaining}/{rateLimit.limit}
                </span>
              )}
              {apiKey && (
                <span
                  title="自前 API キー使用中 — レート制限なし"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: 'var(--bg-surface)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  自前キー
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-lo)', padding: '2px 4px' }}
                title="設定"
              >
                &#9881;
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-lo)', padding: '2px 4px' }}
              >
                &#10005;
              </button>
            </div>
          </div>

          {/* Settings */}
          {showSettings && (
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-faint)', background: 'var(--bg-raised)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-md)', marginBottom: 4 }}>
                モデル
              </div>
              <select
                value={aiProvider}
                onChange={e => setAiProvider(e.target.value as Provider)}
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: 4,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-hi)',
                  fontSize: 12,
                  fontFamily: 'var(--font-ui)',
                  marginBottom: 4,
                }}
              >
                {MODELS.map(m => {
                  const locked = !!m.requiresUserKey && !apiKey
                  return (
                    <option key={m.value} value={m.value} disabled={locked}>
                      {locked ? '🔒 ' : ''}
                      {m.label} — {m.description}
                    </option>
                  )
                })}
              </select>
              <div style={{ fontSize: 10, color: 'var(--text-lo)', marginBottom: 8, lineHeight: 1.5 }}>
                {apiKey
                  ? '自前 API キー使用中。全モデルが無制限で利用可能です。'
                  : '共有プール使用中（1 日 30 回まで）。鍵アイコン付きのモデルは自前 API キーが必要です。'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-md)', marginBottom: 4 }}>
                自前 API キー（任意）
              </div>
              <input
                type="password"
                placeholder="OpenAI / Gemini の API キーを入力..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: 4,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-hi)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <div style={{ fontSize: 10, color: 'var(--text-lo)', marginTop: 4, lineHeight: 1.5 }}>
                キーは端末の localStorage にのみ保存され、Matlens のサーバーには送信されません。
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.length === 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)', lineHeight: 1.6, padding: '8px 0' }}>
                  {WELCOME_MESSAGE}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {QUICK_SUGGESTIONS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => { setInput(s.query); }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid var(--border-default)',
                        background: 'var(--bg-raised)',
                        color: 'var(--accent)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-raised)')}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-raised)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-hi)',
                    fontSize: 12,
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                  }}
                >
                  {renderContent(msg.content)}
                </div>
                {msg.role === 'assistant' && (
                  <div style={{ marginTop: 2, textAlign: 'left' }}>
                    {sourceLabel(msg.source)}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: 12, color: 'var(--text-lo)', fontStyle: 'italic' }}>考え中...</div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border-faint)', display: 'flex', gap: 6 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (isSubmitShortcut(e)) { e.preventDefault(); handleSend(); } }}
              placeholder={`質問を入力... (${submitShortcutLabel()} 送信)`}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--border-default)',
                background: 'var(--bg-base)',
                color: 'var(--text-hi)',
                fontSize: 12,
                fontFamily: 'var(--font-ui)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                background: loading || !input.trim() ? 'var(--bg-raised)' : 'var(--accent)',
                color: loading || !input.trim() ? 'var(--text-lo)' : '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: loading || !input.trim() ? 'default' : 'pointer',
              }}
            >
              送信
            </button>
          </div>
        </div>
      )}
    </>
  )
}
