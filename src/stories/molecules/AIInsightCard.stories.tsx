import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { AIInsightCard } from '../../components/molecules';

const meta = {
  title: 'Molecules/AIInsightCard',
  component: AIInsightCard,
  tags: ['autodocs'],
} satisfies Meta<typeof AIInsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Ti-6Al-4V チタン合金は高強度・低密度で、航空宇宙用途に最適な材料です。引張強度 950 MPa、弾性率 114 GPa を示し、比強度に優れています。',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const WithChips: Story = {
  args: {
    children: 'この材料グループには3つの類似カテゴリがあります。詳細を確認してください。',
    chips: [
      { label: '金属合金を表示', onClick: fn() },
      { label: 'セラミクスと比較', onClick: fn() },
      { label: '強度分布を分析', onClick: fn() },
    ],
  },
};

export const Empty: Story = {
  args: {},
};
