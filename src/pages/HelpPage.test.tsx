import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import { HelpPage } from './HelpPage';

describe('HelpPage', () => {
  const setup = () => render(<HelpPage />);

  it('renders title', () => {
    setup();
    expect(screen.getByText('ヘルプ・用語集')).toBeInTheDocument();
  });

  it('shows category filter tabs', () => {
    setup();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole('tab', { name: 'すべて' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '材料工学' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'AI / ML' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'システム' })).toBeInTheDocument();
  });

  it('shows glossary terms', () => {
    setup();
    expect(
      screen.getByText('硬度（ビッカース硬さ）'),
    ).toBeInTheDocument();
    expect(screen.getByText('引張強さ')).toBeInTheDocument();
  });

  it('filter by category shows relevant terms', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'AI / ML' }));
    expect(
      screen.getByText('Embedding（埋め込み表現）'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('コサイン類似度'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('硬度（ビッカース硬さ）'),
    ).not.toBeInTheDocument();
  });
});
