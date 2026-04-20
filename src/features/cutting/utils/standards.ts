// 切削プロセス・工具摩耗の参照規格定数。
// 出典は ISO 3685:1993 / ISO 8688 / JIS B 4004 系の一般的な基準値。
// 本 PoC では「実運用で参照される閾値」を一元化し、数式モジュールから参照する。
// 貴社ルールが異なる場合は本ファイルの値を調整するだけで追従できる。

import type { ToolMaterial } from '@/domain/types';

/**
 * ISO 3685:1993 工具寿命判定基準（単刃工具）。
 * VB_avg と VB_max のいずれかが閾値に達した時点を寿命とする。
 */
export const VB_CRITERIA = {
  /** 平均摩耗幅の基準値 (mm) */
  finishing: {
    average: 0.3,
    max: 0.5,
    description: '仕上げ加工 / 高速度鋼・超硬（ISO 3685）',
  },
  roughing: {
    average: 0.6,
    max: 1.0,
    description: '荒加工（工具損傷リスク許容時、ISO 3685 / 現場運用）',
  },
  ceramic: {
    average: 0.4,
    max: 0.7,
    description: 'セラミクス・CBN（靭性低めのため早めに交換）',
  },
} as const;

/**
 * 表面粗さ Ra の目安（ISO 4287 / JIS B 0601）。
 * 加工種別ごとに期待される仕上がりレンジ（µm）。
 */
export const SURFACE_ROUGHNESS_RA = {
  rough_milling: { min: 6.3, max: 25, label: '荒フライス' },
  finish_milling: { min: 1.6, max: 6.3, label: '仕上げフライス' },
  rough_turning: { min: 3.2, max: 12.5, label: '荒旋削' },
  finish_turning: { min: 0.8, max: 3.2, label: '仕上げ旋削' },
  grinding: { min: 0.1, max: 1.6, label: '研削' },
  precision_grinding: { min: 0.025, max: 0.4, label: '精密研削' },
} as const;

/**
 * Taylor 工具寿命式 V·T^n = C の指数 n の代表値。
 * 出典: Sandvik Coromant / Kennametal 公開技術資料 / Kalpakjian "Manufacturing Engineering"
 * 値が大きいほど温度感受性が低い（＝切削速度を上げても寿命が落ちにくい）。
 */
export const TAYLOR_EXPONENT_BY_TOOL: Record<ToolMaterial, number> = {
  HSS: 0.125,
  carbide: 0.25,
  coated_carbide: 0.3,
  cermet: 0.32,
  ceramic: 0.5,
  CBN: 0.55,
  PCD: 0.6,
};

/**
 * Kienzle 切削抵抗式 Fc = Kc1.1 · h^(1-mc) · b の代表係数。
 * 被削材 Material.id → { kc11: 単位切削力 [N/mm²], mc: Kienzle 指数 }
 * Kc1.1 は h=1mm, b=1mm のときの切削抵抗。
 * 出典: Sandvik Coromant / DIN 6580-6584 系の標準値を参考に簡素化。
 *
 * NOTE: 本 PoC では代表値のみを保持する。貴社の被削材標準値 (SES / MS /
 * material certificate) がある場合はそちらで上書きするのが望ましい。
 */
export const KIENZLE_COEFFICIENTS: Record<
  string,
  { kc11: number; mc: number; note?: string }
> = {
  mat_s45c: { kc11: 1990, mc: 0.26 },
  mat_scm440: { kc11: 2200, mc: 0.26 },
  mat_sus304: { kc11: 2000, mc: 0.25 },
  mat_sus316l: { kc11: 2050, mc: 0.25 },
  mat_ti6al4v: { kc11: 2200, mc: 0.25, note: '加工硬化 + 熱集中に注意' },
  mat_inconel718: {
    kc11: 2600,
    mc: 0.24,
    note: '難削材。CBN / セラミクスで低 Vc 推奨',
  },
  mat_a5052: { kc11: 700, mc: 0.22 },
  mat_a7075: { kc11: 820, mc: 0.22 },
  mat_c1100: { kc11: 900, mc: 0.24 },
  mat_peek: { kc11: 350, mc: 0.2, note: '樹脂。温度上昇で粘性流動あり' },
  mat_cfrp: { kc11: 1400, mc: 0.3, note: '繊維方向依存が大。ダイヤ系推奨' },
  mat_al2o3: { kc11: 3200, mc: 0.4, note: '研削前提' },
};

/**
 * MaiML (JIS K 0200:2024) の測定結果に必須となる項目。
 * 本 PoC では `Test.resultMetrics` に以下が埋まっていないと準拠と見なせない、
 * という検証ルールを UI 側で使う想定。
 */
export const MAIML_REQUIRED_FIELDS = [
  'value', // 測定値
  'unit', // 単位
  'uncertainty', // 不確かさ（標準偏差 or k=2 拡張不確かさ）
  'method', // 試験方法の参照（規格 id）
  'conditions', // 試験条件（温度・雰囲気など）
  'provenance', // 計測器 / オペレータ / 校正証明の紐付け
] as const;

/**
 * VB 閾値判定ヘルパ。工具摩耗 VB から寿命到達 / 要注意を判定する。
 */
export type VBStatus = 'ok' | 'warn' | 'end_of_life';

export const classifyVB = (
  vbMm: number,
  regime: keyof typeof VB_CRITERIA = 'finishing'
): VBStatus => {
  const { average, max } = VB_CRITERIA[regime];
  if (vbMm >= max) return 'end_of_life';
  if (vbMm >= average) return 'warn';
  return 'ok';
};
