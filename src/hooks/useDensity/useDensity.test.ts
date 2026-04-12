import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useDensity, VALID_DENSITIES } from './useDensity'

const STORAGE_KEY = 'matlens:density'

// vitest 環境によっては localStorage が incomplete な場合がある
const hasLocalStorage = (() => {
  try { localStorage.setItem('__test__', '1'); localStorage.removeItem('__test__'); return true }
  catch { return false }
})()

describe('useDensity', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-density')
    if (hasLocalStorage) try { localStorage.clear() } catch { /* noop */ }
  })

  it('デフォルトは regular', () => {
    const { result } = renderHook(() => useDensity())
    expect(result.current.density).toBe('regular')
    expect(document.documentElement.getAttribute('data-density')).toBe('regular')
  })

  it('setDensity で密度が変わり data-density 属性に反映される', () => {
    const { result } = renderHook(() => useDensity())
    act(() => result.current.setDensity('compact'))
    expect(result.current.density).toBe('compact')
    expect(document.documentElement.getAttribute('data-density')).toBe('compact')
  })

  it.skipIf(!hasLocalStorage)('localStorage から復元する', () => {
    localStorage.setItem(STORAGE_KEY, 'relaxed')
    const { result } = renderHook(() => useDensity())
    expect(result.current.density).toBe('relaxed')
  })

  it.skipIf(!hasLocalStorage)('不正な localStorage 値は regular にフォールバック', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-value')
    const { result } = renderHook(() => useDensity())
    expect(result.current.density).toBe('regular')
  })

  it('VALID_DENSITIES に 3 値が定義されている', () => {
    expect(VALID_DENSITIES).toEqual(['compact', 'regular', 'relaxed'])
  })
})
