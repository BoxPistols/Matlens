// 工具摩耗 VB から残寿命カテゴリと色を返す純関数。
//
// VB_CRITERIA.finishing.average (= 0.3 mm / ISO 3685) を寿命基準に取り、
// 余裕の比率でアラートを 4 段階に分類する。
//
//   ratio = vb / limit
//   ratio < 0.7   → ok      （残 30% 超）
//   ratio < 0.8   → warn    （残 20%）
//   ratio < 1.0   → alert   （残 10%）
//   ratio >= 1.0  → exceeded（限界超過）

import { VB_CRITERIA } from '@/features/cutting/utils/standards';

export const VB_WEAR_LIMIT = VB_CRITERIA.finishing.average; // 0.3 mm

export type WearStatus = 'ok' | 'warn' | 'alert' | 'exceeded';

export interface WearStatusInfo {
  status: WearStatus;
  /** 0..1 の残寿命率（1 - vb/limit）。負値はクランプ。 */
  remainingRatio: number;
  /** 表示用ラベル */
  label: string;
  /** 表示用色（CSS color value、--err / --warn / --ok 系） */
  color: string;
}

const COLOR: Record<WearStatus, string> = {
  ok: 'var(--ok, #22c55e)',
  warn: 'var(--warn, #d97706)',
  alert: 'var(--warn, #ea580c)', // やや濃い橙
  exceeded: 'var(--err, #dc2626)',
};

const LABEL: Record<WearStatus, string> = {
  ok: '余裕あり',
  warn: '残 20%',
  alert: '残 10%',
  exceeded: '限界超過',
};

export function classifyWearStatus(vbMm: number | null): WearStatusInfo {
  if (vbMm === null || vbMm <= 0) {
    return {
      status: 'ok',
      remainingRatio: 1,
      label: '未測定',
      color: 'var(--text-lo, #94a3b8)',
    };
  }
  const ratio = vbMm / VB_WEAR_LIMIT;
  let status: WearStatus;
  if (ratio < 0.7) status = 'ok';
  else if (ratio < 0.8) status = 'warn';
  else if (ratio < 1.0) status = 'alert';
  else status = 'exceeded';
  return {
    status,
    remainingRatio: Math.max(1 - ratio, 0),
    label: LABEL[status],
    color: COLOR[status],
  };
}
