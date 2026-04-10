import type { Meta, StoryObj } from '@storybook/react-vite'

const Introduction = () => (
  <div style={{ maxWidth: 700, fontFamily: 'var(--font-ui)' }}>
    {/* Hero */}
    <div
      style={{
        padding: '52px 40px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-mid) 100%)',
        color: '#fff',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: -30, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', bottom: -50, left: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>Design System</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>Matlens</h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.9, maxWidth: 480 }}>
          材料データベースの登録・検索・AI分析を行うエンジニアリングツール。
          UIコンポーネント、デザイントークン、複合パターンのカタログです。
        </p>
      </div>
    </div>

    {/* Themes */}
    <section style={{ marginBottom: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Themes</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>4つのテーマ</h2>
        <p style={{ fontSize: 13, color: 'var(--text-lo)', marginTop: 4 }}>上部ツールバーの Theme セレクターで切り替えてください</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { name: 'Light', attr: 'light', accent: '#004590', bg: '#eef0f3', desc: '標準テーマ' },
          { name: 'Dark', attr: 'dark', accent: '#5a9ae0', bg: '#10141c', desc: 'ダークモード' },
          { name: 'Eng', attr: 'eng', accent: '#00c896', bg: '#1a1f26', desc: 'エンジニアリング' },
          { name: 'CAE', attr: 'cae', accent: '#e89020', bg: '#0e1014', desc: 'CAE解析' },
        ].map(t => (
          <div
            key={t.attr}
            style={{
              padding: '20px 14px',
              borderRadius: 12,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: t.accent, boxShadow: `0 2px 8px ${t.accent}44` }} />
              <div style={{ width: 28, height: 28, borderRadius: 8, background: t.bg, border: '1px solid var(--border-default)' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 2 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Structure */}
    <section style={{ marginBottom: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Structure</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>構成</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { code: '00-Guide', desc: '使い方ガイド・プロジェクト概要', color: 'var(--accent)' },
          { code: '01-DesignPhilosophy', desc: 'デザイン哲学・設計原則', color: 'var(--ai-col)' },
          { code: '02-DesignTokens', desc: 'Color, Typography, Spacing, Shadows', color: 'var(--vec)' },
          { code: '03-Components', desc: 'Atoms / Molecules / Organisms', color: 'var(--warn)' },
          { code: '04-Patterns', desc: 'Dashboard, FormLayout, SearchResults', color: 'var(--ok)' },
        ].map((item, i) => (
          <div
            key={item.code}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 20px',
              borderRadius: 10,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${item.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: item.color,
                flexShrink: 0,
              }}
            >
              {String(i).padStart(2, '0')}
            </div>
            <div style={{ flex: 1 }}>
              <code style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: item.color, fontWeight: 600 }}>{item.code}</code>
              <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 2 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Tech Stack */}
    <section>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Stack</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>技術スタック</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Storybook 10'].map(t => (
          <span
            key={t}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xs)',
              color: 'var(--text-hi)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  </div>
)

const meta: Meta<typeof Introduction> = {
  title: 'Guide/Introduction',
  component: Introduction,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Matlens デザインシステムの概要。テーマ・構成・技術スタックを紹介。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Introduction>

export const Default: Story = {}
