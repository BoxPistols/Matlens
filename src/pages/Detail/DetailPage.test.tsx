import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { DetailPage } from './DetailPage';
import {
  renderWithContext,
  mockContext,
  mockClaude,
  mockEmbedding,
  INITIAL_DB,
} from '../../test/helpers';

vi.mock('marked', () => ({
  marked: { parse: (s: string) => s, setOptions: vi.fn() },
}));

// Pick the first record from the seed list rather than hard-coding an id —
// the seed array has been renumbered (and grown) several times and stale
// hard-coded ids were the main cause of these tests breaking.
const FIXTURE = INITIAL_DB[0]!;

describe('DetailPage', () => {
  const onBack = vi.fn();
  const onEdit = vi.fn();
  const onNav = vi.fn();

  const setup = (recordId = FIXTURE.id) =>
    renderWithContext(
      <DetailPage
        db={INITIAL_DB}
        recordId={recordId}
        dispatch={mockContext.dispatch}
        onBack={onBack}
        onEdit={onEdit}
        claude={mockClaude}
        embedding={mockEmbedding}
        onNav={onNav}
      />,
    );

  it('renders material name when record found', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent(FIXTURE.name);
  });

  it('shows not found message for invalid ID', () => {
    setup('MAT-9999');
    expect(
      screen.getByText('データが見つかりません'),
    ).toBeInTheDocument();
  });

  it('shows properties section', () => {
    setup();
    expect(screen.getByText('物性データ')).toBeInTheDocument();
    expect(screen.getByText('硬度')).toBeInTheDocument();
    expect(screen.getByText('引張強さ')).toBeInTheDocument();
  });

  it('shows breadcrumb back button', () => {
    setup();
    // The breadcrumb label was changed from "材料データ一覧" to "戻る"
    // when goBack started routing through the navigation history stack.
    expect(screen.getByText('戻る')).toBeInTheDocument();
  });
});
