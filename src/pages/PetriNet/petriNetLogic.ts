/**
 * PetriNet 純粋ロジック層
 *
 * UI から独立してテスト可能な P/T ネットの計算関数を集約する。
 *   - tokenReducer: トークン状態遷移
 *   - isEnabled:    発火可能性（入力トークン + capacity 制約）
 *   - straightArcPath: 2 ノード間の直線弧パス計算
 */

import {
  INITIAL_TOKENS,
  type PlaceId,
  type PlaceDef,
  type TransitionDef,
} from '../../data/metalTestWorkflow'

export type TokenState = Record<PlaceId, number>

export type TokenAction =
  | { type: 'fire'; transition: TransitionDef }
  | { type: 'add'; placeId: PlaceId }
  | { type: 'reset' }

export function tokenReducer(state: TokenState, action: TokenAction): TokenState {
  switch (action.type) {
    case 'fire': {
      const next = { ...state }
      for (const pid of action.transition.inputs)  next[pid] = (next[pid] ?? 0) - 1
      for (const pid of action.transition.outputs) next[pid] = (next[pid] ?? 0) + 1
      return next
    }
    case 'add':
      return { ...state, [action.placeId]: (state[action.placeId] ?? 0) + 1 }
    case 'reset':
      return { ...INITIAL_TOKENS }
    default: {
      // 網羅チェック: TokenAction に新しい variant が追加されたら
      // ここで型エラーになる（_exhaustive: never への代入が失敗する）
      const _exhaustive: never = action
      void _exhaustive
      return state
    }
  }
}

/**
 * トランジション t が現在のトークン配置と capacity 制約の下で発火可能か判定する。
 *
 * P/T ネットのセマンティクス:
 *   1. 全入力 place に ≥1 トークンがある
 *   2. 発火後の全 capped place が capacity 以内に収まる
 */
export function isEnabled(
  t: TransitionDef,
  tokens: TokenState,
  places: readonly PlaceDef[],
): boolean {
  // 1. 全入力に ≥1 トークン
  for (const pid of t.inputs) {
    if ((tokens[pid] ?? 0) <= 0) return false
  }
  // 2. capacity 制約: 発火後に超過しない
  for (const place of places) {
    if (place.capacity === undefined) continue
    const outCount = t.outputs.filter(o => o === place.id).length
    const inCount  = t.inputs.filter(i => i === place.id).length
    const delta = outCount - inCount
    if (delta <= 0) continue
    if (((tokens[place.id] ?? 0) + delta) > place.capacity) return false
  }
  return true
}

/**
 * 2 ノード間の直線弧パス (M...L...) を計算する。
 * ノード境界（Place: 円、Transition: 矩形）を考慮して開始・終了点を調整する。
 *
 * @param sx,sy,sIsPlace 始点ノードの中心座標と種別
 * @param tx,ty,tIsPlace 終点ノードの中心座標と種別
 * @param placeR         Place 半径
 * @param transW,transH  Transition の半幅・半高
 */
export function straightArcPath(
  sx: number, sy: number, sIsPlace: boolean,
  tx: number, ty: number, tIsPlace: boolean,
  placeR: number, transW: number, transH: number,
): string {
  const dx = tx - sx
  const dy = ty - sy
  const len = Math.hypot(dx, dy)
  if (len === 0) return ''
  const ux = dx / len
  const uy = dy / len

  const srcBorder = sIsPlace
    ? placeR
    : Math.abs(ux) >= Math.abs(uy) ? transW : transH
  const tgtBorder = tIsPlace
    ? placeR
    : Math.abs(ux) >= Math.abs(uy) ? transW : transH

  const x1 = sx + ux * srcBorder
  const y1 = sy + uy * srcBorder
  // +4: 矢印先端が境界に載るよう内側へオフセット
  const x2 = tx - ux * (tgtBorder + 4)
  const y2 = ty - uy * (tgtBorder + 4)

  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

/**
 * 再加工フィードバックループ用の cubic bezier パス。
 * Row 1 上方を大きく弧を描いて迂回する。
 */
export function reworkArcPath(
  src: { x: number; y: number },
  tgt: { x: number; y: number },
  srcIsPlace: boolean,
  placeR: number,
  transW: number,
): string {
  if (srcIsPlace) {
    // place → transition: place top → transition right
    const sx = src.x, sy = src.y - placeR
    const tx = tgt.x + transW + 4, ty = tgt.y
    return `M ${sx} ${sy} C ${sx} ${ty} ${tx} ${ty} ${tx} ${ty}`
  }
  // transition → place: transition left → place top
  const sx = src.x - transW - 4, sy = src.y
  const tx = tgt.x, ty = tgt.y - placeR
  return `M ${sx} ${sy} C ${sx} ${ty} ${tx} ${ty} ${tx} ${ty}`
}
