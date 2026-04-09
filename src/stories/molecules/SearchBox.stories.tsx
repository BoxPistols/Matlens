import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { SearchBox } from '../../components/molecules';

const meta = {
  title: 'Molecules/SearchBox',
  component: SearchBox,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof SearchBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: '',
  },
};

export const WithValue: Story = {
  args: {
    value: 'チタン合金',
  },
};

export const WithCustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: '材料名・カテゴリで検索...',
  },
};
