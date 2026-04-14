import type { SensorSample, DownsampledPoint } from '../types';

/**
 * インテリジェント・サンプリング
 * 高周波センサーデータ（数万Hz）をブラウザ描画用に間引く。
 * windowSize 件ごとに RMS（実効値）と Peak（最大値）を抽出し、
 * スパイク（異常跳ね上がり）を見逃さない。
 */
export function downsample(
  raw: SensorSample[],
  windowSize: number,
): DownsampledPoint[] {
  if (raw.length === 0) return [];
  if (windowSize < 1) windowSize = 1;

  const result: DownsampledPoint[] = [];

  for (let i = 0; i < raw.length; i += windowSize) {
    const window = raw.slice(i, i + windowSize);
    const n = window.length;

    let forceSqSum = 0, forcePeak = -Infinity;
    let vibSqSum = 0, vibPeak = -Infinity;
    let tempSum = 0, loadSum = 0;

    for (const s of window) {
      forceSqSum += s.force * s.force;
      if (s.force > forcePeak) forcePeak = s.force;
      vibSqSum += s.vibration * s.vibration;
      if (s.vibration > vibPeak) vibPeak = s.vibration;
      tempSum += s.temperature;
      loadSum += s.spindleLoad;
    }

    result.push({
      t: window[0]!.t,
      forceRms: Math.sqrt(forceSqSum / n),
      forcePeak,
      vibrationRms: Math.sqrt(vibSqSum / n),
      vibrationPeak: vibPeak,
      temperatureAvg: tempSum / n,
      spindleLoadAvg: loadSum / n,
    });
  }
  return result;
}

/**
 * スパイク検出: 直前 N 点の平均との差が倍率 threshold を超えたら true
 */
export function detectSpike(
  values: number[],
  currentIndex: number,
  lookback: number,
  threshold: number,
): boolean {
  if (currentIndex < lookback) return false;
  let sum = 0;
  for (let i = currentIndex - lookback; i < currentIndex; i++) {
    sum += values[i]!;
  }
  const avg = sum / lookback;
  if (avg === 0) return false;
  return Math.abs(values[currentIndex]! - avg) / avg > threshold;
}

/**
 * ベースライン乖離検出: 基準値からの偏差が ratioThreshold を超えたら true
 */
export function detectBaselineDrift(
  current: number,
  baseline: number,
  ratioThreshold: number,
): boolean {
  if (baseline === 0) return false;
  return Math.abs(current - baseline) / baseline > ratioThreshold;
}
