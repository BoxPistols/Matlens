// Settings panel — model selector + user-supplied API key. Toggled by
// the gear icon in the header.
//
// The model selector disables `requiresUserKey` models when the user
// hasn't supplied a key and shows a lock emoji next to their label so
// the restriction is self-explanatory.

import React from 'react'
import type { Provider } from '../chatSupportTypes'
import { MODELS } from '../chatSupportConstants'

interface ChatSettingsProps {
  provider: Provider
  onProviderChange: (p: Provider) => void
  apiKey: string
  onApiKeyChange: (k: string) => void
}

export const ChatSettings = React.memo(
  ({ provider, onProviderChange, apiKey, onApiKeyChange }: ChatSettingsProps) => {
    return (
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <section>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-hi)',
              marginBottom: 6,
            }}
          >
            モデル
          </div>
          <select
            value={provider}
            onChange={e => onProviderChange(e.target.value as Provider)}
            style={{
              width: '100%',
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-base)',
              color: 'var(--text-hi)',
              fontSize: 12,
              fontFamily: 'var(--font-ui)',
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
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-lo)',
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            {apiKey
              ? '自前 API キー使用中。全モデルが無制限で利用可能です。'
              : '共有プール使用中（1 日 30 回まで）。鍵アイコン付きのモデルは自前 API キーが必要です。'}
          </div>
        </section>

        <section>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-hi)',
              marginBottom: 6,
            }}
          >
            自前 API キー（任意）
          </div>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="OpenAI / Gemini の API キーを入力..."
            value={apiKey}
            onChange={e => onApiKeyChange(e.target.value)}
            aria-label="API キー入力"
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-base)',
              color: 'var(--text-hi)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          />
          <div
            style={{
              fontSize: 10,
              color: 'var(--text-lo)',
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            キーは端末の localStorage にのみ保存され、Matlens のサーバーには送信されません。キーを入れると共有プール制限を超えて無制限で利用でき、`gpt-5.4` フルモデルもアンロックされます。
          </div>
        </section>
      </div>
    )
  },
)
ChatSettings.displayName = 'ChatSettings'
