import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../../components/atoms';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['gray', 'blue', 'green', 'amber', 'red', 'ai', 'vec'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: 'blue', children: 'ラベル' },
};

/** 全カラーバリアント + ステータス自動判定を一覧表示 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-lo)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>明示バリアント</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['gray', 'blue', 'green', 'amber', 'red', 'ai', 'vec'] as const).map(v => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-lo)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>ステータス自動判定</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['登録済', '承認済', 'レビュー待', '要修正'].map(s => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </div>
    </div>
  ),
};
