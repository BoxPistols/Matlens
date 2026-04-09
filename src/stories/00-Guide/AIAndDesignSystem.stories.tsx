import type { Meta, StoryObj } from '@storybook/react-vite'

const AIAndDesignSystem = () => (
  <div style={{ maxWidth: 700, fontFamily: 'var(--font-ui)' }}>
    {/* Hero */}
    <div
      style={{
        padding: '40px 36px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, var(--ai-dim) 0%, var(--vec-dim) 100%)',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 20, right: 30, fontSize: 80, opacity: 0.08, color: 'var(--ai-col)', fontWeight: 900 }}>AI</div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ai-col)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Guide</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 8 }}>AI とデザインシステム</h1>
        <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.7, maxWidth: 500 }}>
          MatlensにおけるAI機能の位置づけと、デザインシステムとの連携方法。
        </p>
      </div>
    </div>

    {/* Component Grid */}
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 16 }}>AI関連コンポーネント</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { name: 'AIInsightCard', desc: 'AI分析結果の表示。loading状態・チップアクション対応', color: 'var(--ai-col)', gradient: 'var(--ai-dim)', ref: 'Molecules > DataCards' },
          { name: 'VecCard', desc: 'ベクトル検索結果の表示。類似度スコア等', color: 'var(--vec)', gradient: 'var(--vec-dim)', ref: 'Molecules > DataCards' },
          { name: 'MarkdownBubble', desc: 'AI応答のMarkdownレンダリング。テーブル・コードブロック対応', color: 'var(--ai-col)', gradient: 'var(--ai-dim)', ref: 'Molecules > DataCards' },
          { name: 'Typing', desc: 'AI処理中のインジケーター。カラーカスタマイズ可能', color: 'var(--ai-col)', gradient: 'var(--ai-dim)', ref: 'Atoms > Misc' },
          { name: 'ChatSupport', desc: 'Storybookコンシェルジュ。FAQ/Guide/AIの3層回答', color: 'var(--accent)', gradient: 'var(--accent-dim)', ref: '右下のFABボタン' },
          { name: 'SupportPanel', desc: 'ヘルプ/FAQ/AI設定の3タブパネル', color: 'var(--accent)', gradient: 'var(--accent-dim)', ref: 'Organisms' },
        ].map(c => (
          <div
            key={c.name}
            style={{
              padding: '20px',
              borderRadius: 12,
              background: c.gradient,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 12, right: 14, width: 8, height: 8, borderRadius: '50%', background: c.color, opacity: 0.5 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 6 }}>{c.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.6, marginBottom: 8 }}>{c.desc}</div>
            <div style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>{c.ref}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Color Convention */}
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 16 }}>カラー規約</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: 'AI機能', token: '--ai-col', color: 'var(--ai-col)', gradient: 'linear-gradient(135deg, var(--ai-col), var(--ai-mid))' },
          { label: 'ベクトル検索', token: '--vec', color: 'var(--vec)', gradient: 'linear-gradient(135deg, var(--vec), var(--vec-mid))' },
          { label: 'アクセント', token: '--accent', color: 'var(--accent)', gradient: 'linear-gradient(135deg, var(--accent), var(--accent-mid))' },
        ].map(c => (
          <div key={c.label} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: c.gradient,
                margin: '0 auto 10px',
                boxShadow: `0 4px 16px ${c.color}33`,
              }}
            />
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 2 }}>{c.label}</div>
            <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-lo)' }}>{c.token}</code>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7, marginTop: 16, textAlign: 'center' }}>
        AI機能には <code style={{ fontSize: 12, color: 'var(--ai-col)', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'var(--ai-dim)', borderRadius: 4 }}>--ai-col</code>、
        ベクトル検索には <code style={{ fontSize: 12, color: 'var(--vec)', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'var(--vec-dim)', borderRadius: 4 }}>--vec</code> を一貫して使用してください。
      </p>
    </section>

    {/* ChatSupport How-To */}
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 16 }}>ChatSupport の使い方</h2>
      <div
        style={{
          padding: '28px',
          borderRadius: 14,
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7, marginBottom: 20 }}>
          Storybookの右下に表示される <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 700, verticalAlign: 'middle' }}>?</span> ボタンをクリックするとチャットパネルが開きます。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'FAQ', color: 'var(--ok)', gradient: 'var(--ok-dim)', desc: 'キーワードで即答。APIキー不要' },
            { label: 'Guide', color: 'var(--vec)', gradient: 'var(--vec-dim)', desc: '閲覧中ストーリーのコンテキスト情報' },
            { label: 'AI', color: 'var(--ai-col)', gradient: 'var(--ai-dim)', desc: 'OpenAI/Geminiに質問。APIキー必要' },
          ].map(s => (
            <div
              key={s.label}
              style={{
                padding: '16px',
                borderRadius: 10,
                background: s.gradient,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-md)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
)

const meta: Meta<typeof AIAndDesignSystem> = {
  title: 'Guide/AIAndDesignSystem',
  component: AIAndDesignSystem,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'MatlensのAI機能とデザインシステムの連携。AI関連コンポーネント、カラー規約、ChatSupportの使い方。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof AIAndDesignSystem>

export const Default: Story = {}
