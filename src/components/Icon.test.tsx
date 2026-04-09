import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon, IconName } from './Icon';

const ALL_ICONS: IconName[] = [
  'dashboard','list','plus','search','vecSearch','rag',
  'similar','mic','help','about','settings',
  'chevronLeft','chevronRight','chevronDown','close','check',
  'edit','trash','download','upload','copy','speaker',
  'stop','refresh','play','spark','embed','warning',
  'info','filter','sort','pdf','json','csv','report',
  'ai','scan',
];

describe('Icon', () => {
  it.each(ALL_ICONS)('renders without crashing for icon name "%s"', (name) => {
    const { container } = render(<Icon name={name} />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    // should contain an svg child
    expect(span!.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<Icon name="dashboard" size={32} />);
    const span = container.querySelector('span');
    expect(span).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('renders with default size of 16', () => {
    const { container } = render(<Icon name="dashboard" />);
    const span = container.querySelector('span');
    expect(span).toHaveStyle({ width: '16px', height: '16px' });
  });

  it('renders with custom className', () => {
    const { container } = render(<Icon name="search" className="text-red-500" />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-red-500');
  });

  it('applies default inline-flex classes', () => {
    const { container } = render(<Icon name="plus" />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('inline-flex', 'items-center', 'justify-center', 'flex-shrink-0');
  });

  it('has role="img" and aria-hidden="true"', () => {
    render(<Icon name="dashboard" />);
    const el = screen.getByRole('img', { hidden: true });
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('returns null content for an invalid icon name', () => {
    const { container } = render(<Icon name={'nonexistent' as IconName} />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    // span should have no SVG child since ICONS['nonexistent'] is undefined -> null
    expect(span!.querySelector('svg')).not.toBeInTheDocument();
    expect(span!.childNodes.length).toBe(0);
  });
});
