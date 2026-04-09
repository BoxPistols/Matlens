import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../../components/atoms';

const meta = {
  title: 'Atoms/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'p-4',
    children: '基本的なカードコンポーネントです。テキストやその他の要素を含めることができます。',
  },
};

export const WithShadow: Story = {
  args: {
    className: 'p-4',
    style: { boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,.15))' },
    children: 'シャドウ付きカードです。より強調された表示になります。',
  },
};
