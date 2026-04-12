import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';

const defaultProps = {
  currentPage: 'dash',
  onNav: vi.fn(),
  collapsed: false,
  onToggle: vi.fn(),
  dbCount: 150,
  embStatus: 'ready',
  embCount: 150,
};

const renderSidebar = (overrides = {}) =>
  render(<Sidebar {...defaultProps} {...overrides} />);

describe('Sidebar', () => {
  it('renders as a nav landmark', () => {
    renderSidebar();
    expect(screen.getByRole('navigation', { name: 'メインナビゲーション' })).toBeInTheDocument();
  });

  it('renders the current NAV_ITEMS labels', () => {
    renderSidebar();
    // Kept in sync with src/data/constants.ts NAV_ITEMS. Update this list
    // when the nav schema changes rather than re-adding individual
    // assertions scattered through the test file.
    for (const label of [
      'ダッシュボード',
      '材料データ一覧',
      '材料カタログ',
      '新規登録',
      '意味検索',
      'AI チャット',
      '類似材料を比較',
      'ヘルプ・用語集',
      '技術スタック',
      'API テスト',
      'テストスイート',
      'UX設計ノート',
      'カテゴリ・バッチ管理',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders section headers from NAV_ITEMS', () => {
    renderSidebar();
    for (const heading of [
      '概要',
      'データ入力',
      'AI 分析・検索',
      'ヘルプ・情報',
      '開発者向け',
      '設定',
    ]) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
  });

  it('highlights active page with aria-current', () => {
    renderSidebar({ currentPage: 'list' });
    const listButton = screen.getByText('材料データ一覧').closest('button');
    expect(listButton).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive pages', () => {
    renderSidebar({ currentPage: 'dash' });
    const listButton = screen.getByText('材料データ一覧').closest('button');
    expect(listButton).not.toHaveAttribute('aria-current');
  });

  it('applies active styling classes on current page', () => {
    renderSidebar({ currentPage: 'dash' });
    const dashButton = screen.getByText('ダッシュボード').closest('button');
    expect(dashButton!.className).toContain('bg-accent-dim');
    expect(dashButton!.className).toContain('font-semibold');
  });

  it('applies vec-nav active styling for 意味検索', () => {
    renderSidebar({ currentPage: 'vsearch' });
    const vecButton = screen.getByText('意味検索').closest('button');
    expect(vecButton!.className).toContain('bg-vec-dim');
    expect(vecButton!.className).toContain('text-vec');
  });

  it('applies ai-nav active styling for AI チャット', () => {
    renderSidebar({ currentPage: 'rag' });
    const ragButton = screen.getByText('AI チャット').closest('button');
    expect(ragButton!.className).toContain('bg-ai-dim');
    expect(ragButton!.className).toContain('text-ai');
  });

  it('calls onNav when a nav item is clicked', async () => {
    const onNav = vi.fn();
    renderSidebar({ onNav });
    await userEvent.click(screen.getByText('新規登録'));
    expect(onNav).toHaveBeenCalledWith('new');
  });

  it('calls onNav with the correct page id for various items', async () => {
    const onNav = vi.fn();
    renderSidebar({ onNav });

    await userEvent.click(screen.getByText('材料データ一覧'));
    expect(onNav).toHaveBeenCalledWith('list');

    await userEvent.click(screen.getByText('意味検索'));
    expect(onNav).toHaveBeenCalledWith('vsearch');

    await userEvent.click(screen.getByText('カテゴリ・バッチ管理'));
    expect(onNav).toHaveBeenCalledWith('settings');
  });

  it('hides labels when collapsed', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText('ダッシュボード')).not.toBeInTheDocument();
    expect(screen.queryByText('材料データ一覧')).not.toBeInTheDocument();
  });

  it('adds collapsed class to nav element when collapsed', () => {
    renderSidebar({ collapsed: true });
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('collapsed');
  });

  it('does not have collapsed class when expanded', () => {
    renderSidebar({ collapsed: false });
    const nav = screen.getByRole('navigation');
    expect(nav).not.toHaveClass('collapsed');
  });

  it('shows the toggle button (expanded state)', () => {
    renderSidebar();
    expect(screen.getByLabelText('サイドバーを折り畳む')).toBeInTheDocument();
  });

  it('shows the expand label when collapsed', () => {
    renderSidebar({ collapsed: true });
    expect(screen.getByLabelText('サイドバーを展開')).toBeInTheDocument();
  });

  it('calls onToggle when the toggle button is clicked', async () => {
    const onToggle = vi.fn();
    renderSidebar({ onToggle });
    await userEvent.click(screen.getByLabelText('サイドバーを折り畳む'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows the db count badge on the material list item', () => {
    renderSidebar({ dbCount: 250 });
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('shows the current badge labels for AI / Dev / 3D items', () => {
    renderSidebar();
    // These mirror NAV_ITEMS[].badgeLabel values
    const threeDbadges = screen.getAllByText('3D');
    expect(threeDbadges.length).toBeGreaterThanOrEqual(1);
    const aiBadges = screen.getAllByText('AI');
    expect(aiBadges.length).toBeGreaterThanOrEqual(2); // 意味検索 + AI チャット
    const devBadges = screen.getAllByText('Dev');
    expect(devBadges.length).toBeGreaterThanOrEqual(2); // API テスト + テストスイート
  });

  it('hides the db count badge when collapsed', () => {
    renderSidebar({ collapsed: true, dbCount: 250 });
    expect(screen.queryByText('250')).not.toBeInTheDocument();
  });

  it('shows the embedding ready status in the footer', () => {
    renderSidebar({ embStatus: 'ready', embCount: 42 });
    expect(screen.getByText('42件 Ready')).toBeInTheDocument();
  });

  it('shows the fallback status in the footer', () => {
    renderSidebar({ embStatus: 'fallback', embCount: 0 });
    expect(screen.getByText('キーワード検索')).toBeInTheDocument();
  });

  it('shows the initializing status in the footer', () => {
    renderSidebar({ embStatus: 'loading', embCount: 0 });
    expect(screen.getByText('初期化中...')).toBeInTheDocument();
  });

  it('shows the MENU label when expanded', () => {
    renderSidebar({ collapsed: false });
    expect(screen.getByText(/MENU/i)).toBeInTheDocument();
  });

  it('hides the MENU label when collapsed', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText(/MENU/i)).not.toBeInTheDocument();
  });
});
