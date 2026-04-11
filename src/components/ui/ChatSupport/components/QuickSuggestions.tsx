// Grid of quick-action chips shown when the conversation is empty.
// Clicking one drops its canonical query into the input so the user
// doesn't have to phrase it themselves.

import React from 'react'
import { QUICK_SUGGESTIONS } from '../chatSupportConstants'

interface QuickSuggestionsProps {
  onSelect: (query: string) => void
}

export const QuickSuggestions = React.memo(({ onSelect }: QuickSuggestionsProps) => {
  return (
    <div
      role="list"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 10,
      }}
    >
      {QUICK_SUGGESTIONS.map(suggestion => (
        <button
          key={suggestion.label}
          type="button"
          role="listitem"
          onClick={() => onSelect(suggestion.query)}
          style={{
            padding: '5px 10px',
            borderRadius: 14,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-raised)',
            color: 'var(--accent)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.1s, border-color 0.1s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-raised)'
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  )
})
QuickSuggestions.displayName = 'QuickSuggestions'
