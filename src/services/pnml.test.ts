import { describe, it, expect } from 'vitest'
import { exportPnml } from './pnml'
import { METAL_TEST_WORKFLOW, INITIAL_TOKENS } from '../data/metalTestWorkflow'

describe('exportPnml', () => {
  const xml = exportPnml(METAL_TEST_WORKFLOW, INITIAL_TOKENS)

  it('XML 宣言と pnml ルート要素を含む', () => {
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<pnml xmlns="http://www.pnml.org/version-2009/grammar/pnml">')
    expect(xml).toContain('</pnml>')
  })

  it('net type が P/T net を指す', () => {
    expect(xml).toContain('type="http://www.pnml.org/version-2009/grammar/ptnet"')
  })

  it('全 place を出力する', () => {
    for (const p of METAL_TEST_WORKFLOW.places) {
      expect(xml).toContain(`<place id="${p.id}">`)
    }
  })

  it('全 transition を出力する', () => {
    for (const t of METAL_TEST_WORKFLOW.transitions) {
      expect(xml).toContain(`<transition id="${t.id}">`)
    }
  })

  it('初期マーキング (p0=1) を initialMarking タグで出力する', () => {
    expect(xml).toContain('<initialMarking><text>1</text></initialMarking>')
  })

  it('トークンがないplace にはinitialMarking を出力しない', () => {
    // p1-p11 はトークン0 なので出力が1つだけのはず
    const matches = xml.match(/<initialMarking>/g)
    expect(matches).toHaveLength(1)
  })

  it('arc の source/target が place または transition のいずれかを参照する', () => {
    const placeIds = new Set(METAL_TEST_WORKFLOW.places.map(p => p.id))
    const transIds = new Set(METAL_TEST_WORKFLOW.transitions.map(t => t.id))
    const arcSources = [...xml.matchAll(/source="([^"]+)"/g)].map(m => m[1])
    const arcTargets = [...xml.matchAll(/target="([^"]+)"/g)].map(m => m[1] as string)
    for (const src of arcSources) {
      expect(placeIds.has(src as any) || transIds.has(src as any)).toBe(true)
    }
    for (const tgt of arcTargets) {
      expect(placeIds.has(tgt as any) || transIds.has(tgt as any)).toBe(true)
    }
  })

  it('カスタムトークン状態を反映する', () => {
    const customTokens = { ...INITIAL_TOKENS, p0: 0, p3: 2 }
    const customXml = exportPnml(METAL_TEST_WORKFLOW, customTokens)
    // p3 に marking=2 が出る
    expect(customXml).toContain('<initialMarking><text>2</text></initialMarking>')
    // p0 のmarkingは出ない（0個）
    const p0Block = customXml.slice(
      customXml.indexOf('<place id="p0">'),
      customXml.indexOf('</place>', customXml.indexOf('<place id="p0">'))
    )
    expect(p0Block).not.toContain('<initialMarking>')
  })

  it('XML 特殊文字をエスケープする', () => {
    const xml2 = exportPnml(METAL_TEST_WORKFLOW, INITIAL_TOKENS, 'test&<>"\'')
    expect(xml2).toContain('test&amp;&lt;&gt;&quot;&apos;')
    expect(xml2).not.toContain('test&<>')
  })
})
