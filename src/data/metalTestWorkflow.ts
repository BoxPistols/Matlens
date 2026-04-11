/**
 * 金属試験ワークフロー定義 — Petri net (P/T net) セマンティクス
 *
 * 11 工程のライフサイクルを Place / Transition / Arc で表現する。
 * フィードバックループ (再加工: p4 → p3) は DAG で表現不可のため Petri net を採用。
 *
 * レイアウト（3 行スネーク）:
 *   Row 1 (y=90):  p0 → t0 → p1 → t1 → p2 → t2 → p3 → t3 → p4
 *   Row 2 (y=220): t5 ← p5 ← t6 ← p6 ← t7 ← p7 ← t8 ← p8 ← t9  (右→左)
 *   Row 3 (y=350): p9 → t10 → p10
 *   Extra: t4 (再加工) p4→p3 上方弧、t11+p11 (廃棄) p6 下方
 */

export type PlaceId =
  | 'p0'   // 計画中 (initial)
  | 'p1'   // 材料選定済
  | 'p2'   // 原料準備完了
  | 'p3'   // 一次加工済
  | 'p4'   // 後加工済
  | 'p5'   // 試験片採取済
  | 'p6'   // 評価済
  | 'p7'   // 機械試験済
  | 'p8'   // 環境試験済
  | 'p9'   // 破面解析済
  | 'p10'  // レポート完了 (final)
  | 'p11'  // 廃棄/不合格 (reject)

export type TransitionId =
  | 't0'   // 材料選定
  | 't1'   // 原料調達
  | 't2'   // 一次加工
  | 't3'   // 後加工
  | 't4'   // 再加工 (rework feedback loop)
  | 't5'   // 試験片採取
  | 't6'   // 評価
  | 't7'   // 機械試験
  | 't8'   // 環境試験
  | 't9'   // 破面解析
  | 't10'  // レポート生成
  | 't11'  // 廃棄判定 (reject branch)

export interface PlaceDef {
  id: PlaceId
  label: string        // 表示ラベル (短縮形)
  fullLabel: string    // 詳細パネル用フルラベル
  x: number
  y: number
  capacity?: number    // クリープ等の長時間試験用 (省略 = 無制限)
  isInitial?: boolean
  isFinal?: boolean
  isReject?: boolean
}

export interface TransitionDef {
  id: TransitionId
  label: string
  inputs: PlaceId[]
  outputs: PlaceId[]
  x: number
  y: number
  /** 再加工ループ — 特別な曲線弧で描画 */
  isRework?: boolean
  /** 廃棄判定ブランチ */
  isReject?: boolean
}

export interface PetriNetDef {
  places: PlaceDef[]
  transitions: TransitionDef[]
}

// ─── 座標定数 ────────────────────────────────────────────────────────────────
const R1Y = 90    // Row 1 y
const R2Y = 220   // Row 2 y
const R3Y = 350   // Row 3 y
const DX  = 80    // 水平間隔

export const METAL_TEST_WORKFLOW: PetriNetDef = {
  places: [
    { id: 'p0',  label: '計画中',     fullLabel: '計画中',         x: 50,        y: R1Y, isInitial: true },
    { id: 'p1',  label: '材料選定済', fullLabel: '材料選定済',     x: 50+DX*2,   y: R1Y },
    { id: 'p2',  label: '原料準備',   fullLabel: '原料準備完了',   x: 50+DX*4,   y: R1Y },
    { id: 'p3',  label: '一次加工済', fullLabel: '一次加工済',     x: 50+DX*6,   y: R1Y },
    { id: 'p4',  label: '後加工済',   fullLabel: '後加工済',       x: 50+DX*8,   y: R1Y },
    { id: 'p5',  label: '採取済',     fullLabel: '試験片採取済',   x: 50+DX*7,   y: R2Y },
    { id: 'p6',  label: '評価済',     fullLabel: '評価済',         x: 50+DX*5,   y: R2Y },
    { id: 'p7',  label: '機械試験済', fullLabel: '機械試験済',     x: 50+DX*3,   y: R2Y },
    { id: 'p8',  label: '環境試験済', fullLabel: '環境試験済',     x: 50+DX*1,   y: R2Y },
    { id: 'p9',  label: '破面解析済', fullLabel: '破面解析済',     x: 50,        y: R3Y },
    { id: 'p10', label: '完了',       fullLabel: 'レポート完了',   x: 50+DX*2,   y: R3Y, isFinal: true },
    { id: 'p11', label: '廃棄',       fullLabel: '廃棄/不合格',    x: 50+DX*5,   y: R3Y, isReject: true },
  ],
  transitions: [
    // Row 1 (主フロー、左→右)
    { id: 't0',  label: '材料選定',   inputs: ['p0'],  outputs: ['p1'],   x: 50+DX*1, y: R1Y },
    { id: 't1',  label: '原料調達',   inputs: ['p1'],  outputs: ['p2'],   x: 50+DX*3, y: R1Y },
    { id: 't2',  label: '一次加工',   inputs: ['p2'],  outputs: ['p3'],   x: 50+DX*5, y: R1Y },
    { id: 't3',  label: '後加工',     inputs: ['p3'],  outputs: ['p4'],   x: 50+DX*7, y: R1Y },
    // 再加工フィードバック（Row1 上方の曲線弧）
    { id: 't4',  label: '再加工',     inputs: ['p4'],  outputs: ['p3'],   x: 50+DX*6, y: 28, isRework: true },
    // Row 1→2 ベンド
    { id: 't5',  label: '採取',       inputs: ['p4'],  outputs: ['p5'],   x: 50+DX*8, y: R2Y },
    // Row 2 (右→左)
    { id: 't6',  label: '評価',       inputs: ['p5'],  outputs: ['p6'],   x: 50+DX*6, y: R2Y },
    { id: 't7',  label: '機械試験',   inputs: ['p6'],  outputs: ['p7'],   x: 50+DX*4, y: R2Y },
    { id: 't8',  label: '環境試験',   inputs: ['p7'],  outputs: ['p8'],   x: 50+DX*2, y: R2Y },
    { id: 't9',  label: '破面解析',   inputs: ['p8'],  outputs: ['p9'],   x: 50,      y: R2Y },
    // Row 3 (左→右)
    { id: 't10', label: 'レポート',   inputs: ['p9'],  outputs: ['p10'],  x: 50+DX*1, y: R3Y },
    // 廃棄ブランチ（p6 下方）
    { id: 't11', label: '廃棄判定',   inputs: ['p6'],  outputs: ['p11'],  x: 50+DX*5, y: (R2Y+R3Y)/2, isReject: true },
  ],
}

export const ALL_PLACE_IDS: PlaceId[] = [
  'p0','p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11',
]

export const INITIAL_TOKENS: Record<PlaceId, number> = {
  p0: 1, p1: 0, p2: 0, p3: 0, p4: 0,
  p5: 0, p6: 0, p7: 0, p8: 0, p9: 0,
  p10: 0, p11: 0,
}
