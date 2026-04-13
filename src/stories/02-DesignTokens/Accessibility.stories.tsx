import type { Meta, StoryObj } from '@storybook/react-vite'

const Pair = ({ bg, fg, label, ratio }: { bg: string; fg: string; label: string; ratio: string }) => (
  <div
    style={{
      padding: '16px 18px',
      borderRadius: 8,
      background: bg,
      color: fg,
      fontFamily: 'var(--font-ui)',
      border: '1px solid var(--border-faint)',
    }}
  >
    <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Contrast ratio: {ratio}</div>
  </div>
)

const Accessibility = () => (
  <div style={{ maxWidth: 680, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 12 }}>Accessibility</h1>
    <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 20 }}>
      全テーマで WCAG AA (4.5:1 / 3:1) 以上を確保。重要テキストは AAA (7:1) を目標に。
    </p>

    <section style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        CONTRAST SAMPLES
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        <Pair bg='var(--bg-base)' fg='var(--text-hi)' label='主要テキスト' ratio='AAA' />
        <Pair bg='var(--bg-surface)' fg='var(--text-md)' label='本文' ratio='AA' />
        <Pair bg='var(--bg-raised)' fg='var(--text-lo)' label='補助テキスト' ratio='AA' />
        <Pair bg='var(--accent)' fg='#fff' label='主要アクション' ratio='AAA' />
      </div>
    </section>

    <section style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        FOCUS RING
      </div>
      <button
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          outlineOffset: 2,
        }}
      >
        Tab でフォーカス
      </button>
      <p style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 8, lineHeight: 1.7 }}>
        すべてのインタラクティブ要素に 2px 以上のフォーカスリング。キーボード操作時のみ表示されるよう
        <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginLeft: 4 }}>:focus-visible</code> を使用。
      </p>
    </section>

    <section>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        CHECKLIST
      </div>
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>axe-core (addon-a11y) が全 Story で自動実行</li>
        <li>アイコン単独ボタンには aria-label を付与</li>
        <li>モーダル展開時にフォーカストラップ、閉じるときに復帰</li>
        <li>prefers-reduced-motion の尊重</li>
        <li>タッチターゲット 44×44px 以上</li>
      </ul>
    </section>
  </div>
)

const meta: Meta<typeof Accessibility> = {
  title: 'DesignTokens/Accessibility',
  component: Accessibility,
  parameters: { docs: { description: { component: 'コントラスト比・フォーカス・A11y チェックリスト。' } } },
}
export default meta
type Story = StoryObj<typeof Accessibility>
export const Default: Story = {}
