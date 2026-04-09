import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from '../../components/atoms';

const meta = {
  title: 'Atoms/Kbd',
  component: Kbd,
  tags: ['autodocs'],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '⌘+Enter',
  },
};

export const Single: Story = {
  args: {
    children: 'Esc',
  },
};
