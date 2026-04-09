import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components/atoms';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Variants ---

export const Default: Story = {
  args: { children: 'デフォルト' },
};

export const Primary: Story = {
  args: { variant: 'primary', children: '保存する' },
};

export const AI: Story = {
  args: { variant: 'ai', children: 'AI 分析' },
};

export const Vec: Story = {
  args: { variant: 'vec', children: 'Vec 検索' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: '削除' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'キャンセル' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: '詳細を見る' },
};

// --- Sizes ---

export const ExtraSmall: Story = {
  args: { size: 'xs', children: '極小' },
};

export const Small: Story = {
  args: { size: 'sm', children: '小' },
};

export const Medium: Story = {
  args: { size: 'md', children: '中' },
};

export const Large: Story = {
  args: { size: 'lg', children: '大' },
};

// --- States ---

export const Disabled: Story = {
  args: { children: '無効', disabled: true },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <span aria-hidden="true">＋</span>
        追加
      </>
    ),
  },
};
