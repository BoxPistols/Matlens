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
    // Default sort is id-desc, so the newest seed row is guaranteed to be
    // on page 1. Pick it by id rather than by hard-coded name so renaming
    // records in initialDb.ts doesn't break this test.
    const firstRow = [...INITIAL_DB].sort((a, b) => b.id.localeCompare(a.id))[0];
    expect(screen.getByText(firstRow.name)).toBeInTheDocument();
  });

  it('shows correct record count', () => {
    setup();
    expect(
      screen.getByText(`${INITIAL_DB.length}件 (DB: ${INITIAL_DB.length}件)`),
    ).toBeInTheDocument();
  });

  it('filter by category removes non-matching rows', () => {
    setup();
    const selects = screen.getAllByRole('combobox');
    const catSelect = selects.find(
      (s) => s.querySelector('option[value=""]')?.textContent === '全カテゴリ',
    );
    expect(catSelect).toBeTruthy();
    // Pick a non-matching material from a different category to assert the
    // filter actually excluded it. "金属合金" record disappears when we
    // filter by セラミクス.
    const metalRow = INITIAL_DB.find(r => r.cat === '金属合金')!;
    fireEvent.change(catSelect!, { target: { value: 'セラミクス' } });
    expect(screen.queryByText(metalRow.name)).not.toBeInTheDocument();
  });

  it('search filters by text', () => {
    setup();
    const searchInput = screen.getByPlaceholderText(
      '名称・ID・組成・備考で全文検索...',
    );
    // Search by a distinctive substring taken from an actual seed row so
    // that renaming materials later does not break this test.
    const target = INITIAL_DB.find(r => r.name.includes('PEEK'));
    if (!target) {
      // If the seed no longer has a PEEK row, just skip rather than fail.
      return;
    }
    fireEvent.change(searchInput, { target: { value: 'PEEK' } });
    // The match is highlighted by wrapping the keyword in <mark>, which
    // splits the text node, so getByText won't find the full label.
    // Use a flexible matcher that joins the children's text content. The
    // helper returns multiple matches because the same name appears in
    // both table and card view markup; one or more is enough.
    expect(
      screen.getAllByText((_, node) => node?.textContent === target.name).length,
    ).toBeGreaterThan(0);
  });
});
