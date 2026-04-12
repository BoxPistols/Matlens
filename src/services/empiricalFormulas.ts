/**
 * 経験式シミュレーション — Phase E Tier 1
 *
 * 金属材料工学でよく使われる経験式・半理論式を純 TypeScript で実装。
 * 「参考値」として提示し、実測データとの差異を明示する教育・探索用途。
 *
 * 各式の出典・前提条件・適用範囲はコメントと UI の解説パネルで開示する。
 */

// ─── Hall-Petch 式 ──────────────────────────────────────────────────────────
/**
 * Hall-Petch 式: 結晶粒径 → 降伏応力
 *
 *   σy = σ0 + k / √d
 *
 * @param sigma0 - 格子摩擦応力 σ₀ (MPa)。鉄: ~70, アルミ: ~20, 銅: ~25
 * @param k      - Hall-Petch 係数 k (MPa·√μm)。鉄: ~600, アルミ: ~100
 * @param grainSize - 平均結晶粒径 d (μm)
 * @returns 推定降伏応力 σy (MPa)
 *
 * 参考: E.O. Hall (1951), N.J. Petch (1953)
 * 適用範囲: 粒径 > 0.1 μm (ナノ領域では逆 Hall-Petch が起こる)
 */
export function hallPetch(sigma0: number, k: number, grainSize: number): number {
  if (grainSize <= 0) return sigma0
  return sigma0 + k / Math.sqrt(grainSize)
}

/** Hall-Petch のデフォルトパラメータ (代表的な金属) */
export const HALL_PETCH_PRESETS: Record<string, { sigma0: number; k: number; label: string }> = {
  iron:     { sigma0: 70,  k: 600, label: '鉄 (α-Fe)' },
  aluminum: { sigma0: 20,  k: 100, label: 'アルミニウム' },
  copper:   { sigma0: 25,  k: 110, label: '銅' },
  titanium: { sigma0: 80,  k: 300, label: 'チタン (α)' },
}

// ─── Larson-Miller パラメータ ────────────────────────────────────────────────
/**
 * Larson-Miller パラメータ (LMP): 温度×時間 → クリープ寿命
 *
 *   LMP = T × (C + log10(t))
 *
 * @param tempK  - 温度 T (K)
 * @param timeH  - 破断時間 t (h)
 * @param C      - 材料定数 C (一般的に 20)
 * @returns LMP 値 (無次元)
 *
 * 参考: Larson & Miller (1952)
 * 用途: 異なる温度・時間条件のクリープデータを 1 本のマスターカーブに統合。
 *       高温構造材 (Ni 基超合金, 耐熱鋼) の寿命評価に使用。
 */
export function larsonMillerParameter(tempK: number, timeH: number, C = 20): number {
  if (tempK <= 0 || timeH <= 0) return 0
  return tempK * (C + Math.log10(timeH))
}

/**
 * LMP から破断時間を逆算する。
 * @param lmp   - Larson-Miller パラメータ
 * @param tempK - 温度 T (K)
 * @param C     - 材料定数 (default 20)
 * @returns 推定破断時間 (h)
 */
export function lmpToTime(lmp: number, tempK: number, C = 20): number {
  if (tempK <= 0) return 0
  const logT = lmp / tempK - C
  return Math.pow(10, logT)
}

// ─── JMAK 式 (Johnson-Mehl-Avrami-Kolmogorov) ──────────────────────────────
/**
 * JMAK 式: 時間 → 変態分率 (再結晶、相変態)
 *
 *   X(t) = 1 - exp(-k × t^n)
 *
 * @param t - 時間
 * @param k - 反応速度定数 (温度依存)
 * @param n - Avrami 指数 (核生成・成長メカニズムに依存、通常 1〜4)
 * @returns 変態分率 X (0〜1)
 *
 * 参考: Avrami (1939-1941), Johnson & Mehl (1939), Kolmogorov (1937)
 * 用途: 再結晶分率、ベイナイト変態、析出反応の時間依存性をモデル化。
 */
export function jmak(t: number, k: number, n: number): number {
  if (t <= 0 || k <= 0) return 0
  const x = 1 - Math.exp(-k * Math.pow(t, n))
  return Math.min(Math.max(x, 0), 1) // clamp [0, 1]
}

// ─── ROM (Rule of Mixtures) ─────────────────────────────────────────────────
/**
 * 複合則 (Rule of Mixtures): 複合材料の弾性率推定
 *
 * 上界 (Voigt): E = Vf × Ef + (1-Vf) × Em  (等ひずみ仮定)
 * 下界 (Reuss): 1/E = Vf/Ef + (1-Vf)/Em     (等応力仮定)
 *
 * @param Ef - 強化材の弾性率 (GPa)
 * @param Em - マトリックスの弾性率 (GPa)
 * @param Vf - 強化材の体積分率 (0〜1)
 * @returns { voigt, reuss } — 上界・下界の推定弾性率 (GPa)
 *
 * 用途: 繊維強化複合材、粒子分散強化材の初期設計。
 *       実測値は通常この上下界の間に入る。
 */
export function ruleOfMixtures(
  Ef: number, Em: number, Vf: number,
): { voigt: number; reuss: number } {
  const vf = Math.min(Math.max(Vf, 0), 1)
  const voigt = vf * Ef + (1 - vf) * Em
  const reuss = Ef > 0 && Em > 0
    ? 1 / (vf / Ef + (1 - vf) / Em)
    : 0
  return { voigt, reuss }
}
