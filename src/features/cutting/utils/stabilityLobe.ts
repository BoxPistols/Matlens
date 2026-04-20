// Stability Lobe Diagram (SLD) 計算。
// Altintas & Budak (2012) "Manufacturing Automation" Ch.3 の単一自由度モデル。
//
// 理論の要点:
//   切削プロセスの振動現象（チャタ）は、前回転で残された加工面起伏を
//   現在刃が再切削することで励起される self-excited vibration。
//   安定性限界切込み深さ blim と主軸回転数 N の関係式は
//
//     blim(ωc) = -1 / ( 2 · Kc · N_teeth · Re{Φ(ωc)} )     ただし Re{Φ} < 0
//     N        = 60 · ωc / ( 2π · (k + 1 - ε/π) )          [rpm]
//     ε        = π - 2·arctan( Re{Φ(ωc)} / Im{Φ(ωc)} )     位相遅れ
//
//   ここで
//     Φ(ωc) = 構造系の frequency response function (FRF)
//     Re/Im = 実部・虚部
//     Kc    = 単位切削力 (N/mm²)
//     N_teeth = 刃数
//     k     = ローブ番号（0,1,2,...）
//
// 単一 DOF（modal mass m、natural freq ωn、damping ratio ζ）の FRF:
//     Φ(ω) = 1 / ( m · (ωn² - ω² + j·2ζωnω) )
//
// 本モジュールは純 TS。複素数は { re, im } のオブジェクトで扱う。
// 結果は UI（Stability Lobe オーバーレイ）から参照される想定。

export interface ModalParams {
  /** モード質量 (kg) — 実測 impact test から同定 */
  mass: number;
  /** 固有周波数 (Hz) */
  fn_Hz: number;
  /** 減衰比 (無次元、0〜1) */
  zeta: number;
}

export interface SLDInputs {
  /** 構造モード（通常 1 つ。複数モードは将来拡張） */
  modal: ModalParams;
  /** 単位切削力 (N/mm²) */
  Kc_N_mm2: number;
  /** 刃数 */
  teeth: number;
  /** ローブ番号の上限（0 から lobesMax-1 まで描画） */
  lobesMax?: number;
  /** 周波数サンプル数（多いほど曲線が滑らか） */
  samples?: number;
}

export interface SLDPoint {
  /** 主軸回転数 (rpm) */
  spindleRpm: number;
  /** 限界切込み深さ blim (mm) */
  blim_mm: number;
  /** ローブ番号 */
  lobe: number;
  /** チャタ周波数 (Hz) */
  chatterFreq_Hz: number;
}

/**
 * 単一 DOF FRF の実部・虚部を計算。
 * Φ(ω) = 1 / ( m · (ωn² - ω² + j·2ζωnω) )
 */
const frfSingleDOF = (
  omega: number,
  modal: ModalParams
): { re: number; im: number } => {
  const { mass, fn_Hz, zeta } = modal;
  const omega_n = 2 * Math.PI * fn_Hz;
  const denomRe = omega_n * omega_n - omega * omega;
  const denomIm = 2 * zeta * omega_n * omega;
  // Φ = 1 / (m · (denomRe + j·denomIm))
  //   = 1/m · (denomRe - j·denomIm) / (denomRe² + denomIm²)
  const magSq = denomRe * denomRe + denomIm * denomIm;
  if (magSq === 0 || mass <= 0) return { re: 0, im: 0 };
  return {
    re: denomRe / (mass * magSq),
    im: -denomIm / (mass * magSq),
  };
};

/**
 * SLD 曲線を生成する。
 * チャタ周波数 ωc を固有周波数周辺で掃引し、各ローブ k について
 * (spindleRpm, blim) の組を返す。Re{Φ(ωc)} が正（安定側）の領域は
 * 除外する。
 */
export const computeStabilityLobes = (inputs: SLDInputs): SLDPoint[] => {
  const { modal, Kc_N_mm2, teeth } = inputs;
  const lobesMax = inputs.lobesMax ?? 5;
  const samples = inputs.samples ?? 200;
  if (teeth <= 0 || Kc_N_mm2 <= 0) return [];

  // 掃引レンジ: fn を中心に 0.9fn〜1.4fn（単一 DOF のチャタは概ねこの帯域）。
  const fLow = 0.9 * modal.fn_Hz;
  const fHigh = 1.4 * modal.fn_Hz;

  // 単位整合: Re{Φ} は m/N で得られるので、Kc を N/m² (= N/mm² × 1e6) に揃え、
  // blim_m を計算したうえで mm に変換する。
  const Kc_SI = Kc_N_mm2 * 1e6; // N/m²

  const points: SLDPoint[] = [];
  for (let k = 0; k < lobesMax; k++) {
    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      const fc = fLow + (fHigh - fLow) * t;
      const omega_c = 2 * Math.PI * fc;
      const { re, im } = frfSingleDOF(omega_c, modal);
      if (re >= 0) continue; // Re(Φ) > 0 は安定域、blim は負になる

      const blim_m = -1 / (2 * Kc_SI * teeth * re);
      const blim = blim_m * 1000; // mm
      if (!Number.isFinite(blim) || blim <= 0 || blim > 200) continue;

      // 位相遅れ ε = π - 2ψ、ψ = atan(Re/Im) (Altintas 2012 eq 3.38)。
      // Im が 0 付近では数値不安定になりうるので下限ガード。
      if (Math.abs(im) < 1e-18) continue;
      const psi = Math.atan(re / im);
      const epsilon = Math.PI - 2 * psi;
      const T = (2 * Math.PI * k + epsilon) / omega_c; // 刃通過周期 [s]
      if (T <= 0) continue;
      const fTooth = 1 / T; // 刃通過周波数 [Hz]
      const N = (60 * fTooth) / teeth; // [rpm]
      if (!Number.isFinite(N) || N <= 0 || N > 120_000) continue;

      points.push({
        spindleRpm: N,
        blim_mm: blim,
        lobe: k,
        chatterFreq_Hz: fc,
      });
    }
  }

  // 主軸回転数でソートしておくと UI 側でそのまま折れ線が引ける
  return points.sort((a, b) => a.spindleRpm - b.spindleRpm);
};

/**
 * 指定の主軸回転数で最も低い blim（＝最も厳しい安定性限界）を返す。
 * SLD 曲線上の「下側の包絡線」に相当。
 */
export const minBlimAtRpm = (
  rpm: number,
  points: SLDPoint[],
  toleranceRpm = 50
): number | null => {
  let best: number | null = null;
  for (const p of points) {
    if (Math.abs(p.spindleRpm - rpm) > toleranceRpm) continue;
    if (best === null || p.blim_mm < best) best = p.blim_mm;
  }
  return best;
};

/**
 * 工具径から代表的なモード特性を推定する（工具データが無いときの近似）。
 * L/D 比 3〜5 程度の一般的エンドミル突き出しを前提とした経験値。
 * あくまでデモ用。実運用では impact test からの同定値を使うべき。
 */
export const approximateModalParams = (
  toolDiameterMm: number,
  toolMaterial: 'HSS' | 'carbide' | 'ceramic' | 'CBN' = 'carbide'
): ModalParams => {
  // 径が大きいほど剛性高 → fn 高。材種で E が変わる影響はざっくり。
  const fn = toolMaterial === 'HSS'
    ? 500 + toolDiameterMm * 40
    : toolMaterial === 'carbide'
      ? 700 + toolDiameterMm * 50
      : 900 + toolDiameterMm * 60;
  const mass = 0.05 + toolDiameterMm * 0.02; // [kg] 極近似
  return { mass, fn_Hz: fn, zeta: 0.03 };
};
