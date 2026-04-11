// Generic React error boundary used to isolate render failures so a single
// bad subtree (e.g. a RAG chat message containing malformed Markdown, or a
// chart crashing on unexpected data) never takes down the whole app.
//
// This is intentionally a class component — React does not expose a hooks
// equivalent of componentDidCatch / getDerivedStateFromError at the time
// of writing. Keep it small and framework-agnostic so it can wrap any
// subtree in the app.

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Render function invoked when an error is caught. Receives the error and
   * a `reset` callback the user can trigger (e.g. a "再試行" button) to try
   * rendering the subtree again. If omitted, a small built-in fallback is
   * shown instead.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /**
   * Optional side-effect hook called on catch, useful for logging to a
   * telemetry sink. Runs after state has been updated.
   */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Always surface the error in the console for dev visibility. A future
    // PR can route this to a telemetry sink via the onError prop.
    console.error('ErrorBoundary caught:', error, info);
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback(error, this.reset);
      }
      return (
        <div
          role="alert"
          className="p-3 rounded-md border border-[var(--err)] bg-[var(--err-dim)] text-err text-[12px] flex items-center gap-2"
        >
          <span className="flex-1">
            表示エラーが発生しました: {error.message || '不明なエラー'}
          </span>
          <button
            type="button"
            onClick={this.reset}
            className="px-2 py-0.5 rounded border border-[var(--err)] text-err hover:bg-[var(--err)] hover:text-white transition-colors text-[11px] font-semibold"
          >
            再試行
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
