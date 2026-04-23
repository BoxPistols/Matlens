import { describe, expect, it } from 'vitest';
import type { Project, Specimen, Test } from '@/domain/types';
import { computeCustomerTestTypeCells } from './customerMatrix';

const makeSpecimen = (id: string, projectId: string): Specimen => ({
  id,
  code: `SPC-${id}`,
  projectId,
  materialId: 'mat',
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

const makeProject = (id: string, customerId: string): Project => ({
  id,
  code: `IIC-2026-${id}`,
  title: 't',
  customerId,
  industryTagIds: [],
  status: 'in_progress',
  startedAt: '2026-03-01',
  dueAt: null,
  completedAt: null,
  specimenCount: 0,
  testCount: 0,
  pmId: 'u',
  leadEngineerId: 'u',
  description: null,
  createdAt: '2026-03-01',
  updatedAt: '2026-03-01',
  createdBy: 'u',
  updatedBy: 'u',
});

const makeTest = (
  id: string,
  specimenId: string,
  testTypeId: string,
  performedAt: string,
  status: Test['status'] = 'completed'
): Test => ({
  id,
  specimenId,
  testTypeId,
  status,
  performedAt,
  condition: { temperature: { value: 23, unit: 'C' }, atmosphere: 'air' },
  standardIds: [],
  resultMetrics: [],
  rawDataRefs: [],
  observations: [],
  operatorId: 'u',
  equipmentId: null,
  createdAt: '2026-03-01',
  updatedAt: performedAt,
  createdBy: 'u',
  updatedBy: 'u',
});

describe('computeCustomerTestTypeCells', () => {
  it('customerId × testTypeId でカウントを集計', () => {
    const projects = [makeProject('p1', 'cst_a'), makeProject('p2', 'cst_b')];
    const specimens = [
      makeSpecimen('spc_1', 'p1'),
      makeSpecimen('spc_2', 'p1'),
      makeSpecimen('spc_3', 'p2'),
    ];
    const tests = [
      makeTest('t1', 'spc_1', 'tt_tensile', '2026-04-10T10:00:00Z'),
      makeTest('t2', 'spc_2', 'tt_tensile', '2026-04-15T10:00:00Z'),
      makeTest('t3', 'spc_3', 'tt_hardness', '2026-04-12T10:00:00Z'),
    ];
    const cells = computeCustomerTestTypeCells({ tests, specimens, projects });
    expect(cells).toHaveLength(2);
    const a = cells.find((c) => c.materialId === 'cst_a' && c.testTypeId === 'tt_tensile')!;
    expect(a.count).toBe(2);
    expect(a.latestPerformedAt).toBe('2026-04-15T10:00:00Z');
    const b = cells.find((c) => c.materialId === 'cst_b' && c.testTypeId === 'tt_hardness')!;
    expect(b.count).toBe(1);
  });

  it('未完了試験は集計から除外', () => {
    const projects = [makeProject('p1', 'cst_a')];
    const specimens = [makeSpecimen('spc_1', 'p1')];
    const tests = [
      makeTest('t_done', 'spc_1', 'tt_tensile', '2026-04-10T10:00:00Z', 'completed'),
      makeTest('t_sched', 'spc_1', 'tt_tensile', '2026-04-12T10:00:00Z', 'scheduled'),
    ];
    const cells = computeCustomerTestTypeCells({ tests, specimens, projects });
    expect(cells).toHaveLength(1);
    expect(cells[0]!.count).toBe(1);
  });

  it('specimen / project 参照が解決できない Test は skip', () => {
    const cells = computeCustomerTestTypeCells({
      tests: [makeTest('t1', 'spc_missing', 'tt_tensile', '2026-04-10T10:00:00Z')],
      specimens: [],
      projects: [],
    });
    expect(cells).toHaveLength(0);
  });

  it('latestPerformedAt は最新のタイムスタンプを保持', () => {
    const projects = [makeProject('p1', 'cst_a')];
    const specimens = [makeSpecimen('spc_1', 'p1')];
    const tests = [
      makeTest('t1', 'spc_1', 'tt_tensile', '2026-04-10T10:00:00Z'),
      makeTest('t2', 'spc_1', 'tt_tensile', '2026-04-20T10:00:00Z'),
      makeTest('t3', 'spc_1', 'tt_tensile', '2026-04-15T10:00:00Z'),
    ];
    const cells = computeCustomerTestTypeCells({ tests, specimens, projects });
    expect(cells[0]!.latestPerformedAt).toBe('2026-04-20T10:00:00Z');
  });
});
