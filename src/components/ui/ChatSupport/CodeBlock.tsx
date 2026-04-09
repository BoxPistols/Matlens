import React from 'react'

interface CodeBlockProps {
  code: string
  language?: string
}

export const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ position: 'relative', margin: '8px 0' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          padding: '2px 6px',
          fontSize: 12,
          borderRadius: 4,
          border: '1px solid var(--border-faint)',
          background: 'var(--bg-raised)',
          color: 'var(--text-lo)',
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      {language && (
        <span
          style={{
            position: 'absolute',
            top: 4,
            left: 8,
            fontSize: 12,
            color: 'var(--text-lo)',
            textTransform: 'uppercase',
          }}
        >
          {language}
        </span>
      )}
      <pre
        style={{
          padding: '24px 12px 12px',
          borderRadius: 6,
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-faint)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-hi)',
          overflowX: 'auto',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {code}
      </pre>
    </div>
  )
}
