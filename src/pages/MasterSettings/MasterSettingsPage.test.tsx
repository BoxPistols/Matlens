import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MasterSettingsPage } from './MasterSettingsPage';
import { renderWithContext, INITIAL_DB } from '../../test/helpers';

describe('MasterSettingsPage', () => {
  const setup = () =>
    renderWithContext(<MasterSettingsPage db={INITIAL_DB} />);

  it('renders title', () => {
    setup();
    expect(screen.getByText('マスタ管理')).toBeInTheDocument();
  });

  it('shows category master section', () => {
    setup();
    expect(screen.getByText('カテゴリ マスタ')).toBeInTheDocument();
    expect(screen.getByText('金属合金')).toBeInTheDocument();
    expect(screen.getByText('セラミクス')).toBeInTheDocument();
    expect(screen.getByText('ポリマー')).toBeInTheDocument();
    expect(screen.getByText('複合材料')).toBeInTheDocument();
  });

  it('shows status master section', () => {
    setup();
    expect(screen.getByText('ステータス マスタ')).toBeInTheDocument();
    expect(screen.getByText('新規登録・未レビュー')).toBeInTheDocument();
    expect(
      screen.getByText('担当者によるレビュー待ち'),
    ).toBeInTheDocument();
  });
});
