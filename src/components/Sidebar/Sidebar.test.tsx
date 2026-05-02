import { describe, it, expect, vi, beforeEach } from 'vitest';
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

// IA リファクタ後のテスト。
// - 第 1 階層に直接出るリーフ項目（dash / list / catalog / new / pjlist / matrix 等）と
// - 入れ子グループの親項目（MaiML Studio / 検索（統合）/ 可視化（統合））を区別してテストする。
// - localStorage は各テスト前にクリアして展開状態の汚染を避ける。
describe('Sidebar', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.clear();
      } catch {
        // jsdom 環境で localStorage が無いケースは無視
      }
    }
  });

  it('renders as a nav landmark', () => {
    renderSidebar();
    expect(
      screen.getByRole('navigation', { name: 'メインナビゲーション' }),
    ).toBeInTheDocument();
  });

  it('renders top-level leaf labels visible without expansion', () => {
    renderSidebar();
    for (const label of [
      'ダッシュボード',
      '材料データ一覧',
      '材料カタログ',
      '新規登録',
      '案件',
      '試験マトリクス',
      '損傷ギャラリー',
      'ベイズ最適化',
      '経験式シミュレーション',
      'ペトリネット可視化',
      'ヘルプ・用語集',
      '技術スタック',
      'カテゴリ・バッチ管理',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders the MaiML Studio group as the core entry', () => {
    renderSidebar();
    // MaiML Studio は defaultOpen: true なので children も最初から見える
    expect(screen.getByText('MaiML Studio')).toBeInTheDocument();
    expect(screen.getByText('インポート')).toBeInTheDocument();
    expect(screen.getByText('エクスポート')).toBeInTheDocument();
    expect(screen.getByText('インスペクト')).toBeInTheDocument();
  });

  it('hides search hub children until the parent is expanded', async () => {
    renderSidebar();
    // search-hub は defaultOpen 指定なし → 初期は閉じた状態
    expect(screen.queryByText('意味検索')).not.toBeInTheDocument();
    expect(screen.queryByText('AI チャット')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('検索（統合）'));
    expect(screen.getByText('意味検索')).toBeInTheDocument();
    expect(screen.getByText('AI チャット')).toBeInTheDocument();
  });

  it('auto-expands a parent that contains the current page', () => {
    renderSidebar({ currentPage: 'vsearch' });
    // currentPage が search-hub の子なので親は自動展開され、子も即座に表示される
    expect(screen.getByText('意味検索')).toBeInTheDocument();
  });

  it('renders the new section headers', () => {
    renderSidebar();
    for (const heading of [
      'ホーム',
      'コア',
      'データ',
      '探索',
      '解析',
      '工程',
      'ヘルプ・情報',
      '設定',
    ]) {
      const hits = screen.getAllByText(heading);
      expect(hits.length).toBeGreaterThanOrEqual(1);
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

  it('applies vec-nav active styling for 意味検索 (after expansion)', async () => {
    renderSidebar({ currentPage: 'vsearch' });
    // 自動展開される
    const vecButton = screen.getByText('意味検索').closest('button');
    expect(vecButton!.className).toContain('bg-vec-dim');
    expect(vecButton!.className).toContain('text-vec');
  });

  it('applies ai-nav active styling for AI チャット (after expansion)', async () => {
    renderSidebar({ currentPage: 'rag' });
    const ragButton = screen.getByText('AI チャット').closest('button');
    expect(ragButton!.className).toContain('bg-ai-dim');
    expect(ragButton!.className).toContain('text-ai');
  });

  it('calls onNav when a top-level nav item is clicked', async () => {
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

    // search-hub を開いてから vsearch をクリック
    await userEvent.click(screen.getByText('検索（統合）'));
    await userEvent.click(screen.getByText('意味検索'));
    expect(onNav).toHaveBeenCalledWith('vsearch');

    await userEvent.click(screen.getByText('カテゴリ・バッチ管理'));
    expect(onNav).toHaveBeenCalledWith('settings');
  });

  it('expanding/collapsing a group toggles aria-expanded', async () => {
    renderSidebar();
    const visualizeButton = screen.getByText('可視化（統合）').closest('button')!;
    expect(visualizeButton).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(visualizeButton);
    expect(visualizeButton).toHaveAttribute('aria-expanded', 'true');
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

  it('shows the AI / PoC / CORE badge labels', () => {
    renderSidebar();
    // CORE バッジ（MaiML Studio）
    expect(screen.getByText('CORE')).toBeInTheDocument();
    // AI バッジ（ベイズ最適化はトップレベルなので必ず見える）
    const aiBadges = screen.getAllByText('AI');
    expect(aiBadges.length).toBeGreaterThanOrEqual(1);
    // PoC バッジ（pjlist / matrix 等で複数）
    const pocBadges = screen.getAllByText('PoC');
    expect(pocBadges.length).toBeGreaterThanOrEqual(2);
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
