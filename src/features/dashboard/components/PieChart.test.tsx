import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PieChart } from './PieChart';

describe('PieChart', () => {
  it('renders title and legend entries with label + value + percent', () => {
    render(
      <PieChart
        title="試験種別分布"
        slices={[
          { label: '引張試験', value: 3 },
          { label: '硬度試験', value: 1 },
        ]}
      />,
    );
    // aria-label で識別できる
    expect(screen.getByRole('figure', { name: '試験種別分布' })).toBeInTheDocument();
    // 凡例の label + 件数 + % 表記が出ている
    expect(screen.getByText('引張試験')).toBeInTheDocument();
    expect(screen.getByText('3（75%）')).toBeInTheDocument();
    expect(screen.getByText('硬度試験')).toBeInTheDocument();
    expect(screen.getByText('1（25%）')).toBeInTheDocument();
  });

  it('renders "データなし" when total is zero', () => {
    render(<PieChart title="空の分布" slices={[]} />);
    expect(screen.getByText('空の分布')).toBeInTheDocument();
    expect(screen.getByText('データなし')).toBeInTheDocument();
  });

  it('omits legend when showLegend is false', () => {
    render(
      <PieChart
        title="分布"
        showLegend={false}
        slices={[{ label: 'A', value: 1 }]}
      />,
    );
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('renders a single slice as a full circle (value === total)', () => {
    const { container } = render(
      <PieChart title="単一" slices={[{ label: 'Only', value: 10 }]} />,
    );
    // 単一 100% のとき、スライスは 1 本の path で完全円を描く
    const paths = container.querySelectorAll('svg path');
    expect(paths.length).toBe(1);
  });
});
