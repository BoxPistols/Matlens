import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from '../../components/atoms';

const meta = {
  title: 'Atoms/Divider',
  component: Divider,
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
