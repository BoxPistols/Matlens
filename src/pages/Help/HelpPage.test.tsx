import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

import { HelpPage } from './HelpPage';
import { renderWithContext } from '../../test/helpers';

describe('HelpPage', () => {
  const onNav = vi.fn();
  const setup = () => renderWithContext(<HelpPage onNav={onNav} />);

  it('renders title', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'ヘルプ・用語集' })).toBeInTheDocument();
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

  it('shows page guide doc view when guide tab selected', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    // ドキュメント形式で複数ガイドが表示される
    expect(screen.getAllByText(/ダッシュボード/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/材料データ一覧/).length).toBeGreaterThan(0);
    // セクション見出しが表示される
    expect(screen.getAllByText('概要').length).toBeGreaterThan(0);
    expect(screen.getAllByText('できること').length).toBeGreaterThan(0);
    expect(screen.getAllByText('操作のヒント').length).toBeGreaterThan(0);
  });

  it('guide open-page button calls onNav', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    const openButtons = screen.getAllByText('このページを開く');
    expect(openButtons.length).toBeGreaterThan(0);
    fireEvent.click(openButtons[0]!);
    expect(onNav).toHaveBeenCalledWith('dash');
  });
});
