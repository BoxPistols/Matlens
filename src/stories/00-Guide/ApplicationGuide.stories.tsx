import type { Meta, StoryObj } from '@storybook/react-vite'

// プロダクトが提供する機能の俯瞰。レビュー者がスコープと優先度を一目で把握するためのページ。

const Section = ({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>{title}</h2>
    {lead && <p style={{ fontSize: 13, color: 'var(--text-lo)', lineHeight: 1.7, marginBottom: 12 }}>{lead}</p>}
    {children}
  </section>
)

const Pill = ({ label, tone = 'accent' }: { label: string; tone?: 'accent' | 'ok' | 'warn' | 'vec' }) => {
  const color = `var(--${tone === 'accent' ? 'accent' : tone})`
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 700,
        color: color,
        background: `${color}1c`,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  )
}

const ApplicationGuide = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 6, letterSpacing: '-0.02em' }}>
      アプリケーションガイド
    </h1>
    <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.8, marginBottom: 28 }}>
      入力・検索・一覧・詳細の 4 画面を中心に、材料研究現場の課題
      (入力煩雑さ・検索性・業務フロー分断・発見性) に直接応える機能を実装しています。
    </p>

    <Section title="機能スコープ" lead="UI / UX 設計とフロントエンド実装に集中し、データ基盤は REST API 前提でモック化。">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {[
          { title: '入力', desc: 'ステップ式ウィザード + 単位変換', tone: 'accent' as const },
          { title: '検索', desc: 'ファセット + 保存済クエリ + Vector 候補', tone: 'vec' as const },
          { title: '一覧', desc: '密度トグル + 多視点フィルタ', tone: 'ok' as const },
          { title: '詳細', desc: 'provenance + 経験式 + ベイズ最適化', tone: 'warn' as const },
        ].map(s => (
          <div
            key={s.title}
            style={{
              padding: 14,
              borderRadius: 10,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ marginBottom: 6 }}>
              <Pill label={s.title} tone={s.tone} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-md)', lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="優先施策マトリクス (2026-04 策定 / 04-20 更新)" lead="研究現場の課題への直結度 × 差別化の観点で決定。切削プロセス系は Day 1 で数学・UI とも実装済。">
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
        <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-raised)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: 'var(--text-lo)', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: 'var(--text-lo)', textTransform: 'uppercase' }}>施策</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: 'var(--text-lo)', textTransform: 'uppercase' }}>状態</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['A-1', 'ステップ式入力ウィザード', '実装済'],
              ['A-2', 'ファセット検索 + 保存済クエリ', '実装済'],
              ['A-3', 'ワークフロー連動ナビゲーション', '中'],
              ['B-1', 'ベイズ最適化 (2D GP)', '実装済'],
              ['B-2', 'ペトリネット強化 (rework + PNML)', '中'],
              ['B-3', '経験式シミュレーション (4 式)', '実装済'],
              ['B-4', 'provenance バッジ', '実装済'],
              ['C-1', '受託試験 Signature Screens (8 画面)', '実装済'],
              ['C-2', '切削プロセス数学 (Taylor / Kienzle / SLD)', '実装済'],
              ['C-3', '切削 UI 統合 (SLD / Kc / Taylor パネル)', '実装済'],
              ['C-4', 'MaiML (JIS K 0200:2024) エクスポート', '未着手'],
            ] as const).map(([id, name, pri]) => (
              <tr key={id} style={{ borderTop: '1px solid var(--border-faint)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text-hi)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{id}</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-md)' }}>{name}</td>
                <td style={{ padding: '8px 12px' }}>
                  <Pill label={pri} tone={pri === '実装済' ? 'ok' : pri === '未着手' ? 'warn' : 'accent'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>

    <Section
      title="現場入り準備キット (2026-04-20)"
      lead="ヒアリング前の素材と、これまでの判断ログをリポジトリ内に格納。Storybook からはリンクで辿れるようになっています。"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {[
          {
            heading: 'ヒアリング素材',
            path: 'docs/onsite/',
            bullets: [
              '画面別ヒアリングシート (11 画面)',
              'ペルソナ別ワークフロー仮説 (4 ペルソナ)',
              '既存ツール比較マトリクス (LIMS / Excel / CAM)',
              '痛み候補カタログ (30 件)',
              '知識ギャップ棚卸し (規格 / 輸出管理 / 連携 / 報告書)',
            ],
            tone: 'vec' as const,
          },
          {
            heading: '設計判断ログ (ADR)',
            path: 'docs/adr/',
            bullets: [
              'ADR-001 レイヤードアーキテクチャ',
              'ADR-002 切削ドメイン分離',
              'ADR-003 決定論的 fixture',
              'ADR-005 Stability Lobe 段階実装',
              'ADR-009 純 SVG + 依存ゼロ可視化',
              'ADR-010 Stage 2 集計 / 検索境界',
              '他、フロント系 10 本 + インフラ系 7 本',
            ],
            tone: 'warn' as const,
          },
        ].map(kit => (
          <div
            key={kit.heading}
            style={{ padding: 14, borderRadius: 10, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Pill label={kit.heading} tone={kit.tone} />
              <code style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-lo)' }}>{kit.path}</code>
            </div>
            <ul style={{ fontSize: 12.5, color: 'var(--text-md)', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
              {kit.bullets.map(b => <li key={b}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>

    <Section title="制約と前提" lead="UI / UX 設計と実装に集中するために明示している境界線。">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>バックエンド・DB は REST API 前提でモックに差し替え可能な構成</li>
        <li>本番環境への載せ替えを想定し、依存を最小限に抑えた設計</li>
        <li>Storybook 上では実データではなく MaiML 相当のモック構造で検証</li>
        <li>国際利用を想定し、日英バイリンガル切替を前提とする</li>
      </ul>
    </Section>
  </div>
)

const meta: Meta<typeof ApplicationGuide> = {
  title: 'Guide/ApplicationGuide',
  component: ApplicationGuide,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'プロダクトの機能スコープ・優先度・制約。' } },
  },
}

export default meta
type Story = StoryObj<typeof ApplicationGuide>
export const Default: Story = {}
