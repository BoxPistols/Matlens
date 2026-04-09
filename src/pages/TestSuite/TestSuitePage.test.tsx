import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { TestSuitePage } from './TestSuitePage';

describe('TestSuitePage', () => {
  const setup = () => render(<TestSuitePage />);

  it('renders title', () => {
    setup();
    expect(screen.getByText('テストスイート')).toBeInTheDocument();
  });

  it('shows 全実行 button', () => {
    setup();
    expect(screen.getByText('全実行')).toBeInTheDocument();
  });

  it('shows test case count', () => {
    setup();
    expect(
      screen.getByText(/30テストケース/),
    ).toBeInTheDocument();
  });
});
