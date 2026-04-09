import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { SectionCard, Button } from '../../components/atoms';

const meta = {
  title: 'Atoms/SectionCard',
  component: SectionCard,
  tags: ['autodocs'],
} satisfies Meta<typeof SectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '材料概要',
    children: 'ここにセクションの内容が表示されます。材料に関する詳細情報を記載できます。',
  },
};

export const WithAction: Story = {
  args: {
    title: '試験結果',
    action: <Button size="xs">編集</Button>,
    children: 'アクションボタン付きのセクションカードです。',
  },
};
