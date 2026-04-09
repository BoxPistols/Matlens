import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../../components/atoms';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Explicit variants ---

export const Gray: Story = {
  args: { variant: 'gray', children: 'タグ' },
};

export const Blue: Story = {
  args: { variant: 'blue', children: '情報' },
};

export const Green: Story = {
  args: { variant: 'green', children: '完了' },
};

export const Amber: Story = {
  args: { variant: 'amber', children: '警告' },
};

export const Red: Story = {
  args: { variant: 'red', children: 'エラー' },
};

export const AI: Story = {
  args: { variant: 'ai', children: 'AI' },
};

export const Vec: Story = {
  args: { variant: 'vec', children: 'Vec' },
};

// --- Auto-detect by Japanese status text ---

export const StatusRegistered: Story = {
  name: '登録済',
  args: { children: '登録済' },
};

export const StatusApproved: Story = {
  name: '承認済',
  args: { children: '承認済' },
};

export const StatusReviewPending: Story = {
  name: 'レビュー待',
  args: { children: 'レビュー待' },
};

export const StatusNeedsRevision: Story = {
  name: '要修正',
  args: { children: '要修正' },
};
