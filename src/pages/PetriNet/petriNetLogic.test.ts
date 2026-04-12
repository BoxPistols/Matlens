import { describe, it, expect } from 'vitest'
import {
  tokenReducer,
  isEnabled,
  straightArcPath,
  reworkArcPath,
  PETRI_GEOMETRY,
  type TokenState,
} from './petriNetLogic'
import {
  METAL_TEST_WORKFLOW,
  INITIAL_TOKENS,
  type TransitionDef,
} from '../../data/metalTestWorkflow'

// 定数はロジック層から取得して重複を避ける
const { placeR: PLACE_R, transW: TW, transH: TH } = PETRI_GEOMETRY

const net = METAL_TEST_WORKFLOW
const t = (id: string): TransitionDef => {
  const found = net.transitions.find(x => x.id === id)
  if (!found) throw new Error(`Transition not found: ${id}`)
  return found
}

describe('tokenReducer', () => {
  it('初期状態は p0 のみに 1 トークン', () => {
    expect(INITIAL_TOKENS.p0).toBe(1)
    expect(INITIAL_TOKENS.p1).toBe(0)
    expect(INITIAL_TOKENS.p10).toBe(0)
  })

  it('fire: 入力 place のトークンが減り、出力 place へ増える', () => {
    const next = tokenReducer({ ...INITIAL_TOKENS }, { type: 'fire', transition: t('t0') })
    expect(next.p0).toBe(0)
    expect(next.p1).toBe(1)
  })

  it('add: 指定 place にトークンを 1 追加する', () => {
    const next = tokenReducer({ ...INITIAL_TOKENS }, { type: 'add', placeId: 'p0' })
    expect(next.p0).toBe(2)
  })

  it('reset: INITIAL_TOKENS に戻る', () => {
    const messy: TokenState = { ...INITIAL_TOKENS, p0: 0, p3: 5, p7: 2 }
    const next = tokenReducer(messy, { type: 'reset' })
    expect(next).toEqual(INITIAL_TOKENS)
  })

  it('restore: 指定した過去状態へ即座に巻き戻す (Undo 用)', () => {
    const past: TokenState = { ...INITIAL_TOKENS, p0: 0, p3: 1 }
    const current: TokenState = { ...INITIAL_TOKENS, p0: 0, p4: 1 }
    const next = tokenReducer(current, { type: 'restore', state: past })
    expect(next).toEqual(past)
    // 元の state オブジェクトが変更されていないこと（shallow copy 保証）
    expect(next).not.toBe(past)
  })

  it('連続 fire で p0 → p1 → p2 とトークンが進行', () => {
    let state = { ...INITIAL_TOKENS }
    state = tokenReducer(state, { type: 'fire', transition: t('t0') })
    state = tokenReducer(state, { type: 'fire', transition: t('t1') })
    expect(state.p0).toBe(0)
    expect(state.p1).toBe(0)
    expect(state.p2).toBe(1)
  })
})

describe('isEnabled', () => {
  it('全入力にトークンがあれば true', () => {
    expect(isEnabled(t('t0'), INITIAL_TOKENS, net.places)).toBe(true)
  })

  it('入力にトークンがなければ false', () => {
    expect(isEnabled(t('t1'), INITIAL_TOKENS, net.places)).toBe(false)
  })

  it('capacity 未満なら true', () => {
    // p6 に 1 トークン、p7 (capacity=2) に 0 → t7 発火可能
    const state: TokenState = { ...INITIAL_TOKENS, p0: 0, p6: 1 }
    expect(isEnabled(t('t7'), state, net.places)).toBe(true)
  })

  it('capacity 上限なら false (長時間試験の並行ステーション制約)', () => {
    // p6 に 1 トークン、p7 (capacity=2) に既に 2 → t7 は発火できない
    const state: TokenState = { ...INITIAL_TOKENS, p0: 0, p6: 1, p7: 2 }
    expect(isEnabled(t('t7'), state, net.places)).toBe(false)
  })

  it('p8 も capacity 2 で上限チェックされる', () => {
    const state: TokenState = { ...INITIAL_TOKENS, p0: 0, p7: 1, p8: 2 }
    expect(isEnabled(t('t8'), state, net.places)).toBe(false)
  })

  it('再加工ループ t4: p4 にトークンがあれば発火可能', () => {
    const state: TokenState = { ...INITIAL_TOKENS, p0: 0, p4: 1 }
    expect(isEnabled(t('t4'), state, net.places)).toBe(true)
  })
})

describe('straightArcPath', () => {
  it('place → transition (horizontal right): 正しく境界オフセットされる', () => {
    // p0(50,90) → t0(130,90): 右向き水平
    // 始点: (50+22, 90) = (72, 90)
    // 終点: (130 - (14+4), 90) = (112, 90)
    const d = straightArcPath(50, 90, true, 130, 90, false, PLACE_R, TW, TH)
    expect(d).toBe('M 72.0 90.0 L 112.0 90.0')
  })

  it('transition → place (horizontal right)', () => {
    // t0(130,90) → p1(210,90)
    // 始点: (130+14, 90) = (144, 90)
    // 終点: (210 - (22+4), 90) = (184, 90)
    const d = straightArcPath(130, 90, false, 210, 90, true, PLACE_R, TW, TH)
    expect(d).toBe('M 144.0 90.0 L 184.0 90.0')
  })

  it('place → transition (vertical down): 縦方向は transH を使う', () => {
    // p4(690,90) → t5(690,220): 下向き垂直
    // 始点: (690, 90+22) = (690, 112)
    // 終点: (690, 220 - (26+4)) = (690, 190)
    const d = straightArcPath(690, 90, true, 690, 220, false, PLACE_R, TW, TH)
    expect(d).toBe('M 690.0 112.0 L 690.0 190.0')
  })

  it('同一座標なら空文字を返す', () => {
    expect(straightArcPath(100, 100, true, 100, 100, true, PLACE_R, TW, TH)).toBe('')
  })
})

describe('reworkArcPath', () => {
  it('place → transition: cubic bezier の M コマンドが place 上端から開始', () => {
    // p4(690,90) → t4(530,28)
    const d = reworkArcPath({ x: 690, y: 90 }, { x: 530, y: 28 }, true, PLACE_R, TW)
    // M 690 68 で始まる (90 - 22 = 68)
    expect(d).toMatch(/^M 690 68 C/)
    // 終点は t4 の右辺 (530 + 14 + 4 = 548, y=28)
    expect(d).toContain('548 28 548 28')
  })

  it('transition → place: cubic bezier が place 上端で終わる', () => {
    // t4(530,28) → p3(530,90)
    const d = reworkArcPath({ x: 530, y: 28 }, { x: 530, y: 90 }, false, PLACE_R, TW)
    // t4 左辺から (530 - 14 - 4 = 512, 28)
    expect(d).toMatch(/^M 512 28 C/)
    // p3 上端で終わる (530, 90 - 22 = 68)
    expect(d).toContain('530 68 530 68')
  })
})
