import type { Meta, StoryObj } from '@storybook/react-vite'

const ForDesigners = () => (
  <div style={{ maxWidth: 640, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>
      デザイナー向けガイド
    </h1>
    <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7, marginBottom: 24 }}>
      Figma → コード対応表、トークン参照方法、デザインレビューのポイント。
    </p>

    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 12 }}>Figma ↔ コード対応表</h2>
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-raised)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-lo)', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid var(--border-default)' }}>Figma</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-lo)', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid var(--border-default)' }}>コード</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-lo)', fontSize: 12, textTransform: 'uppercase', borderBottom: '1px solid var(--border-default)' }}>用途</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Primary Button', '<Button variant="primary">', '主要アクション'],
              ['Ghost Button', '<Button variant="ghost">', '補助アクション'],
              ['AI Badge', '<Badge variant="ai">', 'AI関連ラベル'],
              ['Vec Badge', '<Badge variant="vec">', 'ベクトル検索ラベル'],
              ['Section Card', '<SectionCard title="...">', 'セクション区切り'],
              ['Unit Input', '<UnitInput unit="MPa">', '単位付き入力'],
              ['KPI Card', '<KpiCard label="..." value="...">', '数値指標表示'],
              ['AI Insight', '<AIInsightCard>', 'AI分析結果'],
            ].map(([figma, code, usage], i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                <td style={{ padding: '6px 12px', color: 'var(--text-hi)' }}>{figma}</td>
                <td style={{ padding: '6px 12px' }}>
                  <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{code}</code>
                </td>
                <td style={{ padding: '6px 12px', color: 'var(--text-lo)' }}>{usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 12 }}>トークン参照方法</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { figma: 'brand/accent', css: 'var(--accent)', tw: 'text-accent', swatch: 'var(--accent)' },
          { figma: 'semantic/error', css: 'var(--err)', tw: 'text-err', swatch: 'var(--err)' },
          { figma: 'bg/surface', css: 'var(--bg-surface)', tw: 'bg-bg-surface', swatch: 'var(--bg-surface)' },
          { figma: 'text/primary', css: 'var(--text-hi)', tw: 'text-text-hi', swatch: 'var(--text-hi)' },
        ].map(t => (
          <div
            key={t.figma}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-faint)',
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: 4, background: t.swatch, border: '1px solid var(--border-default)', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-md)' }}>{t.figma}</span>
              <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{t.css}</code>
              <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-lo)' }}>{t.tw}</code>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 12 }}>デザインレビューチェックリスト</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          '4テーマ全てで表示確認したか',
          'ハードコードされた色値がないか（CSS変数を使用）',
          'Empty/Loading/Error/Partial/Ideal の5状態を考慮したか',
          '工学単位（HV, MPa, GPa等）が正しく表示されるか',
          'フォントサイズがスケール表（10-19px）に収まっているか',
          'タッチターゲットが最低36x36pxあるか',
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              padding: '6px 0',
              fontSize: 12,
              color: 'var(--text-md)',
              lineHeight: 1.5,
            }}
          >
            <span style={{ width: 18, height: 18, borderRadius: 3, border: '2px solid var(--border-default)', flexShrink: 0, marginTop: 1 }} />
            {item}
          </div>
        ))}
      </div>
    </section>
  </div>
)

const meta: Meta<typeof ForDesigners> = {
  title: 'Guide/ForDesigners',
  component: ForDesigners,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'デザイナー向けガイド。Figma↔コード対応表、トークン参照方法、デザインレビューチェックリスト。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ForDesigners>

export const Default: Story = {}
