// 切削条件 散布図の軸 / 色 / マーカー形状を定義する純データ。
// ConditionScatter の SVG ロジックから「どの値を / どう色付けするか」の
// 知識を切り出してテスト可能にする。

import type { CoolantType, CuttingProcess } from '@/domain/types';

// ---------------------------------------------------------------------------
// 軸（Vc / f / ap）
// ---------------------------------------------------------------------------

export type ScatterAxisKey = 'cuttingSpeed' | 'feed' | 'depthOfCut';

export interface ScatterAxisDef {
  key: ScatterAxisKey;
  label: string;
  unit: string;
  /** プロセスから値を取り出す（null になり得る場合は number | null） */
  get: (p: CuttingProcess) => number;
}

export const SCATTER_AXES: Record<ScatterAxisKey, ScatterAxisDef> = {
  cuttingSpeed: {
    key: 'cuttingSpeed',
    label: '切削速度 Vc',
    unit: 'm/min',
    get: (p) => p.condition.cuttingSpeed,
  },
  feed: {
    key: 'feed',
    label: '送り f',
    unit: 'mm/rev or mm/tooth',
    get: (p) => p.condition.feed,
  },
  depthOfCut: {
    key: 'depthOfCut',
    label: '切込み ap',
    unit: 'mm',
    get: (p) => p.condition.depthOfCut,
  },
};

// ---------------------------------------------------------------------------
// 色分けモード
// ---------------------------------------------------------------------------

export type ScatterColorMode = 'chatter' | 'toolWear' | 'surfaceRoughness';

export const COLOR_MODE_LABEL: Record<ScatterColorMode, string> = {
  chatter: 'びびり有無',
  toolWear: '工具摩耗 VB',
  surfaceRoughness: '表面粗さ Ra',
};

const STABLE_BLUE = 'rgba(37, 99, 235, 0.72)'; // blue-600
const CHATTER_RED = 'rgba(239, 68, 68, 0.78)'; // red-500
const NEUTRAL_GRAY = 'rgba(148, 163, 184, 0.55)'; // slate-400

/**
 * 工具摩耗 VB を 0..0.6 mm 想定で緑→黄→赤に補間。
 * 0.3 mm（ISO 3685 仕上げ限界）で黄、0.6 mm（荒加工限界）で赤に到達。
 */
function colorByVB(vb: number): string {
  if (vb < 0.3) {
    const t = vb / 0.3;
    // 緑 #22c55e → 黄 #eab308
    return `rgba(${Math.round(34 + (234 - 34) * t)}, ${Math.round(197 + (179 - 197) * t)}, ${Math.round(94 + (8 - 94) * t)}, 0.78)`;
  }
  const t = Math.min((vb - 0.3) / 0.3, 1);
  // 黄 → 赤 #ef4444
  return `rgba(${Math.round(234 + (239 - 234) * t)}, ${Math.round(179 + (68 - 179) * t)}, ${Math.round(8 + (68 - 8) * t)}, 0.85)`;
}

/**
 * 表面粗さ Ra を 0..3.2 µm 想定で青→紫→赤に補間。
 * Ra > 3.2 は仕上げ品質要件を超過している扱い。
 */
function colorByRa(ra: number): string {
  const t = Math.min(ra / 3.2, 1);
  // 青 #2563eb → 紫 #a855f7 → 赤 #ef4444
  if (t < 0.5) {
    const u = t / 0.5;
    return `rgba(${Math.round(37 + (168 - 37) * u)}, ${Math.round(99 + (85 - 99) * u)}, ${Math.round(235 + (247 - 235) * u)}, 0.78)`;
  }
  const u = (t - 0.5) / 0.5;
  return `rgba(${Math.round(168 + (239 - 168) * u)}, ${Math.round(85 + (68 - 85) * u)}, ${Math.round(247 + (68 - 247) * u)}, 0.78)`;
}

export function colorForProcess(
  process: CuttingProcess,
  mode: ScatterColorMode,
): string {
  if (mode === 'chatter') {
    if (process.chatterDetected === true) return CHATTER_RED;
    if (process.chatterDetected === false) return STABLE_BLUE;
    return NEUTRAL_GRAY;
  }
  if (mode === 'toolWear') {
    if (process.toolWearVB === null) return NEUTRAL_GRAY;
    return colorByVB(process.toolWearVB);
  }
  if (process.surfaceRoughnessRa === null) return NEUTRAL_GRAY;
  return colorByRa(process.surfaceRoughnessRa);
}

// ---------------------------------------------------------------------------
// 特殊加工フラグ → マーカー形状
// ---------------------------------------------------------------------------

export type MarkerShape = 'circle' | 'diamond' | 'triangle';

const SPECIAL_COOLANT_SHAPE: Partial<Record<CoolantType, MarkerShape>> = {
  MQL: 'diamond',
  cryogenic: 'triangle',
};

export function markerShapeFor(process: CuttingProcess): MarkerShape {
  return SPECIAL_COOLANT_SHAPE[process.condition.coolant] ?? 'circle';
}

/**
 * 与えた中心座標と半径から指定形状の SVG path d を返す。
 * 円は <circle> を直接描画する想定なので path には含まれず、ここでは多角形のみ。
 */
export function markerPathD(shape: 'diamond' | 'triangle', cx: number, cy: number, r: number): string {
  if (shape === 'diamond') {
    return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
  }
  // triangle (上向き)
  const h = r * 1.1;
  return `M ${cx} ${cy - h} L ${cx + r} ${cy + r * 0.7} L ${cx - r} ${cy + r * 0.7} Z`;
}
