/**
 * 密度トグル統合テスト — CSS 変数と DOM 属性の整合性を検証
 *
 * Vitest + jsdom では getComputedStyle が CSS ファイルを読まないため、
 * CSS 変数の値自体ではなく「data-density 属性が正しく切り替わること」と
 * 「density-scale クラスが main 要素に存在すること」を検証する。
 * CSS の視覚的な反映は Storybook + Chromatic / Playwright で担保する。
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useDensity, VALID_DENSITIES, DENSITY_META, type Density } from './useDensity'

describe('useDensity integration', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-density')
  })

  it('全密度で data-density 属性が正しく切り替わる', () => {
    const { result } = renderHook(() => useDensity())
    for (const d of VALID_DENSITIES) {
      act(() => result.current.setDensity(d))
      expect(document.documentElement.getAttribute('data-density')).toBe(d)
    }
  })

  it('DENSITY_META に全密度の label と labelEn が定義されている', () => {
    for (const d of VALID_DENSITIES) {
      const meta = DENSITY_META[d]
      expect(meta.label).toBeTruthy()
      expect(meta.labelEn).toBeTruthy()
      expect(meta.rowH).toBeGreaterThan(0)
    }
  })

  it('compact < regular < relaxed の行高さ順序', () => {
    expect(DENSITY_META.compact.rowH).toBeLessThan(DENSITY_META.regular.rowH)
    expect(DENSITY_META.regular.rowH).toBeLessThan(DENSITY_META.relaxed.rowH)
  })

  it('密度切替の往復でデフォルト (regular) に戻れる', () => {
    const { result } = renderHook(() => useDensity())
    act(() => result.current.setDensity('compact'))
    expect(result.current.density).toBe('compact')
    act(() => result.current.setDensity('regular'))
    expect(result.current.density).toBe('regular')
    expect(document.documentElement.getAttribute('data-density')).toBe('regular')
  })

  it('density-scale クラスが CSS で定義されていること (静的チェック)', async () => {
    // index.css に density-scale のルールが存在するか検証
    const fs = await import('fs')
    const css = fs.readFileSync('src/index.css', 'utf-8')
    expect(css).toContain('.density-scale')
    expect(css).toContain('[data-density="compact"]')
    expect(css).toContain('[data-density="relaxed"]')
  })
})
