import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from '../../components/Tooltip';

const meta = {
  title: 'Organisms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: {
    label: 'ツールチップ',
    children: <button style={{ padding: '8px 16px', border: '1px solid var(--border-default)', borderRadius: '6px', cursor: 'pointer' }}>ホバーしてください</button>,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bottom: Story = {
  args: { placement: 'bottom' },
};

export const Top: Story = {
  args: { placement: 'top' },
};

export const Right: Story = {
  args: { placement: 'right' },
};

export const NoLabel: Story = {
  args: { label: undefined },
};
