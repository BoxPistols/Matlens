import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

const STORAGE_KEY = 'matlens:theme';

// Local in-memory storage shim. The browser-mode vitest environment provided
// by @storybook/addon-vitest does not expose a fully-functional localStorage
// global, so each test swaps in its own Storage-shaped object via defineProperty.
function createLocalStorageStub() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    Object.defineProperty(window, 'localStorage', {
      value: createLocalStorageStub(),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to light when no theme is stored and no prefers-color-scheme match', () => {
    // Stub matchMedia → no match (light mode)
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('respects prefers-color-scheme: dark on first visit', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((q: string) => ({ matches: q.includes('dark') }))
    );
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('restores the theme from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('ignores invalid stored values and falls back to the default', () => {
    localStorage.setItem(STORAGE_KEY, 'not-a-real-theme');
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('setTheme persists the new value to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('setTheme updates data-theme attribute on the html element', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('eng');
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('eng');
  });

  it('can switch between all four valid themes', () => {
    const { result } = renderHook(() => useTheme());
    for (const theme of ['dark', 'eng', 'cae', 'light']) {
      act(() => {
        result.current.setTheme(theme);
      });
      expect(result.current.theme).toBe(theme);
      expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(theme);
    }
  });

  it('returns a stable setTheme function across re-renders', () => {
    const { result, rerender } = renderHook(() => useTheme());
    const firstSetTheme = result.current.setTheme;
    rerender();
    expect(result.current.setTheme).toBe(firstSetTheme);
  });
});
