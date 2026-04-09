import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { VectorSearchPage } from './VectorSearchPage';
import {
  renderWithContext,
  mockClaude,
  mockEmbedding,
  INITIAL_DB,
} from '../../test/helpers';

describe('VectorSearchPage', () => {
  const setup = () =>
    renderWithContext(
      <VectorSearchPage
        db={INITIAL_DB}
        embedding={mockEmbedding}
        claude={mockClaude}
      />,
    );

  it('renders title', () => {
    setup();
    expect(screen.getByText('ベクトル検索')).toBeInTheDocument();
  });

  it('shows preset search buttons', () => {
    setup();
    expect(
      screen.getByText('高温強度が高い耐熱合金'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('軽量で高比強度の材料'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('耐食性に優れるステンレス系'),
    ).toBeInTheDocument();
  });

  it('shows search input', () => {
    setup();
    expect(
      screen.getByPlaceholderText(
        /高温でも強度が落ちない軽量合金/,
      ),
    ).toBeInTheDocument();
  });
});
