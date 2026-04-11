// A single chat bubble with an avatar. Bot messages land on the left
// with a robot avatar; user messages land on the right with an accent
// bubble. The source badge (FAQ / Guide / AI) sits under the bot
// bubble so users can see at a glance which layer answered.

import React from 'react'
import type { ChatMessage as ChatMessageType } from '../chatSupportTypes'
import { Icon } from '../../../Icon/Icon'
import { renderContent } from '../renderContent'

interface ChatMessageProps {
  message: ChatMessageType
}

const SOURCE_META: Record<
  NonNullable<ChatMessageType['source']>,
  { label: string; color: string }
> = {
  faq: { label: 'FAQ', color: 'var(--ok)' },
  guide: { label: 'Guide', color: 'var(--vec)' },
  ai: { label: 'AI', color: 'var(--ai-col)' },
}

function Avatar({ kind }: { kind: 'user' | 'assistant' }) {
  const isUser = kind === 'user'
  return (
    <div
      aria-hidden
      style={{
        flexShrink: 0,
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: isUser ? 'var(--accent)' : 'var(--bg-raised)',
        color: isUser ? '#fff' : 'var(--ai-col)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-faint)',
      }}
    >
      <Icon name={isUser ? 'help' : 'bot'} size={14} />
    </div>
  )
}

export const ChatMessage = React.memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'
  const sourceMeta = message.source ? SOURCE_META[message.source] : null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 8,
        alignItems: 'flex-start',
      }}
    >
      <Avatar kind={message.role} />
      <div style={{ maxWidth: '80%' }}>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            background: isUser ? 'var(--accent)' : 'var(--bg-raised)',
            color: isUser ? '#fff' : 'var(--text-hi)',
            fontSize: 12,
            lineHeight: 1.6,
            wordBreak: 'break-word',
            border: isUser ? 'none' : '1px solid var(--border-faint)',
          }}
        >
          {renderContent(message.content)}
        </div>
        {!isUser && sourceMeta && (
          <div
            style={{
              marginTop: 3,
              display: 'flex',
              gap: 4,
              alignItems: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: sourceMeta.color,
              letterSpacing: '0.05em',
            }}
          >
            {sourceMeta.label}
          </div>
        )}
      </div>
    </div>
  )
})
ChatMessage.displayName = 'ChatMessage'
