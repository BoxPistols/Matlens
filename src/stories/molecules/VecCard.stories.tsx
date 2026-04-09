import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VecCard } from '../../components/molecules';

const meta = {
  title: 'Molecules/VecCard',
  component: VecCard,
  tags: ['autodocs'],
} satisfies Meta<typeof VecCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Embedding 次元数: 384 / インデックス済み: 16件 / 最近の検索: "高強度チタン合金"',
  },
};

export const WithClassName: Story = {
  args: {
    children: 'カスタムクラスが適用されたベクトルカードです。ベクトル空間内の類似材料を検索できます。',
    className: 'mt-4 mb-4',
  },
};
