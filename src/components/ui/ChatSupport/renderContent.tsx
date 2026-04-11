// Minimal markdown-ish renderer for chat message bodies.
//
// This intentionally stays homegrown rather than pulling in react-markdown
// + remark-gfm — the scope is tiny (code fences, inline code, bold,
// line breaks) and the subset we render is the subset the FAQ /
// storyGuide / AI layers actually emit. LLM output that contains HTML
// is dropped on the floor because we never interpolate it as html; we
// only render text nodes, which is safe against injection.
//
// If we ever need tables, lists, or nested blockquotes, swap in
// react-markdown at that point instead of growing this parser.

import React from 'react'
import { CodeBlock } from './CodeBlock'

export function renderContent(text: string): React.ReactNode {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/)
  return parts.map((part, i) => {
    // Fenced code block with optional language hint: ```ts ... ```
    if (part.startsWith('```')) {
      const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/)
      if (match) {
        return (
          <CodeBlock
            key={i}
            language={match[1] ?? ''}
            code={(match[2] ?? '').trim()}
          />
        )
      }
      return <CodeBlock key={i} code={part.replace(/```/g, '').trim()} />
    }
    // Inline code: `foo`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
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
    // Plain text with bold markers (**foo**) and line breaks.
    return part.split('\n').map((line, j) => (
      <React.Fragment key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line
          .replace(/\*\*(.+?)\*\*/g, '⌘$1⌘')
          .split('⌘')
          .map((seg, k) =>
            k % 2 === 1 ? <strong key={k}>{seg}</strong> : seg,
          )}
      </React.Fragment>
    ))
  })
}
