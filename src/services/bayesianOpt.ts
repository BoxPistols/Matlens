/**
 * ベイズ最適化 (1D) — ガウス過程回帰 + Expected Improvement 獲得関数
 *
 * 金属材料の物性探索で「次に何を実験すべきか」を提案する。
 * 純 TypeScript 実装・外部依存なし。小規模データ (< 50 点) 向け。
 *
 * アルゴリズム:
 *   1. RBF カーネル k(x1, x2) = σ²·exp(-(x1-x2)²/(2·ℓ²))
 *   2. カーネル行列 K = k(xi, xj) + σ_n²·I (ノイズ項)
 *   3. Cholesky 分解 K = L·L^T → K^(-1)·y を解く
 *   4. 予測点 x* で平均 μ = k*^T · α、分散 σ² = k** - k*^T · K^(-1) · k*
 *   5. Expected Improvement EI(x) を最大化する点を次実験候補として返す
 *
 * 参考: Rasmussen & Williams "Gaussian Processes for Machine Learning" (2006) §2.2, 5.4.2
 */

// ─── カーネル ────────────────────────────────────────────────────────────────
export interface GPHyperParams {
  /** RBF カーネルの長さスケール (大きいほど滑らか) */
  lengthScale: number
  /** カーネルの分散 (出力スケール) */
  variance: number
  /** 観測ノイズの分散 (対数尤度の正則化にも寄与) */
  noise: number
}

export const DEFAULT_HYPER: GPHyperParams = {
  lengthScale: 1.0,
  variance: 1.0,
  noise: 0.05,
}

/**
 * RBF (squared exponential) カーネル。
 * x1, x2 は正規化済みの 1D 特徴量を想定。
 */
export function rbfKernel(x1: number, x2: number, h: GPHyperParams): number {
  const d = x1 - x2
  return h.variance * Math.exp(-(d * d) / (2 * h.lengthScale * h.lengthScale))
}

// ─── 線形代数ヘルパー (小規模 Cholesky) ──────────────────────────────────────

/**
 * 対称正定値行列の Cholesky 分解 A = L·L^T を計算する。
 * 返り値は下三角行列 L。
 * 数値不安定性に備えて diagonal に jitter を加えて呼ぶこと。
 */
function cholesky(A: number[][]): number[][] {
  const n = A.length
  const L: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0
      for (let k = 0; k < j; k++) {
        const lik = L[i]?.[k] ?? 0
        const ljk = L[j]?.[k] ?? 0
        sum += lik * ljk
      }
      const Li = L[i]!
      const Lj = L[j]!
      if (i === j) {
        const diag = (A[i]?.[i] ?? 0) - sum
        if (diag <= 0) {
          // 数値誤差で負になる場合があるので小さい正の値にクリップ
          Li[j] = Math.sqrt(Math.max(diag, 1e-10))
        } else {
          Li[j] = Math.sqrt(diag)
        }
      } else {
        const Ljj = Lj[j] ?? 1e-10
        Li[j] = ((A[i]?.[j] ?? 0) - sum) / Ljj
      }
    }
  }
  return L
}

/** L·x = b を x について解く (前進代入) */
function forwardSolve(L: number[][], b: number[]): number[] {
  const n = L.length
  const x: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let sum = b[i] ?? 0
    const Li = L[i]!
    for (let j = 0; j < i; j++) sum -= (Li[j] ?? 0) * (x[j] ?? 0)
    x[i] = sum / (Li[i] ?? 1e-10)
  }
  return x
}

/** L^T·x = b を x について解く (後退代入) */
function backwardSolve(L: number[][], b: number[]): number[] {
  const n = L.length
  const x: number[] = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i] ?? 0
    for (let j = i + 1; j < n; j++) sum -= (L[j]?.[i] ?? 0) * (x[j] ?? 0)
    x[i] = sum / (L[i]?.[i] ?? 1e-10)
  }
  return x
}

// ─── GP モデル ───────────────────────────────────────────────────────────────
export interface GPModel {
  xs: number[]
  ys: number[]
  h: GPHyperParams
  /** 前計算した α = K^(-1)·y (予測の高速化用) */
  alpha: number[]
  /** Cholesky 分解結果 (分散計算用) */
  L: number[][]
}

/**
 * 訓練データから GP モデルを学習する。
 *
 * @param xs 訓練入力 (1D)
 * @param ys 訓練出力
 * @param h  カーネルハイパーパラメータ
 */
export function fitGP(xs: number[], ys: number[], h: GPHyperParams = DEFAULT_HYPER): GPModel {
  const n = xs.length
  if (n === 0) throw new Error('fitGP: empty training data')
  if (xs.length !== ys.length) throw new Error('fitGP: xs/ys length mismatch')

  // K + noise*I
  const K: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const xi = xs[i] ?? 0
      const xj = xs[j] ?? 0
      const kij = rbfKernel(xi, xj, h)
      K[i]![j] = i === j ? kij + h.noise : kij
    }
  }

  const L = cholesky(K)
  // α = K^(-1)·y = L^(-T)·L^(-1)·y
  const z = forwardSolve(L, ys)
  const alpha = backwardSolve(L, z)

  return { xs: [...xs], ys: [...ys], h, alpha, L }
}

export interface GPPrediction {
  mean: number
  std: number
}

/**
 * 学習済み GP モデルで点 x における予測平均と標準偏差を返す。
 * 平均 μ(x*) = k*^T·α、分散 σ²(x*) = k(x*,x*) - v^T·v (v = L^(-1)·k*)
 */
export function predictGP(model: GPModel, x: number): GPPrediction {
  const n = model.xs.length
  const kStar: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    kStar[i] = rbfKernel(x, model.xs[i] ?? 0, model.h)
  }

  // mean = k*·α
  let mean = 0
  for (let i = 0; i < n; i++) mean += (kStar[i] ?? 0) * (model.alpha[i] ?? 0)

  // var = k(x,x) - |L^(-1)·k*|²
  const kxx = rbfKernel(x, x, model.h)
  const v = forwardSolve(model.L, kStar)
  let vv = 0
  for (let i = 0; i < n; i++) vv += (v[i] ?? 0) * (v[i] ?? 0)
  const variance = Math.max(kxx - vv, 0)
  return { mean, std: Math.sqrt(variance) }
}

// ─── 獲得関数 (Expected Improvement) ─────────────────────────────────────────

/** 標準正規分布の累積分布関数 (CDF) — Abramowitz & Stegun 7.1.26 近似 */
function normCdf(x: number): number {
  // erf 近似
  const a1 =  0.254829592
  const a2 = -0.284496736
  const a3 =  1.421413741
  const a4 = -1.453152027
  const a5 =  1.061405429
  const p  =  0.3275911
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + p * ax)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return 0.5 * (1 + sign * y)
}

/** 標準正規分布の確率密度関数 (PDF) */
function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

/**
 * Expected Improvement 獲得関数。
 * 最大化問題として現在の最良値 `yBest` を更新する期待値を返す。
 * `ξ` は exploration parameter (大きいほど探索寄り)。
 */
export function expectedImprovement(
  pred: GPPrediction,
  yBest: number,
  xi = 0.01,
): number {
  if (pred.std < 1e-9) return 0
  const improvement = pred.mean - yBest - xi
  const z = improvement / pred.std
  const ei = improvement * normCdf(z) + pred.std * normPdf(z)
  // EI は理論上非負だが、改善が非常に小さい場合に浮動小数誤差で
  // -1e-17 程度の値が出ることがあるためクランプする。
  return Math.max(0, ei)
}

// ─── 候補提案 ────────────────────────────────────────────────────────────────

export interface Suggestion {
  x: number
  mean: number
  std: number
  ei: number
}

/**
 * 探索範囲を等間隔にスキャンして EI 最大点を返す。
 * 可視化用に全グリッド点の予測値も同時に返す。
 */
export function suggestNext(
  model: GPModel,
  xMin: number,
  xMax: number,
  nGrid = 100,
  xi = 0.01,
): { best: Suggestion; grid: Suggestion[] } {
  if (nGrid < 2) throw new Error('suggestNext: nGrid must be ≥ 2')
  const yBest = Math.max(...model.ys)
  const grid: Suggestion[] = []
  let best: Suggestion | null = null
  const step = (xMax - xMin) / (nGrid - 1)
  for (let i = 0; i < nGrid; i++) {
    const x = xMin + step * i
    const pred = predictGP(model, x)
    const ei = expectedImprovement(pred, yBest, xi)
    const point: Suggestion = { x, mean: pred.mean, std: pred.std, ei }
    grid.push(point)
    if (best === null || ei > best.ei) best = point
  }
  // grid は必ず 1 点以上あるので best は non-null (TS 向けの assert)
  if (!best) throw new Error('suggestNext: grid is empty')
  return { best, grid }
}

// ─── 正規化ユーティリティ ──────────────────────────────────────────────────

/** min-max 正規化 (配列 → [0, 1] 区間) */
export function normalize(values: number[]): { normalized: number[]; min: number; max: number } {
  if (values.length === 0) return { normalized: [], min: 0, max: 1 }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  if (range === 0) return { normalized: values.map(() => 0.5), min, max }
  return {
    normalized: values.map(v => (v - min) / range),
    min,
    max,
  }
}

/** 正規化を元のスケールに戻す */
export function denormalize(v: number, min: number, max: number): number {
  return min + v * (max - min)
}
