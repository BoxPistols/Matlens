import { describe, it, expect } from 'vitest';
import { classifyWearStatus, VB_WEAR_LIMIT } from './wearStatus';

describe('classifyWearStatus', () => {
  it('returns "未測定" when VB is null', () => {
    const r = classifyWearStatus(null);
    expect(r.status).toBe('ok');
    expect(r.label).toBe('未測定');
    expect(r.remainingRatio).toBe(1);
  });

  it('returns ok when ratio < 0.7', () => {
    const r = classifyWearStatus(VB_WEAR_LIMIT * 0.5);
    expect(r.status).toBe('ok');
    expect(r.remainingRatio).toBeCloseTo(0.5, 5);
  });

  it('returns warn at 70-80% (残 20%)', () => {
    const r = classifyWearStatus(VB_WEAR_LIMIT * 0.75);
    expect(r.status).toBe('warn');
    expect(r.remainingRatio).toBeCloseTo(0.25, 5);
  });

  it('returns alert at 80-100% (残 10%)', () => {
    const r = classifyWearStatus(VB_WEAR_LIMIT * 0.9);
    expect(r.status).toBe('alert');
    expect(r.remainingRatio).toBeCloseTo(0.1, 5);
  });

  it('returns exceeded at or above limit', () => {
    const r = classifyWearStatus(VB_WEAR_LIMIT * 1.2);
    expect(r.status).toBe('exceeded');
    expect(r.remainingRatio).toBe(0);
  });
});
