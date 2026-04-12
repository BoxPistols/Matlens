import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { MaterialListPage } from './MaterialListPage';
import { renderWithContext, mockContext, INITIAL_DB } from '../../test/helpers';

describe('MaterialListPage', () => {
  const onNav = vi.fn();
  const onDetail = vi.fn();
  const search = vi.fn().mockResolvedValue([]);

  const setup = () =>
    renderWithContext(
      <MaterialListPage
        db={INITIAL_DB}
        dispatch={mockContext.dispatch}
        onNav={onNav}
        onDetail={onDetail}
        search={search}
      />,
    );

  it('renders page title', () => {
    setup();
    expect(screen.getByText('材料データ一覧')).toBeInTheDocument();
  });

  it('shows material data in table', () => {
    setup();
    const firstRow = [...INITIAL_DB].sort((a, b) => b.id.localeCompare(a.id))[0]!;
    expect(screen.getByText(firstRow.name)).toBeInTheDocument();
  });

  it('shows correct record count', () => {
    setup();
    expect(
      screen.getByText(`${INITIAL_DB.length}件 (DB: ${INITIAL_DB.length}件)`),
    ).toBeInTheDocument();
  });

  it('faceted filter by category removes non-matching rows', () => {
    setup();
    fireEvent.click(screen.getByText('詳細条件'));
    const ceramicsBtn = screen.getAllByRole('button').find(
      btn => btn.textContent?.startsWith('セラミクス')
    );
    expect(ceramicsBtn).toBeTruthy();
    fireEvent.click(ceramicsBtn!);
    const metalRow = INITIAL_DB.find(r => r.cat === '金属合金')!;
    expect(screen.queryByText(metalRow.name)).not.toBeInTheDocument();
  });

  it('search filters by text', () => {
    setup();
    const searchInput = screen.getByPlaceholderText(
      '名称・ID・組成・備考で全文検索...',
    );
    const target = INITIAL_DB.find(r => r.name.includes('PEEK'));
    if (!target) return;
    fireEvent.change(searchInput, { target: { value: 'PEEK' } });
    expect(
      screen.getAllByText((_, node) => node?.textContent === target.name).length,
    ).toBeGreaterThan(0);
  });

  it('shows preset panel with default presets', () => {
    setup();
    fireEvent.click(screen.getByText('プリセット'));
    expect(screen.getByText('承認済み金属合金')).toBeInTheDocument();
    expect(screen.getByText('高硬度材 (HV≥500)')).toBeInTheDocument();
    expect(screen.getByText('レビュー待ち')).toBeInTheDocument();
  });

  it('advanced panel toggle works', () => {
    setup();
    // Initially no AI checkbox visible
    expect(screen.queryByLabelText(/AI検出のみ/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('詳細条件'));
    // After opening, AI checkbox should be visible
    expect(screen.getByText('AI検出のみ')).toBeInTheDocument();
  });
});
