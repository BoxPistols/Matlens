import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon, type IconName } from './Icon';

// Full set of icon names supported by the component. Keep this in sync with
// the IconName union in Icon.tsx.
const ALL_ICONS: IconName[] = [
  'dashboard', 'list', 'plus', 'search', 'vecSearch', 'rag',
  'similar', 'mic', 'help', 'about', 'settings',
  'chevronLeft', 'chevronRight', 'chevronDown', 'close', 'check',
  'edit', 'trash', 'download', 'upload', 'copy', 'speaker',
  'stop', 'refresh', 'play', 'spark', 'embed', 'warning',
  'info', 'filter', 'sort', 'pdf', 'json', 'csv', 'report',
  'ai', 'scan',
];

describe('Icon', () => {
  it.each(ALL_ICONS)('renders an <svg> for "%s"', (name) => {
    const { container } = render(<Icon name={name} />);
    // lucide-react renders the icon as an <svg> directly — no wrapper.
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with a custom size', () => {
    const { container } = render(<Icon name="dashboard" size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('defaults to size 16 when no size prop is given', () => {
    const { container } = render(<Icon name="dashboard" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('applies a custom className to the svg element', () => {
    const { container } = render(<Icon name="search" className="text-red-500" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-red-500');
  });

  it('keeps the default inline-flex / flex-shrink-0 utility classes', () => {
    const { container } = render(<Icon name="plus" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('inline-flex', 'flex-shrink-0');
  });

  it('renders nothing for an unknown icon name', () => {
    const { container } = render(<Icon name={'nonexistent' as IconName} />);
    // Unknown names return null, so there should be no <svg> in the tree.
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
