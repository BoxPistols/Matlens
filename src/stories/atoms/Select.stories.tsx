import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Select } from '../../components/atoms';

const meta = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <option value="">選択してください</option>
        <option value="a">オプション A</option>
        <option value="b">オプション B</option>
        <option value="c">オプション C</option>
      </>
    ),
  },
};

export const WithCategories: Story = {
  args: {
    children: (
      <>
        <option value="">カテゴリを選択</option>
        <option value="metal">金属合金</option>
        <option value="ceramic">セラミックス</option>
        <option value="polymer">高分子材料</option>
        <option value="composite">複合材料</option>
      </>
    ),
  },
};
