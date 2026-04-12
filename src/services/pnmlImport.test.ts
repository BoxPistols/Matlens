import { describe, it, expect } from 'vitest'
import { importPnml } from './pnmlImport'
import { exportPnml } from './pnml'
import { METAL_TEST_WORKFLOW, INITIAL_TOKENS } from '../data/metalTestWorkflow'

describe('importPnml', () => {
  it('エクスポートした PNML を再インポートしてトークンが復元される', () => {
    const customTokens = { ...INITIAL_TOKENS, p0: 0, p3: 2, p6: 1 }
    const xml = exportPnml(METAL_TEST_WORKFLOW, customTokens)
    const result = importPnml(xml)
    expect(result.tokens['p3']).toBe(2)
    expect(result.tokens['p6']).toBe(1)
    // p0 はトークン 0 なので initialMarking が出力されない → undefined
    expect(result.tokens['p0']).toBeUndefined()
  })

  it('place / transition / arc 数が正しい', () => {
    const xml = exportPnml(METAL_TEST_WORKFLOW, INITIAL_TOKENS)
    const result = importPnml(xml)
    expect(result.placeCount).toBe(METAL_TEST_WORKFLOW.places.length)
    expect(result.transitionCount).toBe(METAL_TEST_WORKFLOW.transitions.length)
    expect(result.arcCount).toBeGreaterThan(0)
  })

  it('DOCTYPE 宣言で throw (XXE 対策)', () => {
    const xml = '<!DOCTYPE foo SYSTEM "evil"><pnml></pnml>'
    expect(() => importPnml(xml)).toThrow('DOCTYPE')
  })

  it('サイズ超過で throw', () => {
    const xml = '<pnml>' + 'x'.repeat(6 * 1024 * 1024) + '</pnml>'
    expect(() => importPnml(xml)).toThrow('大きすぎます')
  })

  it('不正な XML で throw', () => {
    expect(() => importPnml('<pnml><broken')).toThrow('パースエラー')
  })

  it('空の PNML でもクラッシュしない', () => {
    const result = importPnml('<pnml><net id="empty"><page id="p"></page></net></pnml>')
    expect(result.placeCount).toBe(0)
    expect(result.transitionCount).toBe(0)
    expect(result.arcCount).toBe(0)
  })
})
