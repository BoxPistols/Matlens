import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const DURATIONS = [
  { name: 'xs', ms: 100, usage: 'hover / focus' },
  { name: 'sm', ms: 150, usage: 'ボタン色変化' },
  { name: 'md', ms: 220, usage: 'ドロップダウン開閉' },
  { name: 'lg', ms: 320, usage: 'モーダル・サイドパネル' },
]

const EASINGS = [
  { name: 'ease-out', value: 'cubic-bezier(0.16, 1, 0.3, 1)', usage: '自然な減速 (標準)' },
  { name: 'ease-in-out', value: 'cubic-bezier(0.4, 0, 0.2, 1)', usage: '循環・往復' },
  { name: 'linear', value: 'linear', usage: 'プログレスバー' },
]

const Motion = () => {
  const [trigger, setTrigger] = useState(0)
  return (
    <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 12 }}>Motion</h1>
      <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 20 }}>
        科学計測 UI は演出より <strong>意味ある遷移</strong>を優先。prefers-reduced-motion を尊重。
      </p>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            DURATIONS
          </div>
          <button
            onClick={() => setTrigger(t => t + 1)}
            style={{
              padding: '4px 10px', borderRadius: 6,
              background: 'var(--accent)', color: '#fff',
              border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            再生
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DURATIONS.map(d => (
            <div
              key={d.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)',
              }}
            >
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)', minWidth: 36 }}>
                {d.name}
              </code>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-md)', minWidth: 60 }}>{d.ms}ms</code>
              <div
                key={trigger}
                style={{
                  width: 16, height: 16, borderRadius: 4, background: 'var(--accent)',
                  animation: `matlens-slide ${d.ms}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-lo)' }}>{d.usage}</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes matlens-slide { from { transform: translateX(0); opacity: 0 } to { transform: translateX(120px); opacity: 1 } }`}</style>
      </section>

      <section>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          EASINGS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {EASINGS.map(e => (
            <div key={e.name} style={{ display: 'flex', gap: 12, fontSize: 12.5, color: 'var(--text-md)' }}>
              <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', minWidth: 90 }}>{e.name}</code>
              <span style={{ color: 'var(--text-lo)' }}>{e.usage}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const meta: Meta<typeof Motion> = {
  title: 'DesignTokens/Motion',
  component: Motion,
  parameters: { docs: { description: { component: 'トランジション duration / easing 定数と用途。' } } },
}
export default meta
type Story = StoryObj<typeof Motion>
export const Default: Story = {}
