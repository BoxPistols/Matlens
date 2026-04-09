import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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

  it('renders navigation items', () => {
    renderSidebar();
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('材料データ一覧')).toBeInTheDocument();
    expect(screen.getByText('新規登録')).toBeInTheDocument();
    expect(screen.getByText('ベクトル検索')).toBeInTheDocument();
    expect(screen.getByText('RAG チャット')).toBeInTheDocument();
    expect(screen.getByText('類似材料探索')).toBeInTheDocument();
    expect(screen.getByText('API デバッグ')).toBeInTheDocument();
    expect(screen.getByText('テストスイート')).toBeInTheDocument();
    expect(screen.getByText('UX設計ガイド')).toBeInTheDocument();
    expect(screen.getByText('ヘルプ・用語集')).toBeInTheDocument();
    expect(screen.getByText('技術スタック')).toBeInTheDocument();
    expect(screen.getByText('マスタ管理')).toBeInTheDocument();
  });

  it('renders section headers', () => {
    renderSidebar();
    expect(screen.getByText('メイン')).toBeInTheDocument();
    expect(screen.getByText('データ管理')).toBeInTheDocument();
    expect(screen.getByText('AI / ベクトル')).toBeInTheDocument();
    expect(screen.getByText('開発ツール')).toBeInTheDocument();
    expect(screen.getByText('ドキュメント')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
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

  it('applies vec-nav active styling for vector search', () => {
    renderSidebar({ currentPage: 'vsearch' });
    const vecButton = screen.getByText('ベクトル検索').closest('button');
    expect(vecButton!.className).toContain('bg-vec-dim');
    expect(vecButton!.className).toContain('text-vec');
  });

  it('applies ai-nav active styling for RAG chat', () => {
    renderSidebar({ currentPage: 'rag' });
    const ragButton = screen.getByText('RAG チャット').closest('button');
    expect(ragButton!.className).toContain('bg-ai-dim');
    expect(ragButton!.className).toContain('text-ai');
  });

  it('calls onNav when a nav item is clicked', async () => {
    const onNav = vi.fn();
    renderSidebar({ onNav });
    await userEvent.click(screen.getByText('新規登録'));
    expect(onNav).toHaveBeenCalledWith('new');
  });

  it('calls onNav with correct page id for various items', async () => {
    const onNav = vi.fn();
    renderSidebar({ onNav });

    await userEvent.click(screen.getByText('材料データ一覧'));
    expect(onNav).toHaveBeenCalledWith('list');

    await userEvent.click(screen.getByText('ベクトル検索'));
    expect(onNav).toHaveBeenCalledWith('vsearch');

    await userEvent.click(screen.getByText('マスタ管理'));
    expect(onNav).toHaveBeenCalledWith('settings');
  });

  it('shows collapsed state - hides labels', () => {
    renderSidebar({ collapsed: true });
    // In collapsed mode, labels are not rendered (the !collapsed conditional hides them)
    expect(screen.queryByText('ダッシュボード')).not.toBeInTheDocument();
    expect(screen.queryByText('材料データ一覧')).not.toBeInTheDocument();
  });

  it('adds collapsed class on nav element when collapsed', () => {
    renderSidebar({ collapsed: true });
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('collapsed');
  });

  it('does not have collapsed class when expanded', () => {
    renderSidebar({ collapsed: false });
    const nav = screen.getByRole('navigation');
    expect(nav).not.toHaveClass('collapsed');
  });

  it('shows toggle button', () => {
    renderSidebar();
    expect(screen.getByLabelText('サイドバーを折り畳む')).toBeInTheDocument();
  });

  it('shows expand label when collapsed', () => {
    renderSidebar({ collapsed: true });
    expect(screen.getByLabelText('サイドバーを展開')).toBeInTheDocument();
  });

  it('calls onToggle when toggle button clicked', async () => {
    const onToggle = vi.fn();
    renderSidebar({ onToggle });
    await userEvent.click(screen.getByLabelText('サイドバーを折り畳む'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows db count badge on material list item', () => {
    renderSidebar({ dbCount: 250 });
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('shows badge labels for nav items', () => {
    renderSidebar();
    expect(screen.getByText('VSS')).toBeInTheDocument();
    expect(screen.getByText('RAG')).toBeInTheDocument();
    expect(screen.getByText('Mock')).toBeInTheDocument();
    expect(screen.getByText('Unit')).toBeInTheDocument();
  });

  it('hides db count badge when collapsed', () => {
    renderSidebar({ collapsed: true, dbCount: 250 });
    expect(screen.queryByText('250')).not.toBeInTheDocument();
  });

  it('shows embedding status in the footer when expanded', () => {
    renderSidebar({ embStatus: 'ready', embCount: 42 });
    expect(screen.getByText('42件 Ready')).toBeInTheDocument();
  });

  it('shows fallback status in footer', () => {
    renderSidebar({ embStatus: 'fallback', embCount: 0 });
    expect(screen.getByText('キーワード検索')).toBeInTheDocument();
  });

  it('shows initializing status in footer', () => {
    renderSidebar({ embStatus: 'loading', embCount: 0 });
    expect(screen.getByText('初期化中...')).toBeInTheDocument();
  });

  it('shows Menu label when expanded', () => {
    renderSidebar({ collapsed: false });
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('hides Menu label when collapsed', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByText('Menu')).not.toBeInTheDocument();
  });
});
