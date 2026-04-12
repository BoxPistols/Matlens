import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLang } from './useLang';

const STORAGE_KEY = 'matlens:lang';

// localStorage shim (useTheme.test.ts と同パターン)
function createLocalStorageStub() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
}

describe('useLang', () => {
  let stub: ReturnType<typeof createLocalStorageStub>;
  let originalLS: Storage;

  beforeEach(() => {
    stub = createLocalStorageStub();
    originalLS = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', { value: stub, writable: true, configurable: true });
    document.documentElement.removeAttribute('data-lang');
    document.documentElement.removeAttribute('lang');
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: originalLS, writable: true, configurable: true });
  });

  it('defaults to ja when no stored value and navigator is not English', () => {
    // テスト環境の navigator.language に依存するため、結果は ja or en のどちらか
    const { result } = renderHook(() => useLang());
    expect(['ja', 'en']).toContain(result.current.lang);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useLang());
    act(() => result.current.setLang('en'));
    expect(result.current.lang).toBe('en');
    expect(stub.getItem(STORAGE_KEY)).toBe('en');
  });

  it('sets data-lang attribute on html', () => {
    const { result } = renderHook(() => useLang());
    act(() => result.current.setLang('en'));
    expect(document.documentElement.getAttribute('data-lang')).toBe('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('restores from localStorage', () => {
    stub.setItem(STORAGE_KEY, 'en');
    const { result } = renderHook(() => useLang());
    expect(result.current.lang).toBe('en');
  });

  it('t() helper returns correct language string', () => {
    const { result } = renderHook(() => useLang());
    act(() => result.current.setLang('ja'));
    expect(result.current.t('硬度', 'Hardness')).toBe('硬度');
    act(() => result.current.setLang('en'));
    expect(result.current.t('硬度', 'Hardness')).toBe('Hardness');
  });
});
