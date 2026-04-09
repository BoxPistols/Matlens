import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  const setup = () => render(<AboutPage />);

  it('renders title', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent('技術スタック');
  });

  it('shows technology cards', () => {
    setup();
    expect(screen.getByText('React 18')).toBeInTheDocument();
    expect(screen.getByText('TensorFlow.js + USE')).toBeInTheDocument();
    expect(screen.getByText('Chart.js 4')).toBeInTheDocument();
  });

  it('shows Atomic Design section', () => {
    setup();
    expect(
      screen.getByText('コンポーネント設計（Atomic Design）'),
    ).toBeInTheDocument();
    expect(screen.getByText('Atoms')).toBeInTheDocument();
    expect(screen.getByText('Molecules')).toBeInTheDocument();
    expect(screen.getByText('Pages')).toBeInTheDocument();
  });
});
