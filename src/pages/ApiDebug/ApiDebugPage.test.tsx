import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ApiDebugPage } from './ApiDebugPage';
import { renderWithContext, mockContext, INITIAL_DB } from '../../test/helpers';

vi.mock('../services/mockApi', () => ({
  onApiLog: vi.fn(() => vi.fn()),
  getApiLogs: vi.fn(() => []),
  MOCK_CONFIG: { baseLatency: 120, jitter: 80, errorRate: 0 },
  clearApiLogs: vi.fn(),
}));

describe('ApiDebugPage', () => {
  const setup = () =>
    renderWithContext(
      <ApiDebugPage db={INITIAL_DB} dispatch={mockContext.dispatch} />,
    );

  it('renders title', () => {
    setup();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toContain('API');
    expect(h1.textContent).toContain('Mock');
  });

  it('shows tab navigation', () => {
    setup();
    expect(screen.getByText('リクエストログ')).toBeInTheDocument();
    expect(screen.getByText('リクエスト送信')).toBeInTheDocument();
    expect(screen.getByText('API仕様書')).toBeInTheDocument();
    expect(screen.getByText('モック設定')).toBeInTheDocument();
  });

  it('shows empty state for logs', () => {
    const { container } = setup();
    const cells = container.querySelectorAll('td');
    const emptyCell = Array.from(cells).find(
      (td) => td.colSpan === 5,
    );
    expect(emptyCell).toBeTruthy();
  });
});
