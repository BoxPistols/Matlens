import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { RAGChatPage } from './RAGChatPage';
import {
  renderWithContext,
  mockClaude,
  mockEmbedding,
  INITIAL_DB,
} from '../../test/helpers';

describe('RAGChatPage', () => {
  const setup = () =>
    renderWithContext(
      <RAGChatPage
        db={INITIAL_DB}
        embedding={mockEmbedding}
        claude={mockClaude}
      />,
    );

  it('renders title', () => {
    setup();
    expect(screen.getByText('AI チャット')).toBeInTheDocument();
  });

  it('shows initial AI greeting message', () => {
    setup();
    expect(
      screen.getByText(
        /Matlens の材料データベースについてなんでも聞いてください/,
      ),
    ).toBeInTheDocument();
  });

  it('shows chat input', () => {
    setup();
    expect(
      screen.getByPlaceholderText(
        /質問を入力/,
      ),
    ).toBeInTheDocument();
  });

  it('shows preset question buttons', () => {
    setup();
    const presets = screen.getAllByText('硬度が300HV以上の金属合金を教えて');
    expect(presets.length).toBeGreaterThanOrEqual(1);
  });
});
