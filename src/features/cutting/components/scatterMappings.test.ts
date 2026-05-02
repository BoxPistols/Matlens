import { describe, it, expect } from 'vitest';
import type { CuttingProcess } from '@/domain/types';
import {
  colorForProcess,
  markerPathD,
  markerShapeFor,
  SCATTER_AXES,
} from './scatterMappings';

const audit = {
  createdAt: '2026-04-17T10:00:00+09:00',
  updatedAt: '2026-04-17T10:00:00+09:00',
  createdBy: 'u',
  updatedBy: 'u',
};

const baseProcess: CuttingProcess = {
  id: 'cp-1',
  code: 'CUT-2026-0001',
  specimenId: null,
  materialId: 'm-1',
  toolId: 'tool-1',
  operation: 'turning',
  condition: {
    cuttingSpeed: 120,
    feed: 0.15,
    feedUnit: 'mm/rev',
    depthOfCut: 1.0,
    widthOfCut: null,
    spindleSpeed: 1500,
    coolant: 'flood',
    notes: null,
  },
  machiningTimeSec: 60,
  cuttingDistanceMm: 1000,
  surfaceRoughnessRa: 1.0,
  toolWearVB: 0.2,
  chatterDetected: false,
  cuttingForceFc: 200,
  cuttingTemperatureC: 60,
  waveformIds: [],
  operatorId: 'op-1',
  machine: 'M-1',
  performedAt: '2026-04-17T10:00:00+09:00',
  notes: null,
  ...audit,
};

describe('SCATTER_AXES', () => {
  it('exposes accessors that read the matching condition field', () => {
    expect(SCATTER_AXES.cuttingSpeed.get(baseProcess)).toBe(120);
    expect(SCATTER_AXES.feed.get(baseProcess)).toBeCloseTo(0.15, 5);
    expect(SCATTER_AXES.depthOfCut.get(baseProcess)).toBe(1.0);
  });
});

describe('colorForProcess', () => {
  it('chatter mode: chatter→red, stable→blue, null→gray', () => {
    expect(colorForProcess({ ...baseProcess, chatterDetected: true }, 'chatter')).toContain('239, 68, 68');
    expect(colorForProcess({ ...baseProcess, chatterDetected: false }, 'chatter')).toContain('37, 99, 235');
    expect(colorForProcess({ ...baseProcess, chatterDetected: null }, 'chatter')).toContain('148, 163, 184');
  });

  it('toolWear mode: gray when VB is null, red when VB exceeds 0.6', () => {
    expect(colorForProcess({ ...baseProcess, toolWearVB: null }, 'toolWear')).toContain('148, 163, 184');
    const high = colorForProcess({ ...baseProcess, toolWearVB: 0.7 }, 'toolWear');
    expect(high).toMatch(/^rgba\((23\d|2[3-5][0-9]),/); // 赤領域
  });

  it('surfaceRoughness mode: gray when Ra is null', () => {
    expect(colorForProcess({ ...baseProcess, surfaceRoughnessRa: null }, 'surfaceRoughness')).toContain('148, 163, 184');
  });
});

describe('markerShapeFor', () => {
  it('returns diamond for MQL and triangle for cryogenic', () => {
    const mql = { ...baseProcess, condition: { ...baseProcess.condition, coolant: 'MQL' as const } };
    const cryo = { ...baseProcess, condition: { ...baseProcess.condition, coolant: 'cryogenic' as const } };
    expect(markerShapeFor(mql)).toBe('diamond');
    expect(markerShapeFor(cryo)).toBe('triangle');
    expect(markerShapeFor(baseProcess)).toBe('circle');
  });
});

describe('markerPathD', () => {
  it('produces a closed diamond path', () => {
    const d = markerPathD('diamond', 10, 10, 4);
    expect(d).toMatch(/^M /);
    expect(d).toMatch(/Z$/);
  });

  it('produces a closed triangle path', () => {
    const d = markerPathD('triangle', 10, 10, 4);
    expect(d).toMatch(/^M /);
    expect(d).toMatch(/Z$/);
  });
});
