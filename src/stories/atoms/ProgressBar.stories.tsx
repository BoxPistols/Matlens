import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from '../../components/atoms';

const meta = {
  title: 'Atoms/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
};

export const Full: Story = {
  args: {
    value: 100,
  },
};

export const Low: Story = {
  args: {
    value: 10,
  },
};

export const CustomColor: Story = {
  args: {
    value: 70,
    color: 'var(--ai-col, #a855f7)',
  },
};
