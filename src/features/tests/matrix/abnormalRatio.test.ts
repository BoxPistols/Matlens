import { describe, expect, it } from 'vitest';
import type { DamageFinding, Specimen, Test } from '@/domain/types';
import { computeAbnormalCellMap } from './abnormalRatio';

const makeSpecimen = (id: string, materialId: string): Specimen => ({
  id,
  code: `SPC-${id}`,
  projectId: 'proj',
  materialId,
  dimensions: { shape: 'bar', length: 100, diameter: 10 },
  cutFrom: { parentPart: null, location: null, direction: null },
  receivedAt: '2026-03-01',
  location: 'A-1',
  status: 'tested',
  notes: null,
  createdAt: '2026-03-01',
  updatedAt: '2026-03-01',
  createdBy: 'u',
  updatedBy: 'u',
});

const makeTest = (
  id: string,
  specimenId: string,
  testTypeId: string,
  status: Test['status'] = 'completed'
): Test => ({
  id,
  specimenId,
  testTypeId,
  status,
  performedAt: '2026-04-10T10:00:00Z',
  condition: { temperature: { value: 23, unit: 'C' }, atmosphere: 'air' },
  standardIds: [],
  resultMetrics: [],
  rawDataRefs: [],
  observations: [],
  operatorId: 'u',
  equipmentId: null,
  createdAt: '2026-03-01',
  updatedAt: '2026-04-10',
  createdBy: 'u',
  updatedBy: 'u',
});

const makeDamage = (
  id: string,
  testId: string | null,
  confidenceLevel: DamageFinding['confidenceLevel']
): DamageFinding => ({
  id,
  reportId: 'rep',
  testId,
  type: 'fatigue',
  location: 'surface',
  rootCauseHypothesis: '',
  confidenceLevel,
  images: [],
  similarCaseIds: [],
  tags: [],
  createdAt: '2026-04-10',
  updatedAt: '2026-04-10',
  createdBy: 'u',
  updatedBy: 'u',
});

describe('computeAbnormalCellMap', () => {
  it('(materialId × testTypeId) ごとに異常率を算出', () => {
    const specimens = [
      makeSpecimen('spc_a', 'mat_a'),
      makeSpecimen('spc_b', 'mat_a'),
      makeSpecimen('spc_c', 'mat_b'),
    ];
    const tests = [
      makeTest('t1', 'spc_a', 'tt_tensile'),
      makeTest('t2', 'spc_b', 'tt_tensile'),
      makeTest('t3', 'spc_c', 'tt_tensile'),
    ];
    const damages = [
      makeDamage('d1', 't1', 'high'),   // mat_a × tt_tensile 異常あり
      makeDamage('d2', 't1', 'medium'), // 同じ test への追加所見（unique testId で 1 件扱い）
      makeDamage('d3', 't3', 'high'),   // mat_b × tt_tensile 異常あり
    ];

    const map = computeAbnormalCellMap({ tests, damages, specimens });
    expect(map.size).toBe(2);

    const cellA = map.get('mat_a__tt_tensile');
    expect(cellA).toBeDefined();
    expect(cellA!.totalCount).toBe(2);
    expect(cellA!.abnormalCount).toBe(1); // t1 のみ
    expect(cellA!.ratio).toBe(0.5);

    const cellB = map.get('mat_b__tt_tensile');
    expect(cellB!.totalCount).toBe(1);
    expect(cellB!.abnormalCount).toBe(1);
    expect(cellB!.ratio).toBe(1);
  });

  it('low 確信度の所見は分子から除外', () => {
    const specimens = [makeSpecimen('spc_a', 'mat_a')];
    const tests = [makeTest('t1', 'spc_a', 'tt_tensile')];
    const damages = [makeDamage('d1', 't1', 'low')];

    const map = computeAbnormalCellMap({ tests, damages, specimens });
    const cell = map.get('mat_a__tt_tensile')!;
    expect(cell.abnormalCount).toBe(0);
    expect(cell.ratio).toBe(0);
  });

  it('completed 以外の試験は分母から除外', () => {
    const specimens = [makeSpecimen('spc_a', 'mat_a'), makeSpecimen('spc_b', 'mat_a')];
    const tests = [
      makeTest('t1', 'spc_a', 'tt_tensile', 'completed'),
      makeTest('t2', 'spc_b', 'tt_tensile', 'scheduled'),
    ];
    const damages = [makeDamage('d1', 't1', 'high')];

    const map = computeAbnormalCellMap({ tests, damages, specimens });
    const cell = map.get('mat_a__tt_tensile')!;
    expect(cell.totalCount).toBe(1);
    expect(cell.abnormalCount).toBe(1);
  });

  it('specimen 参照が解決できない Test はスキップ', () => {
    const specimens: Specimen[] = []; // 意図的に空
    const tests = [makeTest('t1', 'spc_missing', 'tt_tensile')];
    const damages = [makeDamage('d1', 't1', 'high')];

    const map = computeAbnormalCellMap({ tests, damages, specimens });
    expect(map.size).toBe(0);
  });

  it('testId が null の所見は集計対象外', () => {
    const specimens = [makeSpecimen('spc_a', 'mat_a')];
    const tests = [makeTest('t1', 'spc_a', 'tt_tensile')];
    const damages = [makeDamage('d_orphan', null, 'high')];

    const map = computeAbnormalCellMap({ tests, damages, specimens });
    const cell = map.get('mat_a__tt_tensile')!;
    expect(cell.totalCount).toBe(1);
    expect(cell.abnormalCount).toBe(0);
  });
});
