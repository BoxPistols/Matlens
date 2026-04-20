import { describe, expect, it } from 'vitest';
import {
  KIENZLE_COEFFICIENTS,
  MAIML_REQUIRED_FIELDS,
  SURFACE_ROUGHNESS_RA,
  TAYLOR_EXPONENT_BY_TOOL,
  VB_CRITERIA,
  classifyVB,
} from './standards';

describe('VB_CRITERIA', () => {
  it('ISO 3685 の仕上げ基準は平均 VB 0.3mm', () => {
    expect(VB_CRITERIA.finishing.average).toBe(0.3);
    expect(VB_CRITERIA.finishing.max).toBe(0.5);
  });

  it('荒加工は 0.6mm までを許容', () => {
    expect(VB_CRITERIA.roughing.average).toBe(0.6);
  });
});

describe('classifyVB', () => {
  it('VB < 平均値なら ok', () => {
    expect(classifyVB(0.1, 'finishing')).toBe('ok');
  });
  it('VB が平均値 ≤ VB < max なら warn', () => {
    expect(classifyVB(0.35, 'finishing')).toBe('warn');
  });
  it('VB が max 以上なら end_of_life', () => {
    expect(classifyVB(0.6, 'finishing')).toBe('end_of_life');
  });
  it('regime を切替できる', () => {
    expect(classifyVB(0.4, 'finishing')).toBe('warn');
    expect(classifyVB(0.4, 'roughing')).toBe('ok');
  });
});

describe('TAYLOR_EXPONENT_BY_TOOL', () => {
  it('工具材種の順序は温度感受性と整合（HSS < carbide < CBN < PCD）', () => {
    expect(TAYLOR_EXPONENT_BY_TOOL.HSS).toBeLessThan(TAYLOR_EXPONENT_BY_TOOL.carbide);
    expect(TAYLOR_EXPONENT_BY_TOOL.carbide).toBeLessThan(TAYLOR_EXPONENT_BY_TOOL.CBN);
    expect(TAYLOR_EXPONENT_BY_TOOL.CBN).toBeLessThan(TAYLOR_EXPONENT_BY_TOOL.PCD);
  });
});

describe('KIENZLE_COEFFICIENTS', () => {
  it('難削材は高 Kc1.1 を持つ', () => {
    expect(KIENZLE_COEFFICIENTS.mat_inconel718!.kc11).toBeGreaterThan(
      KIENZLE_COEFFICIENTS.mat_s45c!.kc11
    );
    expect(KIENZLE_COEFFICIENTS.mat_ti6al4v!.kc11).toBeGreaterThan(
      KIENZLE_COEFFICIENTS.mat_a5052!.kc11
    );
  });
});

describe('SURFACE_ROUGHNESS_RA', () => {
  it('精密研削 < 仕上げ旋削 < 荒加工 の順で Ra が大きくなる', () => {
    expect(SURFACE_ROUGHNESS_RA.precision_grinding.max).toBeLessThan(
      SURFACE_ROUGHNESS_RA.finish_turning.max
    );
    expect(SURFACE_ROUGHNESS_RA.finish_turning.max).toBeLessThan(
      SURFACE_ROUGHNESS_RA.rough_milling.max
    );
  });
});

describe('MAIML_REQUIRED_FIELDS', () => {
  it('provenance と uncertainty を含む', () => {
    expect(MAIML_REQUIRED_FIELDS).toContain('provenance');
    expect(MAIML_REQUIRED_FIELDS).toContain('uncertainty');
  });
});
