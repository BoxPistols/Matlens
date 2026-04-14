import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExperimentDashPage } from './ExperimentDashPage';
import { AppCtx } from '../../context/AppContext';
import type { AppContextValue } from '../../types';

vi.mock('chart.js', () => {
  class ChartMock {
    data = { labels: [] as string[], datasets: [{data:[]},{data:[]},{data:[]},{data:[]}] };
    destroy() {}
    update() {}
    resetZoom() {}
    static register() {}
    static defaults = { color: '', borderColor: '', font: { size: 11 } };
  }
  return { Chart: ChartMock, registerables: [] };
});
vi.mock('chartjs-plugin-zoom', () => ({ default: {} }));

const mockCtx: AppContextValue = {
  db: [],
  dispatch: vi.fn(),
  addToast: vi.fn(),
  toasts: [],
  theme: 'light',
  lang: 'ja',
  setLang: vi.fn(),
  t: (ja: string) => ja,
};

const renderPage = () =>
  render(
    <AppCtx.Provider value={mockCtx}>
      <ExperimentDashPage onNav={vi.fn()} />
    </AppCtx.Provider>,
  );

describe('ExperimentDashPage', () => {
  it('ページタイトルが表示される', () => {
    renderPage();
    expect(screen.getByText('加工実験ダッシュボード')).toBeInTheDocument();
  });

  it('実験セレクタに3件のオプションがある', () => {
    renderPage();
    const select = screen.getByRole('combobox', { name: '実験を選択' });
    const options = within(select).getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('Phase 1 条件設定が表示される', () => {
    renderPage();
    expect(screen.getByText('① 条件設定')).toBeInTheDocument();
    // Inconel 718 は subtitle と DefItem の両方に出るので getAllByText で確認
    expect(screen.getAllByText('Inconel 718').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('12,000 rpm')).toBeInTheDocument();
  });

  it('Phase 2 加工中データが表示される', () => {
    renderPage();
    expect(screen.getByText('② 加工中データ')).toBeInTheDocument();
    // 値と単位が別要素に分かれているので、値のみで検索
    expect(screen.getByText('851')).toBeInTheDocument();
  });

  it('加工中の実験では LIVE ボタンが表示される', () => {
    renderPage();
    // LIVE が複数箇所に出る可能性があるので getAllByText
    const liveElements = screen.getAllByText('LIVE');
    expect(liveElements.length).toBeGreaterThanOrEqual(1);
  });

  it('アラートパネルが表示される', () => {
    renderPage();
    expect(screen.getByText('アラート')).toBeInTheDocument();
  });

  it('実験を切り替えると Phase 情報が変わる', async () => {
    renderPage();
    const select = screen.getByRole('combobox', { name: '実験を選択' });
    await userEvent.selectOptions(select, 'EXP-20260414-003');
    expect(screen.getAllByText('Ti-6Al-4V').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('0.8 μm')).toBeInTheDocument();
  });

  it('Phase 3 未完了の実験ではドロップゾーンが表示される', () => {
    renderPage();
    expect(screen.getByText('検査画像・測定データをドロップ')).toBeInTheDocument();
  });

  // ── インタラクティブ機能 ──

  it('Phase パネルの折りたたみ/展開', async () => {
    renderPage();
    const toggle = screen.getByRole('button', { name: /① 条件設定/ });
    expect(screen.getByText('12,000 rpm')).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(screen.queryByText('12,000 rpm')).not.toBeInTheDocument();

    await userEvent.click(toggle);
    expect(screen.getByText('12,000 rpm')).toBeInTheDocument();
  });

  it('ズームリセットボタンが表示される', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'ズームリセット' })).toBeInTheDocument();
  });

  it('一時停止ボタンで LIVE → 再開に切り替わる', async () => {
    renderPage();
    const pauseBtn = screen.getByRole('button', { name: '一時停止' });
    expect(pauseBtn).toBeInTheDocument();

    await userEvent.click(pauseBtn);
    expect(screen.getByRole('button', { name: '再開' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '再開' }));
    expect(screen.getByRole('button', { name: '一時停止' })).toBeInTheDocument();
  });
});
