import { describe, expect, it } from 'vitest';
import {
  approximateModalParams,
  computeStabilityLobes,
  minBlimAtRpm,
} from './stabilityLobe';

const defaultInputs = () => ({
  modal: { mass: 0.5, fn_Hz: 800, zeta: 0.03 },
  Kc_N_mm2: 2000,
  teeth: 4,
  lobesMax: 3,
  samples: 200,
});

describe('computeStabilityLobes', () => {
  it('有効な入力で SLD 点列を返す（lobe 0〜lobesMax-1）', () => {
    const pts = computeStabilityLobes(defaultInputs());
    expect(pts.length).toBeGreaterThan(10);
    const lobes = new Set(pts.map((p) => p.lobe));
    expect(lobes.has(0)).toBe(true);
    expect(lobes.has(1)).toBe(true);
  });

  it('全ての blim は正の有限値', () => {
    const pts = computeStabilityLobes(defaultInputs());
    for (const p of pts) {
      expect(p.blim_mm).toBeGreaterThan(0);
      expect(Number.isFinite(p.blim_mm)).toBe(true);
      expect(p.spindleRpm).toBeGreaterThan(0);
    }
  });

  it('teeth=0 / Kc<=0 は空配列', () => {
    expect(computeStabilityLobes({ ...defaultInputs(), teeth: 0 })).toEqual([]);
    expect(computeStabilityLobes({ ...defaultInputs(), Kc_N_mm2: 0 })).toEqual([]);
  });

  it('刃数 2 は 4 より blim が高くなる傾向（刃数少 ⇒ 安定）', () => {
    const pts2 = computeStabilityLobes({ ...defaultInputs(), teeth: 2 });
    const pts4 = computeStabilityLobes({ ...defaultInputs(), teeth: 4 });
    // 最小の blim（最も厳しい安定限界）で比較
    const min2 = Math.min(...pts2.map((p) => p.blim_mm));
    const min4 = Math.min(...pts4.map((p) => p.blim_mm));
    expect(min2).toBeGreaterThan(min4);
  });
});

describe('minBlimAtRpm', () => {
  it('指定 rpm 付近の最小 blim を返す', () => {
    const pts = computeStabilityLobes(defaultInputs());
    const anyRpm = pts[Math.floor(pts.length / 2)]!.spindleRpm;
    const min = minBlimAtRpm(anyRpm, pts, 500);
    expect(min).not.toBeNull();
    expect(min).toBeGreaterThan(0);
  });

  it('掃引範囲外の rpm は null', () => {
    const pts = computeStabilityLobes(defaultInputs());
    expect(minBlimAtRpm(1_000_000, pts, 10)).toBeNull();
  });
});

describe('approximateModalParams', () => {
  it('径が大きいほど fn が高い', () => {
    const small = approximateModalParams(6, 'carbide');
    const big = approximateModalParams(20, 'carbide');
    expect(big.fn_Hz).toBeGreaterThan(small.fn_Hz);
  });
  it('HSS は carbide より fn が低い（剛性近似）', () => {
    const hss = approximateModalParams(10, 'HSS');
    const car = approximateModalParams(10, 'carbide');
    expect(hss.fn_Hz).toBeLessThan(car.fn_Hz);
  });
});
