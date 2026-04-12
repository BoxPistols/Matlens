import { describe, it, expect } from 'vitest'
import {
  MATERIAL_TERMS,
  TEST_METHOD_TERMS,
  WORKFLOW_TERMS,
  UI_TERMS,
  bilingual,
  fullLabel,
} from './terms'

describe('MATERIAL_TERMS', () => {
  it('全エントリに ja / en が定義されている', () => {
    for (const [key, term] of Object.entries(MATERIAL_TERMS)) {
      expect(term.ja, `${key}.ja が空`).toBeTruthy()
      expect(term.en, `${key}.en が空`).toBeTruthy()
    }
  })

  it('Material 型の主要フィールドがカバーされている', () => {
    const required = ['hv', 'ts', 'el', 'dn', 'comp', 'name', 'cat', 'status', 'id']
    for (const key of required) {
      expect(MATERIAL_TERMS[key], `${key} が未定義`).toBeDefined()
    }
  })

  it('物性値には unit が付いている', () => {
    expect(MATERIAL_TERMS['hv']?.unit).toBe('HV')
    expect(MATERIAL_TERMS['ts']?.unit).toBe('MPa')
    expect(MATERIAL_TERMS['el']?.unit).toBe('GPa')
  })
})

describe('TEST_METHOD_TERMS', () => {
  it('主要な試験方法がカバーされている', () => {
    expect(Object.keys(TEST_METHOD_TERMS).length).toBeGreaterThanOrEqual(5)
  })
})

describe('WORKFLOW_TERMS', () => {
  it('Petri net の 11 工程 + rework + reject をカバー', () => {
    const required = [
      'planning', 'material_select', 'raw_material',
      'primary_process', 'post_process', 'specimen',
      'evaluation', 'mechanical_test', 'environmental',
      'fractography', 'report', 'rework', 'reject',
    ]
    for (const key of required) {
      expect(WORKFLOW_TERMS[key], `${key} が未定義`).toBeDefined()
    }
  })
})

describe('UI_TERMS', () => {
  it('主要ページの用語がカバーされている', () => {
    const required = ['dashboard', 'material_list', 'petri_net', 'bayes_opt']
    for (const key of required) {
      expect(UI_TERMS[key], `${key} が未定義`).toBeDefined()
    }
  })
})

describe('bilingual', () => {
  it('ja / en をスラッシュ区切りで結合する', () => {
    const result = bilingual(MATERIAL_TERMS['ts']!)
    expect(result).toBe('引張強さ / Tensile Strength')
  })

  it('カスタムセパレータを使える', () => {
    const result = bilingual(MATERIAL_TERMS['hv']!, ' — ')
    expect(result).toBe('硬度 — Hardness')
  })
})

describe('fullLabel', () => {
  it('unit がある場合は括弧付きで末尾に付く', () => {
    const result = fullLabel(MATERIAL_TERMS['ts']!)
    expect(result).toBe('引張強さ / Tensile Strength (MPa)')
  })

  it('unit がない場合は bilingual と同じ', () => {
    const result = fullLabel(MATERIAL_TERMS['name']!)
    expect(result).toBe('名称 / Name')
  })
})
