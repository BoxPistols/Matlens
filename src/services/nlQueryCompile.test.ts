import { describe, it, expect } from 'vitest'
import { compileNlQuery } from './nlQueryCompile'

describe('compileNlQuery', () => {
  it('カテゴリを抽出する', () => {
    const r = compileNlQuery('ニッケル合金')
    expect(r.cat).toBe('金属合金')
    expect(r.applied.length).toBeGreaterThan(0)
  })

  it('セラミクスを認識する', () => {
    expect(compileNlQuery('アルミナ').cat).toBe('セラミクス')
  })

  it('複合材料を認識する', () => {
    expect(compileNlQuery('CFRP').cat).toBe('複合材料')
  })

  it('数値範囲 (硬度300以上) を抽出する', () => {
    const r = compileNlQuery('硬度300以上')
    expect(r.hvMin).toBe(300)
  })

  it('数値範囲 (引張500MPa以下) を抽出する', () => {
    const r = compileNlQuery('引張500MPa以下')
    expect(r.tsMax).toBe(500)
  })

  it('ステータスを抽出する', () => {
    const r = compileNlQuery('承認済')
    expect(r.status).toBe('承認済')
  })

  it('Provenance を抽出する', () => {
    const r = compileNlQuery('装置計測のデータ')
    expect(r.provenance).toBe('instrument')
  })

  it('複合クエリ: カテゴリ + 数値 + ステータス', () => {
    const r = compileNlQuery('チタン合金で硬度300以上の承認済')
    expect(r.cat).toBe('金属合金')
    expect(r.hvMin).toBe(300)
    expect(r.status).toBe('承認済')
    expect(r.applied.length).toBe(3)
  })

  it('認識できない部分は text として残る', () => {
    const r = compileNlQuery('特殊な材料を探す')
    expect(r.text).toBeTruthy()
  })

  it('空文字列でもクラッシュしない', () => {
    const r = compileNlQuery('')
    expect(r.applied).toEqual([])
    expect(r.remainder).toBe('')
  })

  it('密度の範囲フィルタ', () => {
    const r = compileNlQuery('密度5以下')
    expect(r.dnMax).toBe(5)
  })
})
