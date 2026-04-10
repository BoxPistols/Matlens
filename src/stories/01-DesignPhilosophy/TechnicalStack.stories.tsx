import type { Meta, StoryObj } from '@storybook/react-vite'

const TechnicalStack = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    {/* Hero */}
    <div
      style={{
        padding: '40px 36px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--vec-dim) 100%)',
        marginBottom: 40,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Design Philosophy</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 8 }}>Technical Stack</h1>
      <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.7, maxWidth: 500 }}>
        Matlensの技術スタック、CSS変数トークンシステム、4テーマアーキテクチャ。
      </p>
    </div>

    {/* Stack Layers */}
    {[
      {
        title: 'フロントエンド',
        color: 'var(--accent)',
        gradient: 'linear-gradient(135deg, var(--accent), var(--accent-mid))',
        items: [
          { name: 'React 19', role: 'UIフレームワーク' },
          { name: 'TypeScript', role: '型安全性' },
          { name: 'Vite', role: 'ビルド・開発サーバー' },
          { name: 'Tailwind CSS', role: 'ユーティリティCSS' },
        ],
      },
      {
        title: 'AI / 検索',
        color: 'var(--ai-col)',
        gradient: 'linear-gradient(135deg, var(--ai-col), var(--ai-mid))',
        items: [
          { name: 'OpenAI API', role: 'AI分析・インサイト' },
          { name: 'Gemini API', role: '代替AIプロバイダー' },
          { name: 'ベクトル検索', role: '類似材料推薦' },
          { name: 'RAG', role: '知識拡張検索' },
        ],
      },
      {
        title: '開発ツール',
        color: 'var(--vec)',
        gradient: 'linear-gradient(135deg, var(--vec), var(--vec-mid))',
        items: [
          { name: 'Storybook 10', role: 'コンポーネントカタログ' },
          { name: 'Vitest', role: 'ユニットテスト' },
          { name: 'ESLint', role: 'リンティング' },
        ],
      },
    ].map(layer => (
      <div key={layer.title} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: layer.gradient }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)' }}>{layer.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {layer.items.map(item => (
            <div
              key={item.name}
              style={{
                padding: '14px 20px',
                borderRadius: 10,
                background: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-xs)',
                flex: '1 1 140px',
                minWidth: 140,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 4 }}>{item.role}</div>
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Token System */}
    <div style={{ marginTop: 12, marginBottom: 32 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Architecture</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>CSS変数トークンシステム</h2>
      </div>
      <div
        style={{
          padding: '24px',
          borderRadius: 14,
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7, marginBottom: 16 }}>
          CSS変数（カスタムプロパティ）をベースとしたトークンシステム。
          Tailwind CSSのユーティリティクラスと組み合わせて使用します。
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-raised)', padding: 16, borderRadius: 10, lineHeight: 2 }}>
          <div style={{ color: 'var(--text-lo)' }}>{'/* data-theme 属性でテーマ切替 */'}</div>
          <div><span style={{ color: 'var(--accent)' }}>{'[data-theme="light"]'}</span> {'{'}</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: 'var(--vec)' }}>--accent</span>: <span style={{ color: 'var(--text-md)' }}>#004590</span>;</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: 'var(--vec)' }}>--bg-base</span>: <span style={{ color: 'var(--text-md)' }}>#eef0f3</span>;</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: 'var(--vec)' }}>--text-hi</span>: <span style={{ color: 'var(--text-md)' }}>#0d1520</span>;</div>
          <div>{'}'}</div>
        </div>
      </div>
    </div>

    {/* 4 Themes */}
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Themes</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>4テーマアーキテクチャ</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {[
          { theme: 'Light', attr: 'light', accent: '#004590', bg: '#eef0f3', desc: 'ブルー基調で明るくクリーン' },
          { theme: 'Dark', attr: 'dark', accent: '#5a9ae0', bg: '#10141c', desc: 'ネイビー基調で目に優しい' },
          { theme: 'Eng', attr: 'eng', accent: '#00c896', bg: '#1a1f26', desc: 'グリーン+等幅フォント' },
          { theme: 'CAE', attr: 'cae', accent: '#e89020', bg: '#0e1014', desc: 'オレンジ+等幅フォント' },
        ].map(t => (
          <div
            key={t.attr}
            style={{
              padding: '20px',
              borderRadius: 12,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ width: 40, height: 24, borderRadius: 6, background: t.accent, boxShadow: `0 2px 8px ${t.accent}33` }} />
              <div style={{ width: 40, height: 12, borderRadius: 4, background: t.bg, border: '1px solid var(--border-default)' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)' }}>{t.theme}</div>
              <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-lo)' }}>data-theme="{t.attr}"</code>
              <div style={{ fontSize: 12, color: 'var(--text-md)', marginTop: 4 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const meta: Meta<typeof TechnicalStack> = {
  title: 'Design Philosophy/TechnicalStack',
  component: TechnicalStack,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '技術スタック一覧、CSS変数ベースのトークンシステム解説、4テーマアーキテクチャの概要。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof TechnicalStack>

export const Default: Story = {}
