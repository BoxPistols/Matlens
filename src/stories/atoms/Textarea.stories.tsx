import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '../../components/atoms';

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: '備考やコメントを入力してください',
  },
};
