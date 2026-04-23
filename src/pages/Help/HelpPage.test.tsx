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

  it('renders "詳しく学ぶ" section for guides with learnMore links', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    // PAGE_GUIDES に learnMore が設定されている画面（cutting-conditions / tools / mat-master / ops-dash）
    // のいずれかで「詳しく学ぶ」セクションが表示される
    expect(screen.getAllByText('詳しく学ぶ').length).toBeGreaterThan(0);
  });

  it('learn-more links open machining-fundamentals in a new tab with proper rel', () => {
    setup();
    fireEvent.click(screen.getByRole('tab', { name: 'ページガイド' }));
    // Vc / f / ap のリンク（切削条件エクスプローラの learnMore エントリ）は
    // 必ず存在する — glossaryMapping で動作確認済み
    const links = screen.getAllByRole('link', { name: /外部サイトで開きます/ });
    expect(links.length).toBeGreaterThan(0);
    const firstLink = links[0]!;
    expect(firstLink.getAttribute('target')).toBe('_blank');
    expect(firstLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(firstLink.getAttribute('href')).toContain('machining-fundamentals');
  });

  it('renders English labels when lang is switched to en', () => {
    // lang='en' のカスタムコンテキストで render
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
    // セクション見出しが英語になる
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tips').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Learn More').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Open this page').length).toBeGreaterThan(0);
  });
});
