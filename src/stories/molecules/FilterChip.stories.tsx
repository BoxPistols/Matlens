import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { FilterChip } from '../../components/molecules';

const meta = {
  title: 'Molecules/FilterChip',
  component: FilterChip,
  tags: ['autodocs'],
  args: {
    onRemove: fn(),
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '金属合金',
  },
};

export const Multiple: Story = {
  args: { label: '金属合金' },
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <FilterChip label="金属合金" onRemove={fn()} />
      <FilterChip label="セラミクス" onRemove={fn()} />
      <FilterChip label="ポリマー" onRemove={fn()} />
      <FilterChip label="複合材料" onRemove={fn()} />
    </div>
  ),
};
