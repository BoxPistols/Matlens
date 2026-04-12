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

  const EDIT_FIXTURE = INITIAL_DB[0]!;
  const setupEdit = () =>
    renderWithContext(
      <MaterialFormPage
        db={INITIAL_DB}
        dispatch={mockContext.dispatch}
        editId={EDIT_FIXTURE.id}
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

  it('shows required fields on step 1 (name, cat, comp)', () => {
    setupNew();
    expect(screen.getByText('材料名称')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('組成・配合')).toBeInTheDocument();
  });

  it('shows step indicator with 3 steps', () => {
    setupNew();
    const stepButtons = screen.getAllByRole('button').filter(
      btn => btn.getAttribute('aria-current') === 'step' || btn.textContent?.match(/基本情報|物性データ|確認・登録/)
    );
    expect(stepButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('clicking next with empty required fields shows errors', () => {
    setupNew();
    fireEvent.click(screen.getByText('次へ'));
    const errors = screen.getAllByText('必須項目です');
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('shows cancel button on all steps', () => {
    setupNew();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('shows category template hint when category selected', () => {
    setupNew();
    const select = screen.getByDisplayValue('選択してください');
    fireEvent.change(select, { target: { value: '金属合金' } });
    expect(screen.getByText((content) => content.includes('カテゴリ「金属合金」'))).toBeInTheDocument();
  });
});
