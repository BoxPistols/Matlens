import type { Meta, StoryObj } from '@storybook/react-vite'
import { StoryCode as Code } from '../_shared/StoryCode'

const Step = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
      {num}
    </span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-md)', lineHeight: 1.7 }}>{children}</div>
    </div>
  </div>
)

const ComponentDevelopment = () => (
  <div style={{ maxWidth: 640, fontFamily: 'var(--font-ui)' }}>
    <h1 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>
      コンポーネント開発ガイド
    </h1>
    <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7, marginBottom: 24 }}>
      新しいコンポーネントを追加する際のルールと手順。
    </p>

    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 16 }}>追加手順</h2>

    <Step num="1" title="分類を決定">
      <p>Atom（単機能）/ Molecule（複合）/ Organism（セクション単位）のいずれかに分類します。</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
        {[
          { level: 'Atom', desc: 'Button, Badge, Input等', color: 'var(--accent)' },
          { level: 'Molecule', desc: 'Modal, KpiCard, SearchBox等', color: 'var(--ai-col)' },
          { level: 'Organism', desc: 'Sidebar, Topbar, SupportPanel等', color: 'var(--vec)' },
        ].map(l => (
          <div key={l.level} style={{ padding: 8, borderRadius: 6, border: `1px solid ${l.color}`, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: l.color }}>{l.level}</div>
            <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 2 }}>{l.desc}</div>
          </div>
        ))}
      </div>
    </Step>

    <Step num="2" title="コンポーネントを実装">
      <p>Atom/Moleculeは対応するファイルにexportとして追加します。</p>
      <Code>{`// src/components/atoms.tsx に追加
interface NewCompProps {
  variant?: 'default' | 'primary'
  children: React.ReactNode
}

export const NewComp = ({ variant = 'default', children }: NewCompProps) => (
  <div className={\`new-comp new-comp--\${variant}\`}>
    {children}
  </div>
)`}</Code>
    </Step>

    <Step num="3" title="ストーリーを作成">
      <p>適切なカテゴリにストーリーファイルを作成します。</p>
      <Code>{`// src/stories/03-Components/Atoms/NewComp.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { NewComp } from '../../../components/atoms'

const meta: Meta<typeof NewComp> = {
  title: 'Components/Atoms/NewComp',
  component: NewComp,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'コンポーネントの説明文。',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary'] },
  },
}
export default meta
type Story = StoryObj<typeof NewComp>

export const Default: Story = { args: { children: 'テスト' } }`}</Code>
    </Step>

    <Step num="4" title="テストを追加">
      <p>同じディレクトリにテストファイルを作成します。</p>
      <Code>{`// src/components/atoms.test.tsx に追加
it('NewComp: variant propが反映される', () => {
  render(<NewComp variant="primary">Test</NewComp>)
  expect(screen.getByText('Test')).toHaveClass('new-comp--primary')
})`}</Code>
    </Step>

    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginTop: 24, marginBottom: 12 }}>チェックリスト</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {[
        'CSS変数でスタイリング（ハードコード色値なし）',
        '4テーマで表示確認',
        'tags: [\'autodocs\'] を設定',
        'argTypes でControls UIを定義',
        'parameters.docs.description を記入',
        'Default ストーリーを用意',
        'テストを追加',
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', fontSize: 12, color: 'var(--text-md)' }}>
          <span style={{ width: 16, height: 16, borderRadius: 3, border: '2px solid var(--border-default)', flexShrink: 0 }} />
          {item}
        </div>
      ))}
    </div>
  </div>
)

const meta: Meta<typeof ComponentDevelopment> = {
  title: 'Guide/ComponentDevelopment',
  component: ComponentDevelopment,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '新コンポーネント追加のルール・手順。分類→実装→ストーリー→テストの4ステップ。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ComponentDevelopment>

export const Default: Story = {}
