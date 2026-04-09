import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { KpiCard } from '../../components/molecules';

const meta = {
  title: 'Molecules/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '総材料数',
    value: 16,
  },
};

export const WithDelta: Story = {
  args: {
    label: '承認率',
    value: '87.5%',
    delta: '+12.3%',
    deltaUp: true,
  },
};

export const WithNegativeDelta: Story = {
  args: {
    label: '要修正件数',
    value: 3,
    delta: '-2件',
    deltaUp: false,
  },
};

export const WithColor: Story = {
  args: {
    label: '平均硬度 HV',
    value: 642,
    color: 'var(--ai-col)',
  },
};

export const AllKpis: Story = {
  args: { label: '総材料数', value: 16 },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      <KpiCard label="総材料数" value={16} />
      <KpiCard label="承認率" value="87.5%" delta="+12.3%" deltaUp={true} />
      <KpiCard label="要修正" value={3} delta="-2件" deltaUp={false} />
      <KpiCard label="平均硬度 HV" value={642} color="var(--ai-col)" />
    </div>
  ),
};
