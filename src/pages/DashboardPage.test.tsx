import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';
import { renderWithContext, mockClaude, INITIAL_DB } from '../test/helpers';

vi.mock('marked', () => ({
  marked: { parse: (s: string) => s, setOptions: vi.fn() },
}));

describe('DashboardPage', () => {
  const onNav = vi.fn();

  const setup = () =>
    renderWithContext(
      <DashboardPage db={INITIAL_DB} onNav={onNav} claude={mockClaude} />,
    );

  it('renders dashboard title', () => {
    setup();
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
  });

  it('shows KPI cards', () => {
    setup();
    expect(screen.getByText('総データ件数')).toBeInTheDocument();
    expect(screen.getByText('実験バッチ数')).toBeInTheDocument();
    expect(screen.getByText('レビュー待ち')).toBeInTheDocument();
    expect(screen.getByText('AI 検出')).toBeInTheDocument();
  });

  it('shows AI insight section', () => {
    setup();
    expect(mockClaude.call).toHaveBeenCalled();
  });

  it('renders chart canvases', () => {
    const { container } = setup();
    const canvases = container.querySelectorAll('canvas');
    expect(canvases.length).toBe(4);
  });

  it('calls onNav when AI分析 button clicked', () => {
    setup();
    fireEvent.click(screen.getByText('AI 分析'));
    expect(onNav).toHaveBeenCalledWith('rag');
  });

  it('calls onNav when 登録 button clicked', () => {
    setup();
    fireEvent.click(screen.getByText('登録'));
    expect(onNav).toHaveBeenCalledWith('new');
  });
});
