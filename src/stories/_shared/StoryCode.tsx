import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'

// Monokai classic palette — Storybook 全テーマ共通で視認性を担保するため明示的に固定。
// グローバル index.css の .token.* ルールを上書きするため data-code スコープで !important。
const MONOKAI_CSS = `
[data-story-code] { color: #f8f8f2; background: #272822; }
[data-story-code] .token.comment,
[data-story-code] .token.prolog,
[data-story-code] .token.doctype,
[data-story-code] .token.cdata { color: #75715e !important; font-style: italic; }
[data-story-code] .token.punctuation { color: #f8f8f2 !important; }
[data-story-code] .token.namespace { opacity: .7; }
[data-story-code] .token.property,
[data-story-code] .token.tag,
[data-story-code] .token.constant,
[data-story-code] .token.symbol,
[data-story-code] .token.deleted { color: #f92672 !important; }
[data-story-code] .token.boolean,
[data-story-code] .token.number { color: #ae81ff !important; }
[data-story-code] .token.selector,
[data-story-code] .token.attr-name,
[data-story-code] .token.string,
[data-story-code] .token.char,
[data-story-code] .token.builtin,
[data-story-code] .token.inserted { color: #a6e22e !important; }
[data-story-code] .token.operator,
[data-story-code] .token.entity,
[data-story-code] .token.url,
[data-story-code] .language-css .token.string,
[data-story-code] .style .token.string,
[data-story-code] .token.variable { color: #f92672 !important; }
[data-story-code] .token.atrule,
[data-story-code] .token.attr-value,
[data-story-code] .token.function,
[data-story-code] .token.class-name { color: #e6db74 !important; }
[data-story-code] .token.keyword { color: #66d9ef !important; font-style: italic; }
[data-story-code] .token.regex,
[data-story-code] .token.important { color: #fd971f !important; }
[data-story-code] .token.important,
[data-story-code] .token.bold { font-weight: 700; }
[data-story-code] .token.italic { font-style: italic; }
[data-story-code] .token.entity { cursor: help; }
`

const CODE_FONT =
  "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, 'Cascadia Mono', Consolas, 'Courier New', monospace"

export const StoryCode = ({ children, lang = 'tsx' }: { children: string; lang?: string }) => {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current)
  }, [children])
  return (
    <>
      <style>{MONOKAI_CSS}</style>
      <div
        style={{
          position: 'relative',
          margin: '10px 0',
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid #1b1c17',
          boxShadow: '0 1px 2px rgba(0,0,0,.25)',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 12px', background: '#1e1f1a',
            borderBottom: '1px solid #111',
            fontSize: 12, fontFamily: CODE_FONT,
            color: '#a59f85', letterSpacing: '.06em', textTransform: 'uppercase',
          }}
        >
          <span>{lang}</span>
        </div>
        <pre
          data-story-code
          style={{
            margin: 0,
            padding: '12px 14px',
            background: '#272822',
            fontFamily: CODE_FONT,
            fontSize: 13,
            lineHeight: 1.6,
            letterSpacing: 0,
            overflowX: 'auto',
            tabSize: 2,
          }}
        >
          <code
            ref={ref}
            className={`language-${lang}`}
            style={{ color: '#f8f8f2', fontFamily: 'inherit', background: 'transparent' }}
          >
            {children}
          </code>
        </pre>
      </div>
    </>
  )
}
