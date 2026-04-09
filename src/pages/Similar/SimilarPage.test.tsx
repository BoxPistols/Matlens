import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { SimilarPage } from './SimilarPage';
import {
  renderWithContext,
  mockClaude,
  mockEmbedding,
  INITIAL_DB,
} from '../../test/helpers';

vi.mock('marked', () => ({
  marked: { parse: (s: string) => s, setOptions: vi.fn() },
}));

describe('SimilarPage', () => {
  const setup = () =>
    renderWithContext(
      <SimilarPage
        db={INITIAL_DB}
        embedding={mockEmbedding}
        claude={mockClaude}
      />,
    );

  it('renders title', () => {
    setup();
    expect(screen.getByText('類似材料探索')).toBeInTheDocument();
  });

  it('shows configuration inputs', () => {
    setup();
    expect(screen.getByText('基準材料（ID または名称）')).toBeInTheDocument();
    expect(screen.getByText('重み付け')).toBeInTheDocument();
    expect(screen.getByText('最大表示件数')).toBeInTheDocument();
    expect(screen.getByText('類似度しきい値')).toBeInTheDocument();
  });
});
