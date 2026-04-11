import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const Boom = ({ message = 'kaboom' }: { message?: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  // Silence React's console.error during intentional error rendering.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <div>hello world</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('renders the default fallback with role="alert" when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toContain('kaboom');
    expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
  });

  it('invokes a custom fallback prop when provided', () => {
    render(
      <ErrorBoundary fallback={(err) => <div>custom: {err.message}</div>}>
        <Boom message="custom err" />
      </ErrorBoundary>
    );
    expect(screen.getByText(/custom: custom err/)).toBeInTheDocument();
  });

  it('calls onError with the caught error', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(Error);
  });

  it('reset clears the error so the subtree can render again', () => {
    let shouldThrow = true;
    const Flaky = () => {
      if (shouldThrow) throw new Error('first render');
      return <div>recovered</div>;
    };

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Flip the flag then click reset — the next render should succeed.
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: '再試行' }));
    expect(screen.getByText('recovered')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
