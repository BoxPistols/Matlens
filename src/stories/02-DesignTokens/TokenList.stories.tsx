import type { Meta, StoryObj } from '@storybook/react-vite'

// 主要 CSS 変数を一覧化したオーバービュー。値はテーマで切り替わる (data-theme 属性)。

const GROUPS: { label: string; tokens: { name: string; role: string }[] }[] = [
  {
    label: 'Background',
    tokens: [
      { name: '--bg-base', role: 'ページ背景' },
      { name: '--bg-surface', role: 'カード・パネル' },
      { name: '--bg-raised', role: 'インプット・コード背景' },
    ],
  },
  {
    label: 'Text',
    tokens: [
      { name: '--text-hi', role: '主要テキスト' },
      { name: '--text-md', role: '本文' },
      { name: '--text-lo', role: '補助・メタ' },
    ],
  },
  {
    label: 'Accent',
    tokens: [
      { name: '--accent', role: '主要アクション' },
      { name: '--accent-mid', role: 'グラデーション中間' },
      { name: '--accent-dim', role: '薄い背景' },
    ],
  },
  {
    label: 'Semantic',
    tokens: [
      { name: '--ok', role: '成功・完了' },
      { name: '--warn', role: '警告' },
      { name: '--err', role: 'エラー' },
      { name: '--info', role: '情報' },
    ],
  },
  {
    label: 'Category',
    tokens: [
      { name: '--ai-col', role: 'AI 機能識別' },
      { name: '--vec', role: 'ベクトル検索識別' },
    ],
  },
  {
    label: 'Border / Shadow',
    tokens: [
      { name: '--border-default', role: '区切り線' },
      { name: '--border-faint', role: '薄い区切り' },
      { name: '--shadow-xs', role: '最小影' },
      { name: '--shadow-sm', role: '小影' },
      { name: '--shadow-md', role: '中影' },
    ],
  },
  {
    label: 'Typography',
    tokens: [
      { name: '--font-ui', role: 'UI 主フォント' },
      { name: '--font-mono', role: '等幅フォント' },
    ],
  },
]

const TokenList = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 16 }}>
      Design Tokens 一覧
    </h1>
    <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 24 }}>
      上部ツールバーの Theme を切り替えると、各トークンの値がリアルタイムに変わります。
    </p>

    {GROUPS.map(g => (
      <section key={g.label} style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          {g.label}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          {g.tokens.map(t => (
            <div
              key={t.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)',
              }}
            >
              <span
                style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: `var(${t.name})`,
                  border: '1px solid var(--border-faint)',
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
                  {t.name}
                </code>
                <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)

const meta: Meta<typeof TokenList> = {
  title: 'DesignTokens/TokenList',
  component: TokenList,
  parameters: { docs: { description: { component: '主要 CSS 変数 (トークン) の俯瞰。テーマ切替でリアルタイムに値が変わる。' } } },
}
export default meta
type Story = StoryObj<typeof TokenList>
export const Default: Story = {}
