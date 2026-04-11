// Scrollable message history. When empty, shows a welcome paragraph,
// a page-context banner (if the current story has a handwritten
// guide), and the quick-suggestion grid. When non-empty, renders
// each message as a bubble and a "考え中..." indicator while the AI
// request is inflight.

import React, { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType, StoryContext } from '../chatSupportTypes'
import { WELCOME_MESSAGE } from '../chatSupportConstants'
import { ChatMessage } from './ChatMessage'
import { QuickSuggestions } from './QuickSuggestions'
import { PageContextBanner } from './PageContextBanner'

interface ChatMessageListProps {
  messages: ChatMessageType[]
  sending: boolean
  currentStory: StoryContext | null
  onQuickSelect: (query: string) => void
  onExplainStory: (storyTitle: string) => void
}

export const ChatMessageList = ({
  messages,
  sending,
  currentStory,
  onQuickSelect,
  onExplainStory,
}: ChatMessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending])

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {messages.length === 0 && (
        <div>
          <PageContextBanner
            currentStory={currentStory}
            onExplain={onExplainStory}
          />
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-md)',
              lineHeight: 1.7,
              padding: '4px 0 8px 0',
              whiteSpace: 'pre-wrap',
            }}
          >
            {WELCOME_MESSAGE}
          </div>
          <QuickSuggestions onSelect={onQuickSelect} />
        </div>
      )}
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {sending && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-lo)',
            fontStyle: 'italic',
            marginLeft: 36,
          }}
        >
          考え中...
        </div>
      )}
    </div>
  )
}
