import React from 'react'
import type { ChatMessage, StoryContext } from './chatSupportTypes'
import { WELCOME_MESSAGE, MAX_MESSAGES, CHAT_STORAGE_KEY, QUICK_SUGGESTIONS } from './chatSupportConstants'
import { searchFaq } from './faqDatabase'
import { getStoryGuide } from './storyGuideMap'
import { callAi } from './chatAiService'
import { CodeBlock } from './CodeBlock'
import { isSubmitShortcut, submitShortcutLabel } from '../../../utils/keyboard'

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

function loadSettings(): { provider: 'openai' | 'gemini'; key: string } {
  try {
    const raw = localStorage.getItem(`${CHAT_STORAGE_KEY}-settings`)
    return raw ? JSON.parse(raw) : { provider: 'openai', key: '' }
  } catch {
    localStorage.removeItem(`${CHAT_STORAGE_KEY}-settings`)
    return { provider: 'openai', key: '' }
  }
}

function saveSettings(provider: 'openai' | 'gemini', key: string) {
  try {
    localStorage.setItem(`${CHAT_STORAGE_KEY}-settings`, JSON.stringify({ provider, key }))
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
  const [aiProvider, setAiProvider] = React.useState<'openai' | 'gemini'>(settingsRef.current.provider)
  const [apiKey, setApiKey] = React.useState(settingsRef.current.key)
  const [showSettings, setShowSettings] = React.useState(false)
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

    // Layer 1: FAQ
    const faq = searchFaq(q)
    if (faq) {
      addMessage('assistant', faq.answer, 'faq')
      setLoading(false)
      return
    }

    // Layer 2: Story Guide
    if (currentStory) {
      const guide = getStoryGuide(currentStory.title)
      if (guide) {
        const guideText = [
          `**${guide.title}** のガイド:`,
          ...guide.tips.map(t => `- ${t}`),
          guide.codeRef ? `\nコード参照: \`${guide.codeRef}\`` : '',
          guide.relatedStories?.length ? `\n関連ストーリー: ${guide.relatedStories.join(', ')}` : '',
        ].filter(Boolean).join('\n')

        const isGuideRelated = q.includes('ガイド') || q.includes('ヒント') || q.includes('tips') || q.includes('使い方') || q.includes('関連')
        if (isGuideRelated) {
          addMessage('assistant', guideText, 'guide')
          setLoading(false)
          return
        }
      }
    }

    // Layer 3: AI API
    if (!apiKey) {
      addMessage('assistant', 'AI APIを利用するにはAPIキーが必要です。右上の設定アイコンからキーを設定してください。\n\nFAQで回答できる質問はキー不要です。カラー、テーマ、フォント、ボタン等のキーワードを試してみてください。', 'faq')
      setLoading(false)
      return
    }

    const result = await callAi(q, currentStory, apiKey, aiProvider)
    if (result.error) {
      addMessage('assistant', `エラー: ${result.error}`, 'ai')
    } else {
      addMessage('assistant', result.content, 'ai')
    }
    setLoading(false)
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
                <span style={{ fontSize: 12, color: 'var(--text-lo)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentStory.title}
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
            <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-faint)', background: 'var(--bg-raised)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-md)', marginBottom: 6 }}>AI設定</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {(['openai', 'gemini'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setAiProvider(p)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 4,
                      border: aiProvider === p ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                      background: aiProvider === p ? 'var(--accent-dim)' : 'transparent',
                      color: aiProvider === p ? 'var(--accent)' : 'var(--text-md)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {p === 'openai' ? 'OpenAI' : 'Gemini'}
                  </button>
                ))}
              </div>
              <input
                type="password"
                placeholder="APIキーを入力..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-base)',
                  color: 'var(--text-hi)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                }}
              />
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
