// Chat input row: textarea-like input + paper-plane send button.
// Mode-aware placeholder so the user always knows which response path
// their next message will take (shared pool vs own-key, FAQ fallback).

import React from 'react'
import { Icon } from '../../../Icon/Icon'
import { isSubmitShortcut, submitShortcutLabel } from '../../../../utils/keyboard'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
  hasUserKey: boolean
}

export const ChatInput = React.memo(
  ({ value, onChange, onSubmit, disabled, hasUserKey }: ChatInputProps) => {
    const placeholder = hasUserKey
      ? `自前キーモード: 質問を入力... (${submitShortcutLabel()} 送信)`
      : `共有プール: 質問を入力... (${submitShortcutLabel()} 送信)`
    const canSubmit = !disabled && value.trim().length > 0

    return (
      <div
        style={{
          padding: '8px 10px',
          borderTop: '1px solid var(--border-faint)',
          background: 'var(--bg-surface)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (isSubmitShortcut(e)) {
              e.preventDefault()
              if (canSubmit) onSubmit()
            }
          }}
          placeholder={placeholder}
          aria-label="チャット入力"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 18,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-base)',
            color: 'var(--text-hi)',
            fontSize: 12,
            fontFamily: 'var(--font-ui)',
            outline: 'none',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-label="送信"
          title="送信"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            background: canSubmit ? 'var(--accent)' : 'var(--bg-raised)',
            color: canSubmit ? '#fff' : 'var(--text-lo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canSubmit ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'background 0.15s ease-out',
          }}
        >
          <Icon name="send" size={16} />
        </button>
      </div>
    )
  },
)
ChatInput.displayName = 'ChatInput'
