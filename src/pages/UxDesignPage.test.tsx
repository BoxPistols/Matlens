import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { UxDesignPage } from './UxDesignPage';

describe('UxDesignPage', () => {
  const setup = () => render(<UxDesignPage />);

  it('renders title', () => {
    setup();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toContain('UX');
  });

  it('shows section navigation', () => {
    setup();
    expect(screen.getByText('情報設計 (IA)')).toBeInTheDocument();
    expect(screen.getByText('ナビゲーション')).toBeInTheDocument();
    expect(screen.getByText('フォーム設計')).toBeInTheDocument();
  });

  it('default section is 情報設計', () => {
    setup();
    expect(
      screen.getByText((content) => content.includes('Matlens') && content.includes('IA')),
    ).toBeInTheDocument();
  });
});
