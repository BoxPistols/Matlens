import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '../../components/atoms';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};
