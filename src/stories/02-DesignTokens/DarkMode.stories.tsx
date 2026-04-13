import type { Meta, StoryObj } from '@storybook/react-vite'

// テーマごとの同一 UI 比較。各カードに data-theme を直接付けて並列描画する。

const Sample = ({ theme, label }: { theme: string; label: string }) => (
  <div
    data-theme={theme}
    style={{
      padding: 16,
      borderRadius: 10,
      background: 'var(--bg-base)',
      color: 'var(--text-hi)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)',
      fontFamily: 'var(--font-ui)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
      <span
        style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px',
          borderRadius: 12, background: 'var(--accent)', color: '#fff',
        }}
      >
        {theme}
      </span>
    </div>
    <div style={{ fontSize: 12, color: 'var(--text-md)', marginBottom: 10 }}>
      材料ID: Ti-6Al-4V / 高純度グレード
    </div>
    <div
      style={{
        padding: 10,
        borderRadius: 6,
        background: 'var(--bg-surface)',
        fontSize: 12, color: 'var(--text-lo)',
      }}
    >
      引張強さ 950 MPa / 0.2% 耐力 880 MPa
    </div>
    <button
      style={{
        marginTop: 10, padding: '6px 14px', borderRadius: 6,
        background: 'var(--accent)', color: '#fff',
        border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}
    >
      詳細
    </button>
  </div>
)

const DarkMode = () => (
  <div style={{ maxWidth: 760, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 12 }}>Dark Mode & Themes</h1>
    <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 20 }}>
      Matlens は 4 テーマ。<code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>data-theme</code> 属性だけでスキーム切替が完結し、React の再レンダリングは不要です。
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <Sample theme='light' label='Light' />
      <Sample theme='dark' label='Dark' />
      <Sample theme='eng' label='Eng' />
      <Sample theme='cae' label='CAE' />
    </div>

    <p style={{ fontSize: 12, color: 'var(--text-lo)', lineHeight: 1.7, marginTop: 20 }}>
      実装: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{'document.documentElement.setAttribute("data-theme", next)'}</code> + localStorage 永続化 + 他タブ同期。
    </p>
  </div>
)

const meta: Meta<typeof DarkMode> = {
  title: 'DesignTokens/DarkMode',
  component: DarkMode,
  parameters: { docs: { description: { component: '4 テーマ (Light/Dark/Eng/CAE) の並列比較。' } } },
}
export default meta
type Story = StoryObj<typeof DarkMode>
export const Default: Story = {}
