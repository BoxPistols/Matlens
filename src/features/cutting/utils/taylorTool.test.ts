import { describe, expect, it } from 'vitest';
import {
  allowableCuttingSpeed,
  defaultParamsForTool,
  fitTaylor,
  inferC,
  toolLifeMin,
} from './taylorTool';

describe('toolLifeMin', () => {
  it('V=C のとき T=1 分（定義から自明）', () => {
    const T = toolLifeMin(100, { n: 0.25, C: 100 });
    expect(T).toBeCloseTo(1, 6);
  });

  it('V を 2 倍にすると T は 2^(-1/n) 倍になる', () => {
    const params = { n: 0.25, C: 200 };
    const T1 = toolLifeMin(100, params);
    const T2 = toolLifeMin(200, params);
    expect(T2 / T1).toBeCloseTo(Math.pow(2, -1 / 0.25), 6); // 1/16
  });

  it('V<=0 や不正パラメータは 0 を返す', () => {
    expect(toolLifeMin(0, { n: 0.25, C: 100 })).toBe(0);
    expect(toolLifeMin(100, { n: 0, C: 100 })).toBe(0);
    expect(toolLifeMin(100, { n: 0.25, C: 0 })).toBe(0);
  });
});

describe('allowableCuttingSpeed', () => {
  it('T=1 のとき V=C', () => {
    expect(allowableCuttingSpeed(1, { n: 0.3, C: 260 })).toBeCloseTo(260, 6);
  });

  it('toolLifeMin の逆関数として整合する', () => {
    const params = { n: 0.25, C: 200 };
    const V = 150;
    const T = toolLifeMin(V, params);
    const Vback = allowableCuttingSpeed(T, params);
    expect(Vback).toBeCloseTo(V, 6);
  });
});

describe('inferC', () => {
  it('V=100, T=60, n=0.25 → C = 100·60^0.25 ≈ 278.3', () => {
    const C = inferC(100, 60, 0.25);
    expect(C).toBeCloseTo(100 * Math.pow(60, 0.25), 6);
  });
});

describe('fitTaylor', () => {
  it('2 点以上の (V,T) から (n,C) を推定する', () => {
    // 既知の n=0.25, C=200 から合成点を生成
    const trueN = 0.25;
    const trueC = 200;
    const pts = [10, 30, 60, 120].map((T) => ({
      V: trueC / Math.pow(T, trueN),
      T,
    }));
    const fit = fitTaylor(pts);
    expect(fit).not.toBeNull();
    expect(fit!.n).toBeCloseTo(trueN, 4);
    expect(fit!.C).toBeCloseTo(trueC, 2);
    expect(fit!.r2).toBeGreaterThan(0.999);
  });

  it('1 点では推定できず null を返す', () => {
    expect(fitTaylor([{ V: 100, T: 60 }])).toBeNull();
  });

  it('無効値（V<=0 or T<=0）はフィルタされる', () => {
    const fit = fitTaylor([
      { V: 0, T: 60 },
      { V: 100, T: 60 },
      { V: 150, T: 30 },
    ]);
    expect(fit).not.toBeNull();
    expect(fit!.points).toHaveLength(2);
  });
});

describe('defaultParamsForTool', () => {
  it('工具材種ごとに n が変わる', () => {
    const hss = defaultParamsForTool('HSS');
    const car = defaultParamsForTool('carbide');
    expect(hss.n).toBeLessThan(car.n);
    expect(hss.C).toBeGreaterThan(0);
    expect(car.C).toBeGreaterThan(0);
  });
});
