import type { Meta, StoryObj } from '@storybook/react-vite'

const TokenTable = ({ title, tokens }: { title: string; tokens: { name: string; value: string; desc: string }[] }) => (
  <div style={{ marginBottom: 24 }}>
    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 8 }}>{title}</h3>
    <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-raised)' }}>
            <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-lo)', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid var(--border-default)' }}>変数</th>
            <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-lo)', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid var(--border-default)' }}>Light値</th>
            <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-lo)', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid var(--border-default)' }}>用途</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(t => (
            <tr key={t.name} style={{ borderBottom: '1px solid var(--border-faint)' }}>
              <td style={{ padding: '5px 10px' }}>
                <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 12 }}>{t.name}</code>
              </td>
              <td style={{ padding: '5px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.value.startsWith('#') && <div style={{ width: 14, height: 14, borderRadius: 3, background: t.value, border: '1px solid var(--border-default)' }} />}
                  <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-md)', fontSize: 12 }}>{t.value}</code>
                </div>
              </td>
              <td style={{ padding: '5px 10px', color: 'var(--text-lo)' }}>{t.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const CssReference = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>
      CSS変数リファレンス
    </h1>
    <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7, marginBottom: 24 }}>
      全CSS変数の一覧（Lightテーマの値を併記）。テーマ切替で全て自動的に変わります。
    </p>

    <TokenTable
      title="ロールカラー"
      tokens={[
        { name: '--accent', value: '#004590', desc: 'プライマリアクセント' },
        { name: '--accent-hover', value: '#003070', desc: 'ホバー時アクセント' },
        { name: '--accent-dim', value: '#dce8f7', desc: 'アクセント薄色背景' },
        { name: '--ai-col', value: '#3b35a0', desc: 'AI機能カラー' },
        { name: '--ai-dim', value: '#ebebfa', desc: 'AI薄色背景' },
        { name: '--vec', value: '#0a6657', desc: 'ベクトル検索カラー' },
        { name: '--vec-dim', value: '#d8f0eb', desc: 'ベクトル薄色背景' },
        { name: '--ok', value: '#1e6b0f', desc: '成功・完了' },
        { name: '--warn', value: '#7a4b00', desc: '警告' },
        { name: '--err', value: '#8b1a1a', desc: 'エラー・危険' },
      ]}
    />

    <TokenTable
      title="背景"
      tokens={[
        { name: '--bg-base', value: '#eef0f3', desc: 'ページ背景' },
        { name: '--bg-surface', value: '#ffffff', desc: 'カード・パネル背景' },
        { name: '--bg-raised', value: '#f5f6f8', desc: '浮き上がり要素' },
        { name: '--bg-sunken', value: '#e4e6ea', desc: '沈み込み要素' },
        { name: '--bg-hover', value: '#e8eef7', desc: 'ホバー状態' },
        { name: '--bg-active', value: '#d4e2f4', desc: 'アクティブ状態' },
      ]}
    />

    <TokenTable
      title="テキスト"
      tokens={[
        { name: '--text-hi', value: '#0d1520', desc: '高コントラスト（見出し）' },
        { name: '--text-md', value: '#3a4554', desc: '中コントラスト（本文）' },
        { name: '--text-lo', value: '#6b7a8d', desc: '低コントラスト（補助）' },
      ]}
    />

    <TokenTable
      title="ボーダー"
      tokens={[
        { name: '--border-faint', value: 'rgba(0,30,80,.07)', desc: '微弱な境界線' },
        { name: '--border-default', value: 'rgba(0,30,80,.13)', desc: '標準境界線' },
        { name: '--border-strong', value: 'rgba(0,30,80,.22)', desc: '強い境界線' },
        { name: '--border-focus', value: '#0050AA', desc: 'フォーカスリング' },
      ]}
    />

    <TokenTable
      title="シャドウ・半径・フォント"
      tokens={[
        { name: '--shadow-xs', value: '0 1px 2px ...', desc: 'ボタン・バッジ' },
        { name: '--shadow-sm', value: '0 2px 6px ...', desc: 'カード・ドロップダウン' },
        { name: '--shadow-md', value: '0 4px 16px ...', desc: 'モーダル' },
        { name: '--shadow-lg', value: '0 8px 36px ...', desc: 'フローティングパネル' },
        { name: '--radius-sm', value: '4px', desc: '小要素' },
        { name: '--radius-md', value: '6px', desc: 'カード' },
        { name: '--radius-lg', value: '10px', desc: 'モーダル' },
        { name: '--radius-xl', value: '14px', desc: '大パネル' },
        { name: '--font-ui', value: '-apple-system...', desc: 'UIテキスト用' },
        { name: '--font-mono', value: 'SFMono...', desc: '等幅フォント' },
      ]}
    />
  </div>
)

const meta: Meta<typeof CssReference> = {
  title: 'Guide/CssReference',
  component: CssReference,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '全CSS変数の一覧リファレンス。カラー・背景・テキスト・ボーダー・シャドウ・半径・フォントのトークン値。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof CssReference>

export const Default: Story = {}
