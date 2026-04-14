import { describe, it, expect } from 'vitest';
import { downsample, detectSpike, detectBaselineDrift } from './sampling';
import type { SensorSample } from '../types';

describe('downsample', () => {
  const makeSamples = (n: number, force = 100): SensorSample[] =>
    Array.from({ length: n }, (_, i) => ({
      t: i * 0.01,
      force,
      vibration: 2.0,
      temperature: 300,
      spindleLoad: 60,
    }));

  it('空配列に対して空を返す', () => {
    expect(downsample([], 10)).toEqual([]);
  });

  it('windowSize=1 では元データと同じ数になる', () => {
    const raw = makeSamples(5);
    const result = downsample(raw, 1);
    expect(result).toHaveLength(5);
  });

  it('windowSize でまとめた件数になる', () => {
    const raw = makeSamples(100);
    const result = downsample(raw, 10);
    expect(result).toHaveLength(10);
  });

  it('RMS 値が正しく計算される（一定値の場合 RMS = その値）', () => {
    const raw = makeSamples(10, 500);
    const result = downsample(raw, 10);
    expect(result[0]!.forceRms).toBeCloseTo(500, 5);
  });

  it('Peak 値が最大値を保持する', () => {
    const raw = makeSamples(10, 100);
    raw[5]!.force = 999;
    const result = downsample(raw, 10);
    expect(result[0]!.forcePeak).toBe(999);
  });
});

describe('detectSpike', () => {
  it('平坦なデータではスパイクを検出しない', () => {
    const values = [100, 100, 100, 100, 100, 100];
    expect(detectSpike(values, 5, 3, 0.5)).toBe(false);
  });

  it('急激な跳ね上がりを検出する', () => {
    const values = [100, 100, 100, 100, 100, 300];
    expect(detectSpike(values, 5, 3, 0.5)).toBe(true);
  });

  it('lookback 未満のインデックスでは false', () => {
    const values = [100, 300];
    expect(detectSpike(values, 1, 3, 0.5)).toBe(false);
  });
});

describe('detectBaselineDrift', () => {
  it('基準値と同じなら乖離なし', () => {
    expect(detectBaselineDrift(100, 100, 0.3)).toBe(false);
  });

  it('30% 超の乖離を検出する', () => {
    expect(detectBaselineDrift(140, 100, 0.3)).toBe(true);
  });

  it('基準値 0 では false', () => {
    expect(detectBaselineDrift(100, 0, 0.3)).toBe(false);
  });
});
