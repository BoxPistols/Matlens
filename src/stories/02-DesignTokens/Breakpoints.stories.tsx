import type { Meta, StoryObj } from '@storybook/react-vite'

const BREAKPOINTS = [
  { name: 'sm', min: '640px', usage: 'スマートフォン横 / 小型タブレット' },
  { name: 'md', min: '768px', usage: 'タブレット・狭い PC' },
  { name: 'lg', min: '1024px', usage: '一般的な PC' },
  { name: 'xl', min: '1280px', usage: 'ワイドディスプレイ' },
  { name: '2xl', min: '1536px', usage: '大型モニタ・解析用' },
]

const Breakpoints = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 12 }}>Breakpoints</h1>
    <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 20 }}>
      Tailwind 標準ブレークポイント準拠。科学計測 UI は PC 利用が中心のため、lg / xl を主設計点としています。
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {BREAKPOINTS.map(b => (
        <div
          key={b.name}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 8,
            background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)',
          }}
        >
          <code
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700,
              color: 'var(--accent)', minWidth: 48,
            }}
          >
            {b.name}
          </code>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-md)', minWidth: 90 }}>
            ≥ {b.min}
          </code>
          <span style={{ fontSize: 13, color: 'var(--text-md)' }}>{b.usage}</span>
        </div>
      ))}
    </div>

    <p style={{ fontSize: 12, color: 'var(--text-lo)', lineHeight: 1.7, marginTop: 20 }}>
      使用例: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>className="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"</code>
    </p>
  </div>
)

const meta: Meta<typeof Breakpoints> = {
  title: 'DesignTokens/Breakpoints',
  component: Breakpoints,
  parameters: { docs: { description: { component: 'レスポンシブブレークポイント (Tailwind 準拠)。' } } },
}
export default meta
type Story = StoryObj<typeof Breakpoints>
export const Default: Story = {}
