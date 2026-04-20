// Kienzle 切削抵抗モデル。
// 単位切削力 Kc を用いて切削抵抗 Fc を算出する古典的モデル。
//
// 旋削:  Fc = Kc · h · b
// ミーリング (average): Fc_avg ≈ Kc · h_m · ap · z_avg
// Kienzle 拡張: Kc = Kc1.1 · h^(-mc)
//   → Fc = Kc1.1 · h^(1 - mc) · b
// where
//   Kc1.1 = 単位切削力 (N/mm²、h=1mm, b=1mm のとき)
//   h     = 切りくず厚さ (mm)
//   b     = 切りくず幅 (mm) = 切込み深さ ap
//   mc    = Kienzle 指数（被削材依存、0.2〜0.4）
//
// 参考: DIN 6580-6584 / Sandvik Coromant "Training Handbook"

import { KIENZLE_COEFFICIENTS } from './standards';

export interface KienzleParams {
  /** 単位切削力 (N/mm²) */
  kc11: number;
  /** Kienzle 指数 (0 < mc < 1) */
  mc: number;
}

export interface KienzleInput {
  /** 切りくず厚さ (mm) — 旋削では f·sinκ、ミーリングでは fz·sin(φ) */
  h: number;
  /** 切りくず幅 (mm) — 旋削では ap/sinκ、ミーリングでは ap */
  b: number;
}

/**
 * 切削抵抗 Fc [N] を算出。
 * h <= 0 / b <= 0 のときは 0 を返す（退化ケース）。
 */
export const cuttingForceFc = (
  { h, b }: KienzleInput,
  params: KienzleParams
): number => {
  if (h <= 0 || b <= 0) return 0;
  const { kc11, mc } = params;
  return kc11 * Math.pow(h, 1 - mc) * b;
};

/**
 * 主軸動力 P [kW] の推定。
 *   P = Fc · Vc / (60 · 1000 · η)
 * η: 機械効率（0.7〜0.85 一般的、本関数では既定 0.8）
 */
export const spindlePowerKW = (
  Fc_N: number,
  Vc_m_per_min: number,
  efficiency = 0.8
): number => {
  if (Fc_N <= 0 || Vc_m_per_min <= 0) return 0;
  return (Fc_N * Vc_m_per_min) / (60_000 * Math.max(0.01, efficiency));
};

/**
 * 材料除去率 MRR [cm³/min]。
 *   旋削:    MRR = Vc · f · ap (mm·mm·mm/min → /1000 で cm³/min)
 *   ミーリング: MRR = ae · ap · vf
 *     vf = fz · z · n (送り速度 mm/min)
 */
export const MRR_turning = (Vc: number, f: number, ap: number): number => {
  if (Vc <= 0 || f <= 0 || ap <= 0) return 0;
  // 旋削の材料除去率:
  //   Vc [m/min] × 1000 = [mm/min]
  //   MRR [mm³/min] = Vc[mm/min] · f[mm/rev] · ap[mm]
  //   cm³/min 換算は /1000。結果として MRR[cm³/min] = Vc[m/min] · f · ap
  return Vc * f * ap;
};

export const MRR_milling = (
  vf_mm_per_min: number,
  ae: number,
  ap: number
): number => {
  if (vf_mm_per_min <= 0 || ae <= 0 || ap <= 0) return 0;
  return (vf_mm_per_min * ae * ap) / 1000; // cm³/min
};

/**
 * 材料 id からデフォルト Kienzle パラメータを取得。
 * 未登録材料は汎用鋼相当（kc11=2000, mc=0.25）でフォールバック。
 */
export const kienzleFor = (materialId: string): KienzleParams => {
  const found = KIENZLE_COEFFICIENTS[materialId];
  if (found) return { kc11: found.kc11, mc: found.mc };
  return { kc11: 2000, mc: 0.25 };
};

/**
 * 一括推定ヘルパ。
 * 旋削条件（Vc / f / ap）と材料から Fc, P, MRR をまとめて返す。
 */
export interface TurningEstimate {
  Fc_N: number;
  P_kW: number;
  MRR_cm3_per_min: number;
  params: KienzleParams;
}

export const estimateTurning = (
  materialId: string,
  Vc_m_per_min: number,
  f_mm_per_rev: number,
  ap_mm: number,
  efficiency = 0.8
): TurningEstimate => {
  const params = kienzleFor(materialId);
  // 旋削の h, b は主切刃角 κ に依存するが、κ=90° 相当で h=f, b=ap
  const Fc = cuttingForceFc({ h: f_mm_per_rev, b: ap_mm }, params);
  const P = spindlePowerKW(Fc, Vc_m_per_min, efficiency);
  const MRR = MRR_turning(Vc_m_per_min, f_mm_per_rev, ap_mm);
  return { Fc_N: Fc, P_kW: P, MRR_cm3_per_min: MRR, params };
};
