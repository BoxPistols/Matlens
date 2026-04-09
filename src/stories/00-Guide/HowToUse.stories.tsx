import type { Meta, StoryObj } from '@storybook/react-vite'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 8 }}>{title}</h2>
    {children}
  </div>
)

const CodeBlock = ({ children }: { children: string }) => (
  <pre
    style={{
      padding: 12,
      borderRadius: 6,
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-faint)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text-hi)',
      overflowX: 'auto',
      lineHeight: 1.6,
    }}
  >
    {children}
  </pre>
)

const HowToUse = () => (
  <div style={{ maxWidth: 640, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 16 }}>
      使い方ガイド
    </h1>

    <Section title="Storybook の起動">
      <CodeBlock>{`npm run storybook\n# → http://localhost:6006`}</CodeBlock>
    </Section>

    <Section title="コンポーネントの使い方">
      <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7, marginBottom: 8 }}>
        各コンポーネントには Controls パネルが用意されています。
        右側の「Controls」タブでプロパティを変更し、リアルタイムで動作を確認できます。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { step: '1', text: 'サイドバーからコンポーネントを選択' },
          { step: '2', text: 'Default ストーリーで基本形を確認' },
          { step: '3', text: 'Controls パネルでプロパティを操作' },
          { step: '4', text: 'Docs タブで API ドキュメントを確認' },
        ].map(s => (
          <div
            key={s.step}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 6,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-faint)',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {s.step}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-md)' }}>{s.text}</span>
          </div>
        ))}
      </div>
    </Section>

    <Section title="テーマの切替">
      <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7 }}>
        上部ツールバーの <strong>Theme</strong> セレクターで 4 テーマを切り替えられます。
        全コンポーネントが CSS 変数でテーマに対応しているため、切替時にリアルタイムで配色が変わります。
      </p>
    </Section>

    <Section title="インポート例">
      <CodeBlock>{`import { Button, Card, Badge } from '../components/atoms'\nimport { Modal, KpiCard } from '../components/molecules'\nimport { Icon } from '../components/Icon'`}</CodeBlock>
    </Section>
  </div>
)

const meta: Meta<typeof HowToUse> = {
  title: 'Guide/HowToUse',
  component: HowToUse,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Storybookの使い方ガイド。起動方法、コンポーネントの探し方、テーマ切替、インポート例。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof HowToUse>

export const Default: Story = {}
