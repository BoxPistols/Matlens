import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../../components/atoms';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: '材料名を入力してください',
  },
};

export const WithError: Story = {
  args: {
    error: true,
    defaultValue: '不正な値',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: '編集不可',
  },
};
