import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { FormGroup, Input } from '../../components/atoms';

const meta = {
  title: 'Atoms/FormGroup',
  component: FormGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof FormGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '材料名',
    children: <Input placeholder="例: SUS304" />,
  },
};

export const Required: Story = {
  args: {
    label: '材料名',
    required: true,
    children: <Input placeholder="必須項目です" />,
  },
};

export const WithHint: Story = {
  args: {
    label: 'ロット番号',
    hint: '英数字とハイフンのみ使用できます',
    children: <Input placeholder="例: LOT-2026-001" />,
  },
};

export const WithError: Story = {
  args: {
    label: '硬度',
    required: true,
    error: '有効な数値を入力してください',
    children: <Input error defaultValue="abc" />,
  },
};
