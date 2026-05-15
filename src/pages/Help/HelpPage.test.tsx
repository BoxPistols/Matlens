import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppCtx } from '../../context/AppContext';

import { HelpPage } from './HelpPage';
import { renderWithContext, mockContext } from '../../test/helpers';

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

  it('shows page guide catalog when guide tab selected', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    // カタログ表示で複数ガイドのタイトルが見える（折り畳まれた状態）
    expect(screen.getAllByText(/ダッシュボード/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/材料データ一覧/).length).toBeGreaterThan(0);
    // セクションヘッダ（NAV_ITEMS 由来）が表示される
    expect(screen.getAllByText(/ホーム/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('データ').length).toBeGreaterThan(0);
  });

  it('clicking a guide card expands the detail panel inline', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    // 折り畳み時は詳細見出しが見えない
    expect(screen.queryByText('概要')).not.toBeInTheDocument();
    // ダッシュボードカードを展開
    const dashButton = screen.getAllByRole('button', { expanded: false }).find((b) =>
      b.textContent?.includes('ダッシュボード'),
    );
    expect(dashButton).toBeDefined();
    fireEvent.click(dashButton!);
    expect(screen.getByText('概要')).toBeInTheDocument();
    expect(screen.getByText('できること')).toBeInTheDocument();
    expect(screen.getByText('操作のヒント')).toBeInTheDocument();
  });

  it('guide open-page button calls onNav after expanding card', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    // 「このページを開く」ボタンは展開しないと出ない
    const dashButton = screen.getAllByRole('button', { expanded: false }).find((b) =>
      b.textContent?.includes('ダッシュボード'),
    );
    fireEvent.click(dashButton!);
    const openButton = screen.getByText('このページを開く');
    fireEvent.click(openButton);
    expect(onNav).toHaveBeenCalledWith('dash');
  });

  it('renders "詳しく学ぶ" section after expanding a guide with learnMore links', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    // 切削条件エクスプローラには learnMore が設定されている
    const cuttingButton = screen.getAllByRole('button', { expanded: false }).find((b) =>
      b.textContent?.includes('切削条件エクスプローラ'),
    );
    expect(cuttingButton).toBeDefined();
    fireEvent.click(cuttingButton!);
    expect(screen.getByText('詳しく学ぶ')).toBeInTheDocument();
  });

  it('learn-more links open machining-fundamentals in a new tab with proper rel', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    const cuttingButton = screen.getAllByRole('button', { expanded: false }).find((b) =>
      b.textContent?.includes('切削条件エクスプローラ'),
    );
    fireEvent.click(cuttingButton!);
    const links = screen.getAllByRole('link', { name: /外部サイトで開きます/ });
    expect(links.length).toBeGreaterThan(0);
    const firstLink = links[0]!;
    expect(firstLink.getAttribute('target')).toBe('_blank');
    expect(firstLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(firstLink.getAttribute('href')).toContain('machining-fundamentals');
  });

  it('renders English labels when lang is switched to en', () => {
    const enContext = {
      ...mockContext,
      lang: 'en' as const,
      t: (_ja: string, en?: string) => en ?? _ja,
    };
    render(
      <AppCtx.Provider value={enContext}>
        <HelpPage onNav={onNav} />
      </AppCtx.Provider>,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Page Guide' }));
    // 任意のカードを展開して詳細見出しが英語になることを確認
    const dashButton = screen.getAllByRole('button', { expanded: false }).find((b) =>
      b.textContent?.includes('Dashboard'),
    );
    fireEvent.click(dashButton!);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Tips')).toBeInTheDocument();
    expect(screen.getByText('Open this page')).toBeInTheDocument();
  });

  it('searching narrows the guide list to matching cards', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    const search = screen.getByPlaceholderText('用語を検索...');
    fireEvent.change(search, { target: { value: 'Hall-Petch' } });
    // 検索でヒットするガイドのカードが残る（=ヒットゼロでは「該当するガイドが見つかりません」が出る）
    expect(screen.queryByText('該当するガイドが見つかりません')).not.toBeInTheDocument();
  });

  it('shows "not found" message when search has no hits', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    const search = screen.getByPlaceholderText('用語を検索...');
    fireEvent.change(search, { target: { value: 'zzz-no-such-keyword-zzz' } });
    expect(screen.getByText('該当するガイドが見つかりません')).toBeInTheDocument();
  });

  it('closing a manually-opened card stays closed (no reopen loop)', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    const dashButton = screen.getAllByRole('button', { expanded: false }).find((b) =>
      b.textContent?.includes('ダッシュボード'),
    );
    fireEvent.click(dashButton!);
    expect(screen.getByText('概要')).toBeInTheDocument();
    fireEvent.click(screen.getByText('閉じる'));
    expect(screen.queryByText('概要')).not.toBeInTheDocument();
  });
});
