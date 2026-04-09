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

describe('DetailPage', () => {
  const onBack = vi.fn();
  const onEdit = vi.fn();
  const onNav = vi.fn();

  const setup = (recordId = 'MAT-0247') =>
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
    setup('MAT-0247');
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent('Ti-6Al-4V チタン合金');
  });

  it('shows not found message for invalid ID', () => {
    setup('MAT-9999');
    expect(
      screen.getByText('データが見つかりません'),
    ).toBeInTheDocument();
  });

  it('shows properties section', () => {
    setup('MAT-0247');
    expect(screen.getByText('物性データ')).toBeInTheDocument();
    expect(screen.getByText('硬度')).toBeInTheDocument();
    expect(screen.getByText('引張強さ')).toBeInTheDocument();
  });

  it('shows breadcrumb navigation', () => {
    setup('MAT-0247');
    expect(screen.getByText('材料データ一覧')).toBeInTheDocument();
  });
});
