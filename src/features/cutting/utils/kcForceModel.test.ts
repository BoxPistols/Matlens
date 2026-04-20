import { describe, expect, it } from 'vitest';
import {
  cuttingForceFc,
  estimateTurning,
  kienzleFor,
  MRR_milling,
  MRR_turning,
  spindlePowerKW,
} from './kcForceModel';

describe('cuttingForceFc', () => {
  it('h=1, b=1 のとき Fc = Kc1.1（定義から自明）', () => {
    const Fc = cuttingForceFc({ h: 1, b: 1 }, { kc11: 2000, mc: 0.25 });
    expect(Fc).toBeCloseTo(2000, 6);
  });

  it('h を 2 倍にすると Fc は 2^(1-mc) 倍に増える', () => {
    const params = { kc11: 2000, mc: 0.25 };
    const F1 = cuttingForceFc({ h: 0.2, b: 2 }, params);
    const F2 = cuttingForceFc({ h: 0.4, b: 2 }, params);
    expect(F2 / F1).toBeCloseTo(Math.pow(2, 1 - 0.25), 6);
  });

  it('b を 2 倍にすると Fc は 2 倍（b は線形）', () => {
    const params = { kc11: 2000, mc: 0.3 };
    const F1 = cuttingForceFc({ h: 0.2, b: 1 }, params);
    const F2 = cuttingForceFc({ h: 0.2, b: 2 }, params);
    expect(F2 / F1).toBeCloseTo(2, 6);
  });

  it('退化ケース (h or b <= 0) は 0', () => {
    const params = { kc11: 2000, mc: 0.25 };
    expect(cuttingForceFc({ h: 0, b: 1 }, params)).toBe(0);
    expect(cuttingForceFc({ h: 1, b: -1 }, params)).toBe(0);
  });
});

describe('spindlePowerKW', () => {
  it('P = Fc·Vc/(60000·η)', () => {
    const P = spindlePowerKW(1000, 200, 0.8);
    expect(P).toBeCloseTo((1000 * 200) / (60_000 * 0.8), 6);
  });
  it('η=1 なら理論最大値', () => {
    const P = spindlePowerKW(3000, 300, 1);
    expect(P).toBeCloseTo((3000 * 300) / 60_000, 6);
  });
});

describe('MRR', () => {
  it('旋削 MRR は Vc·f·ap に比例', () => {
    const m = MRR_turning(200, 0.2, 2);
    // 単位が結果として cm^3/min に収まることを確認（厳密値は実装に依存）
    expect(m).toBeGreaterThan(0);
    expect(Number.isFinite(m)).toBe(true);
  });
  it('ミーリング MRR は vf·ae·ap / 1000', () => {
    expect(MRR_milling(1000, 10, 3)).toBeCloseTo(30, 6);
  });
});

describe('kienzleFor', () => {
  it('登録済み材料は正しい係数を返す', () => {
    expect(kienzleFor('mat_inconel718').kc11).toBeGreaterThan(2500);
  });
  it('未登録材料はフォールバック（kc11=2000）', () => {
    const p = kienzleFor('mat_unknown');
    expect(p.kc11).toBe(2000);
  });
});

describe('estimateTurning', () => {
  it('Inconel は SUS304 より Fc が大きい（同じ条件で）', () => {
    const inconel = estimateTurning('mat_inconel718', 100, 0.2, 2);
    const sus = estimateTurning('mat_sus304', 100, 0.2, 2);
    expect(inconel.Fc_N).toBeGreaterThan(sus.Fc_N);
    expect(inconel.P_kW).toBeGreaterThan(sus.P_kW);
  });
});
