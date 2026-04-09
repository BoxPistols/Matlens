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
    expect(screen.getByText('Ti-6Al-4V チタン合金')).toBeInTheDocument();
  });

  it('shows correct record count', () => {
    setup();
    expect(
      screen.getByText(`${INITIAL_DB.length}件 (DB: ${INITIAL_DB.length}件)`),
    ).toBeInTheDocument();
  });

  it('filter by category shows filtered results', () => {
    setup();
    const selects = screen.getAllByRole('combobox');
    const catSelect = selects.find(
      (s) => s.querySelector('option[value=""]')?.textContent === '全カテゴリ',
    );
    expect(catSelect).toBeTruthy();
    fireEvent.change(catSelect!, { target: { value: 'セラミクス' } });
    expect(screen.queryByText('Ti-6Al-4V チタン合金')).not.toBeInTheDocument();
  });

  it('search filters by text', () => {
    setup();
    const searchInput = screen.getByPlaceholderText(
      '名称・ID・組成・備考で全文検索...',
    );
    fireEvent.change(searchInput, { target: { value: 'PEEK' } });
    expect(screen.getByText('PEEK 熱可塑性樹脂')).toBeInTheDocument();
    expect(screen.queryByText('Ti-6Al-4V チタン合金')).not.toBeInTheDocument();
  });
});
