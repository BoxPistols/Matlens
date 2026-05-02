// Taylor 工具寿命式。
// 基本形: V · T^n = C
//   V = 切削速度 (m/min)
//   T = 工具寿命 (min)  = VB 限界到達までの時間
//   n = 温度感受性指数（工具材種依存、0.1〜0.6）
//   C = 基準速度（T=1 min のときの V、材料・加工条件依存）
//
// 拡張形 (Taylor-Kronenberg): V · T^n · f^α · ap^β = C
//   f = 送り (mm/rev), ap = 切込み深さ (mm), α ≈ 0.2〜0.35, β ≈ 0.1〜0.2
//
// 本モジュールは純関数のみを export する。UI は結果を受け取って描画する。

import type { ToolMaterial } from '@/domain/types';
import { TAYLOR_EXPONENT_BY_TOOL } from './standards';

export interface TaylorParams {
  /** Taylor 指数 n */
  n: number;
  /** 定数 C (= V at T=1 min) */
  C: number;
}

/**
 * 工具寿命を算出する。
 * T = (C / V)^(1/n)
 */
export const toolLifeMin = (V: number, params: TaylorParams): number => {
  if (V <= 0 || params.n <= 0 || params.C <= 0) return 0;
  return Math.pow(params.C / V, 1 / params.n);
};

/**
 * ある希望寿命 T を満たす最大許容切削速度を逆算する。
 * V = C / T^n
 */
export const allowableCuttingSpeed = (
  T_min: number,
  params: TaylorParams
): number => {
  if (T_min <= 0 || params.n <= 0 || params.C <= 0) return 0;
  return params.C / Math.pow(T_min, params.n);
};

/**
 * 既知の (V, T) サンプルから C を推定する。
 *   C = V · T^n
 *
 * n は工具材種から仮置きし、サンプルが複数あれば対数線形回帰で (n, C) を
 * 同時推定する `fitTaylor` を使う方が精度が高い。
 */
export const inferC = (V: number, T_min: number, n: number): number => {
  if (V <= 0 || T_min <= 0 || n <= 0) return 0;
  return V * Math.pow(T_min, n);
};

/**
 * 複数の (V, T) サンプルから (n, C) を最小二乗推定する。
 *   log V = log C - n · log T
 *   y = a + b·x  (y = log V, x = log T, a = log C, b = -n)
 *
 * 返り値:
 *   { n, C, r2, points: 入力をそのまま返す }
 * - points が 2 未満なら null を返す（推定不能）。
 * - r2 は決定係数（0〜1、1 に近いほど当てはまり良好）。
 */
export interface TaylorFitResult {
  n: number;
  C: number;
  r2: number;
  /**
   * 対数 V の残差標準偏差 (log m/min)。
   * 予測 T の信頼区間は T_pred · exp(±k · sigmaLogV / n) で求める
   * （k=1: ≈68%、k=2: ≈95%）。サンプル数 < 3 のときは 0 になる。
   */
  sigmaLogV: number;
  points: Array<{ V: number; T: number }>;
}

export interface ToolLifePrediction {
  /** 中央値（最尤推定）の寿命 T (min) */
  T: number;
  /** ±1σ の下/上限（min）。回帰不可の場合は T と同値 */
  T_lower1: number;
  T_upper1: number;
  /** ±2σ の下/上限（min）。回帰不可の場合は T と同値 */
  T_lower2: number;
  T_upper2: number;
}

/**
 * Taylor フィットから予測寿命 T と ±1σ / ±2σ の信頼区間を返す純関数。
 * fit が null（サンプル不足）のときはデフォルトパラメータで点推定のみ返す。
 */
export const predictToolLifeWithBands = (
  V: number,
  params: TaylorParams,
  sigmaLogV: number,
): ToolLifePrediction => {
  const T = toolLifeMin(V, params);
  if (T === 0 || sigmaLogV === 0 || params.n <= 0) {
    return { T, T_lower1: T, T_upper1: T, T_lower2: T, T_upper2: T };
  }
  const sigmaLogT = sigmaLogV / params.n;
  return {
    T,
    T_lower1: T * Math.exp(-sigmaLogT),
    T_upper1: T * Math.exp(sigmaLogT),
    T_lower2: T * Math.exp(-2 * sigmaLogT),
    T_upper2: T * Math.exp(2 * sigmaLogT),
  };
};

/**
 * 残寿命予測。Taylor 式の総予測寿命から、累積使用時間を引いて残時間を返す。
 * 残時間と現在 Vc から残切削距離 (mm) も併せて返す。
 */
export interface RemainingLifeEstimate {
  /** 残り時間 (min)。0 未満は寿命到達済とみなして 0 にクランプ */
  remainingMin: number;
  /** 残り切削距離 (mm) */
  remainingDistanceMm: number;
  /** 使用率 0..1 (cumulativeMin / predictedT) */
  usageRatio: number;
}

export const estimateRemainingLife = (
  predictedTotalT: number,
  cumulativeMin: number,
  V: number,
): RemainingLifeEstimate => {
  if (predictedTotalT <= 0) {
    return { remainingMin: 0, remainingDistanceMm: 0, usageRatio: 0 };
  }
  const remainingMin = Math.max(predictedTotalT - cumulativeMin, 0);
  const remainingDistanceMm = remainingMin * Math.max(V, 0) * 1000;
  const usageRatio = Math.min(cumulativeMin / predictedTotalT, 1);
  return { remainingMin, remainingDistanceMm, usageRatio };
};

export const fitTaylor = (
  points: Array<{ V: number; T: number }>
): TaylorFitResult | null => {
  const valid = points.filter((p) => p.V > 0 && p.T > 0);
  if (valid.length < 2) return null;

  const xs = valid.map((p) => Math.log(p.T));
  const ys = valid.map((p) => Math.log(p.V));
  const n_size = xs.length;
  const xMean = xs.reduce((s, x) => s + x, 0) / n_size;
  const yMean = ys.reduce((s, y) => s + y, 0) / n_size;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n_size; i++) {
    num += (xs[i]! - xMean) * (ys[i]! - yMean);
    den += (xs[i]! - xMean) ** 2;
  }
  if (den === 0) return null;
  const b = num / den; // slope
  const a = yMean - b * xMean; // intercept

  const n = -b;
  const C = Math.exp(a);

  // R^2 (coefficient of determination) と残差標準偏差 sigmaLogV を同時に計算
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n_size; i++) {
    const yHat = a + b * xs[i]!;
    ssRes += (ys[i]! - yHat) ** 2;
    ssTot += (ys[i]! - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  // 自由度 n_size - 2 (傾き + 切片)。サンプル不足時は 0 とする。
  const sigmaLogV = n_size > 2 ? Math.sqrt(ssRes / (n_size - 2)) : 0;

  return { n, C, r2, sigmaLogV, points: valid };
};

/**
 * 工具材種からデフォルトの Taylor パラメータを取得する。
 * C はサンプル不在時の仮値。実データがあれば fitTaylor の結果で上書き推奨。
 */
export const defaultParamsForTool = (material: ToolMaterial): TaylorParams => {
  const n = TAYLOR_EXPONENT_BY_TOOL[material];
  // C の代表値: 工具材種ごとに概ね V_ref * T_ref^n で逆算
  //   V_ref = 100 m/min, T_ref = 60 min を基準とした近似値
  const C_table: Record<ToolMaterial, number> = {
    HSS: 100 * Math.pow(60, 0.125),
    carbide: 200 * Math.pow(60, 0.25),
    coated_carbide: 260 * Math.pow(60, 0.3),
    cermet: 280 * Math.pow(60, 0.32),
    ceramic: 350 * Math.pow(60, 0.5),
    CBN: 400 * Math.pow(60, 0.55),
    PCD: 450 * Math.pow(60, 0.6),
  };
  return { n, C: C_table[material] };
};
