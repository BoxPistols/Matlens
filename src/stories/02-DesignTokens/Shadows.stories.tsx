import type { Meta, StoryObj } from '@storybook/react-vite'

const SHADOWS = [
  { token: '--shadow-xs', label: 'XS', desc: 'ボタン・バッジ等の微弱な浮き' },
  { token: '--shadow-sm', label: 'SM', desc: 'カード・ドロップダウン' },
  { token: '--shadow-md', label: 'MD', desc: 'モーダル・ポップオーバー' },
  { token: '--shadow-lg', label: 'LG', desc: 'フローティングパネル・ダイアログ' },
] as const

const ShadowScale = () => (
  <div style={{ fontFamily: 'var(--font-ui)' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
      {SHADOWS.map(s => (
        <div key={s.token} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              height: 100,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              boxShadow: `var(${s.token})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)' }}>{s.label}</span>
          </div>
          <div>
            <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{s.token}</code>
            <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 2 }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ marginTop: 32 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
        テーマ別比較
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-md)', lineHeight: 1.6 }}>
        上部ツールバーの Theme セレクターでテーマを切り替えると、各シャドウの強度・色味が変化します。
        Light テーマでは淡いブルーグレー、Dark / Eng テーマでは深い黒ベースのシャドウになります。
      </p>
    </div>
  </div>
)

const meta: Meta<typeof ShadowScale> = {
  title: 'DesignTokens/Shadows',
  component: ShadowScale,
  parameters: {
    docs: {
      description: {
        component: 'シャドウトークン一覧（XS〜LG）。テーマ切替でシャドウの深さ・色味が変わる。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ShadowScale>

export const Default: Story = {}
