import type { Meta, StoryObj } from '@storybook/react-vite'

const Section = ({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>{title}</h2>
    {lead && <p style={{ fontSize: 13, color: 'var(--text-lo)', lineHeight: 1.7, marginBottom: 10 }}>{lead}</p>}
    {children}
  </section>
)

const Compare = ({ rows }: { rows: [string, string, string][] }) => (
  <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
    <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: 'var(--bg-raised)' }}>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: 'var(--text-lo)', textTransform: 'uppercase' }}>観点</th>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: 'var(--text-lo)', textTransform: 'uppercase' }}>MUI</th>
          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: 'var(--text-lo)', textTransform: 'uppercase' }}>Tailwind + CSS変数 (Matlens)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, a, b]) => (
          <tr key={k} style={{ borderTop: '1px solid var(--border-faint)' }}>
            <td style={{ padding: '8px 12px', color: 'var(--text-hi)', fontWeight: 600 }}>{k}</td>
            <td style={{ padding: '8px 12px', color: 'var(--text-md)' }}>{a}</td>
            <td style={{ padding: '8px 12px', color: 'var(--text-md)' }}>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const MuiTailwind = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 6, letterSpacing: '-0.02em' }}>
      MUI を使わない判断
    </h1>
    <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 24 }}>
      Matlens は MUI を採用せず、<strong>Tailwind + CSS 変数 + 自作プリミティブ</strong>の最小セットで構築しています。
      技術的決断の背景を残しておきます。
    </p>

    <Section title="比較表">
      <Compare
        rows={[
          ['初期依存量', '~2 MB (ThemeProvider 含む)', '< 100 KB (Tailwind のみ)'],
          ['テーマ切替', 'ThemeProvider 再描画', 'data-theme 属性 + CSS 変数 (再描画なし)'],
          ['動的スタイル', 'sx prop / styled()', 'Tailwind クラス + CSS 変数'],
          ['バンドル最適化', 'tree-shake は部分的', 'Tailwind JIT で未使用クラス削除'],
          ['学習コスト', 'API が多い', 'HTML/CSS 知識の延長'],
          ['デザイナー共通言語', 'MD トークンに同期必要', 'CSS 変数を Figma と 1:1 マッピング'],
        ]}
      />
    </Section>

    <Section title="採用理由サマリ">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>4 テーマ切替 (light/dark/eng/cae) を <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>data-theme</code> 属性の付替えで完結させたい</li>
        <li>将来的な環境移行時の依存削減 (別基盤への載せ替え容易性)</li>
        <li>科学計算系コンポーネント (GP / ペトリネット / 3D ビューワ) は自作中心のため、UI ライブラリの形を強制しない方が整合</li>
        <li>Storybook 上の学習コスト低減 (純 CSS / Tailwind のため前提知識の延長で読める)</li>
      </ul>
    </Section>

    <Section title="MUI を使う場面の例外">
      <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.8 }}>
        今のところ Matlens 本体コードでは MUI 不使用。
        将来的に <strong>DataGrid Pro 相当</strong>や <strong>複雑な Date Range Picker</strong>が必要になった場合は、
        該当画面に限定して導入する方針 (全面採用しない)。
      </p>
    </Section>
  </div>
)

const meta: Meta<typeof MuiTailwind> = {
  title: 'Guide/MuiTailwind',
  component: MuiTailwind,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'MUI ではなく Tailwind + CSS 変数を選んだ理由と比較。' } } },
}
export default meta
type Story = StoryObj<typeof MuiTailwind>
export const Default: Story = {}
