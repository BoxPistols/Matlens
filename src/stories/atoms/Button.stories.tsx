import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components/atoms';
import { Icon } from '../../components/Icon';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'ai', 'vec', 'danger', 'ghost', 'outline'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: 'primary', size: 'md', children: 'ボタン' },
};

/** 全バリアント × サイズを一覧表示 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['default', 'primary', 'ai', 'vec', 'danger', 'ghost', 'outline'] as const).map(v => (
        <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 70, fontSize: 12, color: 'var(--text-lo)' }}>{v}</span>
          {(['xs', 'sm', 'md', 'lg'] as const).map(s => (
            <Button key={s} variant={v} size={s}>{s}</Button>
          ))}
          <Button variant={v} size="sm" disabled>disabled</Button>
          <Button variant={v} size="sm"><Icon name="plus" size={12} />アイコン付き</Button>
        </div>
      ))}
    </div>
  ),
};
