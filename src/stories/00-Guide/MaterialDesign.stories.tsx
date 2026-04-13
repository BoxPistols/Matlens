import type { Meta, StoryObj } from '@storybook/react-vite'

const Section = ({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>{title}</h2>
    {lead && <p style={{ fontSize: 13, color: 'var(--text-lo)', lineHeight: 1.7, marginBottom: 10 }}>{lead}</p>}
    {children}
  </section>
)

const MaterialDesign = () => (
  <div style={{ maxWidth: 680, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 6, letterSpacing: '-0.02em' }}>
      Material Design の影響範囲
    </h1>
    <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 24 }}>
      Matlens は MUI コンポーネントを直接使用していませんが、
      Material Design のレイヤー／エレベーション／余白の概念は土台として参考にしています。
    </p>

    <Section title="採用している原則">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>情報階層を影 (elevation) と背景段差で示す — <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>--bg-base / --bg-surface / --bg-raised</code></li>
        <li>タッチターゲット最小 44×44px を尊重</li>
        <li>モーション基準 (標準 150–250ms, イージング easeOutCubic)</li>
        <li>8px グリッドの派生 (Matlens は 4px ベース)</li>
      </ul>
    </Section>

    <Section title="意図的に外している原則">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>MD3 の Dynamic Color — エンタープライズ用途で意図せぬ彩度変化を嫌うため</li>
        <li>Ripple エフェクト — 科学計測系 UI で過剰演出になるため</li>
        <li>FAB (Floating Action Button) — 研究ツールで主操作が明示的なため不要</li>
      </ul>
    </Section>

    <Section title="Matlens 独自の拡張">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>4 テーマ (Light/Dark/Eng/CAE) — 用途別配色系</li>
        <li>データ出自バッジ (provenance) — 測定器／手入力／AI 推定を明示</li>
        <li>経験式・ベイズ最適化等の科学計算コンポーネント群</li>
      </ul>
    </Section>
  </div>
)

const meta: Meta<typeof MaterialDesign> = {
  title: 'Guide/MaterialDesign',
  component: MaterialDesign,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Material Design の採用/非採用範囲と Matlens 独自拡張。' } } },
}
export default meta
type Story = StoryObj<typeof MaterialDesign>
export const Default: Story = {}
