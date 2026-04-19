// 純 TypeScript の Cooley-Tukey radix-2 FFT 実装。
// 依存ゼロ、切削波形ビューア (N=128) 程度の小規模用途を想定。
// 大きな N (>= 8192) が必要になったら、専用ライブラリへの差し替えを検討する。

/**
 * 入力長を次の 2 の冪まで 0 パディングする。in-place の FFT に渡すため。
 */
const padToPow2 = (values: readonly number[]): number[] => {
  let n = 1;
  while (n < values.length) n <<= 1;
  const out = new Array<number>(n).fill(0);
  for (let i = 0; i < values.length; i++) out[i] = values[i] ?? 0;
  return out;
};

/**
 * 実数信号の FFT。
 * 複素数配列 (Float64Array) の実部・虚部を別々に返す。
 *
 * - values: 実信号（時系列）
 * - 戻り値: { re, im, n }（n は 2 の冪にパディング後の長さ）
 */
export interface FFTResult {
  re: Float64Array;
  im: Float64Array;
  n: number;
}

export const fft = (values: readonly number[]): FFTResult => {
  const padded = padToPow2(values);
  const n = padded.length;
  // padToPow2 後は n が 2 の冪であることが保証される。n=1 だけが空・単点の退化ケース。
  if (n < 2) {
    return { re: new Float64Array([padded[0] ?? 0]), im: new Float64Array(1), n };
  }

  const re = new Float64Array(padded);
  const im = new Float64Array(n);

  // ビット反転並べ替え
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]!;
      re[i] = re[j]!;
      re[j] = tr;
      const ti = im[i]!;
      im[i] = im[j]!;
      im[j] = ti;
    }
  }

  // バタフライ
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const angleStep = (-2 * Math.PI) / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < half; k++) {
        const angle = angleStep * k;
        const wr = Math.cos(angle);
        const wi = Math.sin(angle);
        const iEven = start + k;
        const iOdd = iEven + half;
        const evenRe = re[iEven]!;
        const evenIm = im[iEven]!;
        const oddRe = re[iOdd]!;
        const oddIm = im[iOdd]!;
        const tr = wr * oddRe - wi * oddIm;
        const ti = wr * oddIm + wi * oddRe;
        re[iEven] = evenRe + tr;
        im[iEven] = evenIm + ti;
        re[iOdd] = evenRe - tr;
        im[iOdd] = evenIm - ti;
      }
    }
  }

  return { re, im, n };
};

/**
 * FFT 結果から片側振幅スペクトルを得る。
 * 戻り値は長さ N/2 + 1 の配列（DC から Nyquist まで包含）、
 * 各値は |X[k]| * 2 / N。ただし DC (k=0) と Nyquist (k=N/2) のみ 1/N。
 */
export const magnitudeSpectrum = (result: FFTResult): number[] => {
  const { re, im, n } = result;
  const half = n >> 1;
  const out = new Array<number>(half + 1).fill(0);
  for (let k = 0; k <= half; k++) {
    const mag = Math.hypot(re[k] ?? 0, im[k] ?? 0);
    // DC (k=0) と Nyquist (k=N/2) は実数スペクトル側でミラー対を持たないため 1/N、
    // それ以外はミラー分を足し合わせて 2/N
    const scale = k === 0 || k === half ? 1 / n : 2 / n;
    out[k] = mag * scale;
  }
  return out;
};

/**
 * 片側スペクトルの k 番目に対応する周波数 (Hz)。
 * sampleRateHz は入力信号のサンプリング周波数。
 */
export const binFrequency = (k: number, n: number, sampleRateHz: number): number =>
  (k * sampleRateHz) / n;
