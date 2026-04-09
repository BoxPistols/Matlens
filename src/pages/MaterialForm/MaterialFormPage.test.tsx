import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { MaterialFormPage } from './MaterialFormPage';
import {
  renderWithContext,
  mockContext,
  mockClaude,
  mockEmbedding,
  INITIAL_DB,
} from '../../test/helpers';

describe('MaterialFormPage', () => {
  const onCancel = vi.fn();
  const onSuccess = vi.fn();

  const setupNew = () =>
    renderWithContext(
      <MaterialFormPage
        db={INITIAL_DB}
        dispatch={mockContext.dispatch}
        editId={null}
        onCancel={onCancel}
        onSuccess={onSuccess}
        claude={mockClaude}
        embedding={mockEmbedding}
      />,
    );

  const setupEdit = () =>
    renderWithContext(
      <MaterialFormPage
        db={INITIAL_DB}
        dispatch={mockContext.dispatch}
        editId="MAT-0247"
        onCancel={onCancel}
        onSuccess={onSuccess}
        claude={mockClaude}
        embedding={mockEmbedding}
      />,
    );

  it('renders new registration title for new form', () => {
    setupNew();
    expect(screen.getByText('材料データ 新規登録')).toBeInTheDocument();
  });

  it('renders edit title for edit mode', () => {
    setupEdit();
    expect(
      screen.getByText((content) => content.includes('データ編集')),
    ).toBeInTheDocument();
  });

  it('shows required fields (name, cat, comp)', () => {
    setupNew();
    expect(screen.getByText('材料名称')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('組成・配合')).toBeInTheDocument();
  });

  it('submit with empty required fields shows errors', () => {
    setupNew();
    fireEvent.click(screen.getByText('登録する'));
    const errors = screen.getAllByText('必須項目です');
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});
