import type { Meta, StoryObj } from '@storybook/react-vite'

const Section = ({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>{title}</h2>
    {lead && <p style={{ fontSize: 13, color: 'var(--text-lo)', lineHeight: 1.7, marginBottom: 10 }}>{lead}</p>}
    {children}
  </section>
)

const KeyRow = ({ label, desc }: { label: string; desc: string }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
      borderBottom: '1px solid var(--border-faint)', fontSize: 13, color: 'var(--text-md)',
    }}
  >
    <code
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)',
        minWidth: 120, padding: '2px 8px', borderRadius: 4,
        background: 'var(--bg-raised)', border: '1px solid var(--border-faint)',
      }}
    >
      {label}
    </code>
    <span>{desc}</span>
  </div>
)

const Ergonomics = () => (
  <div style={{ maxWidth: 680, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 6, letterSpacing: '-0.02em' }}>
      エルゴノミクス & アクセシビリティ
    </h1>
    <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 24 }}>
      研究者・現場ユーザーが長時間操作しても疲れにくく、環境・用途で切り替えられる UI を目指しています。
    </p>

    <Section title="3 つのコンフォート軸" lead="ユーザーが自分で選べるよう、セレクターを上部ツールバーに配置。">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {[
          { axis: 'テーマ', desc: 'Light / Dark / Eng / CAE の 4 系統', var: '--theme' },
          { axis: '密度', desc: 'Comfortable / Compact の 2 段階', var: 'data-density' },
          { axis: '言語', desc: '日本語 / 英語 (バイリンガル)', var: 'i18n' },
        ].map(c => (
          <div
            key={c.axis}
            style={{
              padding: 14, borderRadius: 10,
              background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>{c.axis}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-md)', lineHeight: 1.6, marginBottom: 6 }}>{c.desc}</div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{c.var}</code>
          </div>
        ))}
      </div>
    </Section>

    <Section title="キーボード操作" lead="マウス不要で主要フローを完走できることを目標に。">
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
        {([
          ['Tab / Shift+Tab', 'フォーカス移動 (すべての対話要素)'],
          ['Enter', '確定・送信'],
          ['Escape', 'モーダル・ポップオーバーの閉じる'],
          ['Arrow', 'メニュー・セレクトの移動'],
          ['Space', 'チェックボックス・ボタン作動'],
        ] as const).map(([k, d]) => <KeyRow key={k} label={k} desc={d} />)}
      </div>
    </Section>

    <Section title="A11y 実装チェックリスト" lead="各 Story が axe-core で自動チェックされる (addon-a11y)。">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>全インタラクティブ要素に可視 focus リング</li>
        <li>コントラスト比 AA (4.5:1 / 3:1) 以上を 4 テーマ全てで確保</li>
        <li>aria-label / aria-describedby をアイコンのみボタンに付与</li>
        <li>ダイアログ展開時のフォーカストラップと復帰</li>
        <li>スクリーンリーダー読み上げ順序を DOM と一致</li>
      </ul>
    </Section>

    <Section title="疲労軽減の工夫">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>Dark / CAE テーマ: 解析画面の長時間凝視を想定した低輝度配色</li>
        <li>Compact 密度: 一覧系で縦スクロール量を削減</li>
        <li>antialiased + Noto Sans JP: ダークモードでの可読性向上 (実測で改善確認済み)</li>
        <li>prefers-reduced-motion 尊重: 不要なトランジションを抑制</li>
      </ul>
    </Section>
  </div>
)

const meta: Meta<typeof Ergonomics> = {
  title: 'Guide/Ergonomics',
  component: Ergonomics,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'テーマ・密度・言語・キーボード・A11y の横断ポリシー。' } } },
}
export default meta
type Story = StoryObj<typeof Ergonomics>
export const Default: Story = {}
