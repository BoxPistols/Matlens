/**
 * useDensity — UI 密度 (行高さ / 余白) のトグルフック
 *
 * BtoB アプリでは情報密度の好みが人によって大きく異なる。
 *   compact  — 36px 行。データ一覧を一画面で多く俯瞰したい熟練者向け。
 *   regular  — 44px 行。標準。初見ユーザーにも読みやすいバランス。
 *   relaxed  — 56px 行。視認性重視。大画面 or タッチ操作向け。
 *
 * <html data-density="..."> 属性で CSS 変数を切り替え、localStorage で永続化する。
 * useTheme と同パターン。
 */

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'matlens:density'
export const VALID_DENSITIES = ['compact', 'regular', 'relaxed'] as const
export type Density = (typeof VALID_DENSITIES)[number]

export const DENSITY_META: Record<Density, { label: string; labelEn: string; rowH: number }> = {
  compact:  { label: 'コンパクト', labelEn: 'Compact', rowH: 36 },
  regular:  { label: '標準',       labelEn: 'Regular', rowH: 44 },
  relaxed:  { label: 'ゆったり',   labelEn: 'Relaxed', rowH: 56 },
}

function isValidDensity(d: string | null): d is Density {
  return !!d && (VALID_DENSITIES as readonly string[]).includes(d)
}

function loadInitial(): Density {
  if (typeof window === 'undefined') return 'regular'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isValidDensity(stored)) return stored
  } catch { /* ignore */ }
  return 'regular'
}

export function useDensity(): { density: Density; setDensity: (d: Density) => void } {
  const [density, setDensityState] = useState<Density>(loadInitial)

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
    try {
      localStorage.setItem(STORAGE_KEY, density)
    } catch { /* ignore */ }
  }, [density])

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      if (isValidDensity(e.newValue)) setDensityState(e.newValue)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const setDensity = useCallback((d: Density) => {
    if (isValidDensity(d)) setDensityState(d)
  }, [])

  return { density, setDensity }
}
