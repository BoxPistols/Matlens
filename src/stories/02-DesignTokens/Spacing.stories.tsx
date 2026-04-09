import type { Meta, StoryObj } from '@storybook/react-vite'

const SPACING = [2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48] as const

const SpacingScale = () => (
  <div style={{ fontFamily: 'var(--font-ui)' }}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 100px',
        gap: '8px',
        padding: '8px 0',
        borderBottom: '1px solid var(--border-default)',
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>値</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>プレビュー</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tailwind</span>
    </div>
    {SPACING.map(px => (
      <div
        key={px}
        style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 100px',
          gap: '8px',
          alignItems: 'center',
          padding: '6px 0',
          borderBottom: '1px solid var(--border-faint)',
        }}
      >
        <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
          {px}px
        </code>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: px,
              height: 16,
              borderRadius: 2,
              background: 'var(--accent)',
              opacity: 0.7,
            }}
          />
        </div>
        <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-lo)' }}>
          {px / 4}
        </code>
      </div>
    ))}

    <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-raised)', borderRadius: 8, border: '1px solid var(--border-faint)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
        ボーダー半径
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { token: '--radius-sm', label: 'sm (4px)' },
          { token: '--radius-md', label: 'md (6px)' },
          { token: '--radius-lg', label: 'lg (10px)' },
          { token: '--radius-xl', label: 'xl (14px)' },
        ].map(r => (
          <div key={r.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: `var(${r.token})`,
                background: 'var(--accent-dim)',
                border: '2px solid var(--accent)',
              }}
            />
            <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-lo)' }}>{r.label}</code>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const meta: Meta<typeof SpacingScale> = {
  title: 'DesignTokens/Spacing',
  component: SpacingScale,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'スペーシングスケール（2px〜48px）とボーダー半径トークンの一覧。Tailwindスケール値も併記。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof SpacingScale>

export const Default: Story = {}
