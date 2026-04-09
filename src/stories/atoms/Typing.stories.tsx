import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typing } from '../../components/atoms';

const meta = {
  title: 'Atoms/Typing',
  component: Typing,
  tags: ['autodocs'],
} satisfies Meta<typeof Typing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const AIColor: Story = {
  args: {
    color: 'var(--ai-col, #a855f7)',
  },
};

export const VecColor: Story = {
  args: {
    color: 'var(--vec, #22d3ee)',
  },
};
