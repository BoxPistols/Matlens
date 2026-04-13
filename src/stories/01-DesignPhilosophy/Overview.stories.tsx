import type { Meta, StoryObj } from '@storybook/react-vite'

// プロダクトが拠って立つ 3 つの価値軸。材料研究データの UI で意味を持つ言葉で再定義する。

const Overview = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    {/* Hero */}
    <div
      style={{
        padding: '48px 40px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--ai-col) 50%, var(--vec) 100%)',
        color: '#fff',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>Design Philosophy</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
          厳密さ・発見性・可搬性
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.9, maxWidth: 520 }}>
          金属・物質研究のデータを、記録・探索・解釈の各局面で研究者が迷わず進められる UI を提供する。
        </p>
      </div>
    </div>

    {/* Mission */}
    <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Mission</div>
      <p style={{ fontSize: 15, color: 'var(--text-md)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
        研究現場が材料特性データの登録・検索・解釈に費やす摩擦を減らし、<br />
        より良い材料選定・工程判断を支援する。
      </p>
    </div>

    {/* 3 Principles */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
      {[
        {
          num: '01',
          title: '厳密さ',
          subtitle: 'Fidelity',
          desc: '数値・単位・出自を曖昧にしない。測定器由来か、手入力か、AI 推定かを画面上で区別する。',
          gradient: 'linear-gradient(180deg, var(--accent-dim) 0%, transparent 100%)',
          color: 'var(--accent)',
          icon: '◈',
        },
        {
          num: '02',
          title: '発見性',
          subtitle: 'Discoverability',
          desc: '蓄積したデータの中から類似材料・条件に辿り着ける。ファセット・ベクトル・履歴を同じ画面で重ねる。',
          gradient: 'linear-gradient(180deg, var(--ai-dim) 0%, transparent 100%)',
          color: 'var(--ai-col)',
          icon: '◇',
        },
        {
          num: '03',
          title: '可搬性',
          subtitle: 'Portability',
          desc: 'テーマ・言語・データ基盤が変わっても UI の振る舞いは変わらない。依存は境界で吸収する。',
          gradient: 'linear-gradient(180deg, var(--vec-dim) 0%, transparent 100%)',
          color: 'var(--vec)',
          icon: '◆',
        },
      ].map(p => (
        <div
          key={p.num}
          style={{
            padding: '32px 24px',
            borderRadius: 14,
            background: p.gradient,
            textAlign: 'center',
            transition: 'transform 0.2s',
          }}
        >
          <div style={{ fontSize: 32, color: p.color, marginBottom: 8, opacity: 0.6 }}>{p.icon}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: p.color, letterSpacing: '.08em', marginBottom: 4 }}>{p.num}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 2 }}>{p.title}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: p.color, marginBottom: 12 }}>{p.subtitle}</div>
          <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7 }}>{p.desc}</p>
        </div>
      ))}
    </div>

    {/* Principle → UI manifestation */}
    <div style={{ marginBottom: 48 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Mapping</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>UI への現れ方</h2>
      </div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-raised)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase' }}>原則</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase' }}>具体的な UI 要素</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['厳密さ', 'provenance バッジ / 単位付き入力 (MPa, HV) / 有効桁数表示 / データ出典リンク'],
              ['発見性', 'ファセット検索 / 保存済クエリ / ベクトル類似候補 / ベイズ最適化の提案'],
              ['可搬性', '4 テーマ (Light/Dark/Eng/CAE) / 日英辞書 / API 境界でのモック差替え'],
            ] as const).map(([pr, ui]) => (
              <tr key={pr} style={{ borderTop: '1px solid var(--border-faint)' }}>
                <td style={{ padding: '10px 14px', color: 'var(--text-hi)', fontWeight: 700 }}>{pr}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-md)' }}>{ui}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* UI Guidelines */}
    <div style={{ marginBottom: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>UI Guidelines</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>設計の基本方針</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { icon: '▦', label: 'データ密度重視', desc: '材料特性は情報量が多い。コンパクトに多くの情報を同時表示する' },
          { icon: '◫', label: 'コンテキスト保持', desc: '画面遷移を減らし、モーダル・パネルで情報を重ねて積む' },
          { icon: '㎫', label: '専門用語と単位を尊重', desc: 'MPa / GPa / HV / wt% などを UI に自然に統合する' },
          { icon: '◐', label: '4 テーマ完全対応', desc: 'すべてのコンポーネントが CSS 変数でテーマに追従する' },
        ].map(item => (
          <div
            key={item.label}
            style={{
              padding: '24px 20px',
              borderRadius: 12,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.5 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const meta: Meta<typeof Overview> = {
  title: 'Design Philosophy/Overview',
  component: Overview,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'プロダクトのデザイン哲学。ミッション、3 つの原則 (厳密さ・発見性・可搬性)、UI 設計の基本方針。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Overview>

export const Default: Story = {}
