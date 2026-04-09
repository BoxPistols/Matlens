import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('initial theme is light', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('setTheme changes the theme state', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(result.current.theme).toBe('dark');
  });

  it('setTheme updates document.documentElement data-theme attribute', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('can switch themes multiple times', () => {
    const { result } = renderHook(() => useTheme());
    act(() => { result.current.setTheme('dark'); });
    expect(result.current.theme).toBe('dark');

    act(() => { result.current.setTheme('engineering'); });
    expect(result.current.theme).toBe('engineering');
    expect(document.documentElement.getAttribute('data-theme')).toBe('engineering');

    act(() => { result.current.setTheme('light'); });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('returns a stable setTheme function across renders', () => {
    const { result, rerender } = renderHook(() => useTheme());
    const firstSetTheme = result.current.setTheme;
    rerender();
    expect(result.current.setTheme).toBe(firstSetTheme);
  });
});
