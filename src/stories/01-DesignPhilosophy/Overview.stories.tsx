import type { Meta, StoryObj } from '@storybook/react-vite'

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
          信頼感・革新性・共創
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.9, maxWidth: 520 }}>
          材料データの収集・分析・共有を、AIとベクトル検索の力で
          誰にでもアクセスしやすくする。
        </p>
      </div>
    </div>

    {/* Mission */}
    <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Mission</div>
      <p style={{ fontSize: 15, color: 'var(--text-md)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
        エンジニアが材料選定に費やす時間を削減し、<br />
        より良い設計判断を支援する。
      </p>
    </div>

    {/* 3 Principles */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
      {[
        {
          num: '01',
          title: '信頼感',
          subtitle: 'Trust',
          desc: '数値の正確性、ステータス表示の明確さ、エラー処理の透明性で、プロフェッショナルが安心して使えるUIを提供する。',
          gradient: 'linear-gradient(180deg, var(--accent-dim) 0%, transparent 100%)',
          color: 'var(--accent)',
          icon: '◈',
        },
        {
          num: '02',
          title: '革新性',
          subtitle: 'Innovation',
          desc: 'AI分析・ベクトル検索・類似材料推薦を、複雑さを感じさせずに自然に統合する。テクノロジーは黒子に徹する。',
          gradient: 'linear-gradient(180deg, var(--ai-dim) 0%, transparent 100%)',
          color: 'var(--ai-col)',
          icon: '◇',
        },
        {
          num: '03',
          title: '共創',
          subtitle: 'Collaboration',
          desc: '異なるバックグラウンドのエンジニア・研究者・品質管理者が共通言語としてデータを共有できる場を作る。',
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

    {/* UI Guidelines */}
    <div style={{ marginBottom: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>UI Guidelines</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>設計の基本方針</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { icon: '▦', label: 'データ密度重視', desc: 'コンパクトに多くの情報を見せる。材料特性は情報量が多い' },
          { icon: '◫', label: 'コンテキスト保持', desc: '画面遷移を減らし、モーダルとパネルで情報を重ねる' },
          { icon: '㎫', label: '専門用語を尊重', desc: 'HV, MPa, GPa等の工学単位をUIに自然に統合する' },
          { icon: '◐', label: '4テーマ完全対応', desc: '全コンポーネントがCSS変数でテーマに対応する' },
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
        component: 'Matlensのデザイン哲学概要。ミッション、3つのデザイン原則（信頼感・革新性・共創）、UI設計の基本方針。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Overview>

export const Default: Story = {}
