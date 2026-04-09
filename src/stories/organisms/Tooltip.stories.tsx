import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from '../../components/Tooltip';

const meta = {
  title: 'Organisms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: {
    label: 'ツールチップテキスト',
    children: <button style={{ padding: '8px 16px', border: '1px solid var(--border-default)', borderRadius: 6, cursor: 'pointer', background: 'var(--bg-surface)', color: 'var(--text-hi)' }}>ホバーしてください</button>,
  },
  argTypes: {
    placement: { control: 'select', options: ['bottom', 'top', 'right'] },
    label: { control: 'text' },
  },
  decorators: [(Story) => <div style={{ padding: 80, display: 'flex', justifyContent: 'center' }}><Story /></div>],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
