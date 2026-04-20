import { describe, expect, it } from 'vitest';
import type {
  DamageFinding,
  Project,
  Specimen,
  Test,
} from '@/domain/types';
import {
  buildActivityTimeline,
  collectDueRisk,
  computeOpsKpi,
} from './opsMetrics';

const NOW = new Date('2026-04-20T00:00:00+09:00');

const makeProject = (p: Partial<Project> & { id: string; status: Project['status'] }): Project => ({
  id: p.id,
  code: p.code ?? `IIC-2026-${p.id}`,
  title: p.title ?? 'テスト案件',
  customerId: p.customerId ?? 'cst_001',
  industryTagIds: [],
  status: p.status,
  startedAt: '2026-03-01',
  dueAt: p.dueAt ?? null,
  completedAt: null,
  specimenCount: 0,
  testCount: 0,
  pmId: 'usr_pm_001',
  leadEngineerId: 'usr_eng_001',
  description: null,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  createdBy: 'usr_pm_001',
  updatedBy: 'usr_pm_001',
});

const makeSpecimen = (
  p: Partial<Specimen> & { id: string; projectId: string; status: Specimen['status']; receivedAt: string }
): Specimen => ({
  id: p.id,
  code: p.code ?? `SPC-${p.id}`,
  projectId: p.projectId,
  materialId: p.materialId ?? 'mat_sus304',
  dimensions: { shape: 'bar', length: 100, diameter: 10 },
  cutFrom: { parentPart: null, location: null, direction: null },
  receivedAt: p.receivedAt,
  location: p.location ?? 'A-1',
  status: p.status,
  notes: null,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  createdBy: 'usr_op_001',
  updatedBy: 'usr_op_001',
});

const makeTest = (
  p: Partial<Test> & { id: string; status: Test['status']; performedAt: string }
): Test => ({
  id: p.id,
  specimenId: p.specimenId ?? 'spc_0001',
  testTypeId: p.testTypeId ?? 'tt_tensile',
  condition: {
    temperature: { value: 25, unit: 'C' },
    atmosphere: 'air',
  },
  standardIds: [],
  performedAt: p.performedAt,
  operatorId: 'usr_op_001',
  equipmentId: null,
  status: p.status,
  resultMetrics: [],
  rawDataRefs: [],
  observations: [],
  createdAt: p.performedAt,
  updatedAt: p.performedAt,
  createdBy: 'usr_op_001',
  updatedBy: 'usr_op_001',
});

const makeDamage = (
  p: Partial<DamageFinding> & { id: string; confidenceLevel: DamageFinding['confidenceLevel']; updatedAt: string }
): DamageFinding => ({
  id: p.id,
  reportId: `rpt_${p.id}`,
  testId: p.testId ?? 'tst_0001',
  type: p.type ?? 'fatigue',
  location: p.location ?? 'フランジ根元',
  rootCauseHypothesis: '繰返し荷重',
  confidenceLevel: p.confidenceLevel,
  images: [],
  similarCaseIds: [],
  tags: [],
  createdAt: p.updatedAt,
  updatedAt: p.updatedAt,
  createdBy: 'usr_eng_001',
  updatedBy: 'usr_eng_001',
});

describe('computeOpsKpi', () => {
  it('進行中案件・要アクション試験片・最近の完了試験・異常所見比率を集計する', () => {
    const projects = [
      makeProject({ id: 'a', status: 'in_progress' }),
      makeProject({ id: 'b', status: 'reviewing' }),
      makeProject({ id: 'c', status: 'completed' }),
    ];
    const specimens = [
      // 進行中案件 a、受入中 → 要アクション
      makeSpecimen({ id: 's1', projectId: 'a', status: 'received', receivedAt: '2026-04-20' }),
      // 進行中だがステータスが stored → 対象外
      makeSpecimen({ id: 's2', projectId: 'a', status: 'stored', receivedAt: '2026-04-20' }),
      // 進行中案件の prepared → 要アクション（受入日が古くても滞留として拾う）
      makeSpecimen({ id: 's3', projectId: 'a', status: 'prepared', receivedAt: '2025-01-01' }),
    ];
    const tests = [
      makeTest({ id: 't1', status: 'completed', performedAt: '2026-04-10T10:00:00Z' }),
      // 30 日以上前 → 対象外
      makeTest({ id: 't2', status: 'completed', performedAt: '2026-03-01T10:00:00Z' }),
      makeTest({ id: 't3', status: 'scheduled', performedAt: '2026-04-10T10:00:00Z' }),
    ];
    const damages = [
      // 過去 30 日 / 非 low / 完了試験 t1 に紐づく → 分子にカウント
      makeDamage({ id: 'd1', testId: 't1', confidenceLevel: 'high', updatedAt: '2026-04-10T10:00:00Z' }),
      // low は除外
      makeDamage({ id: 'd2', testId: 't1', confidenceLevel: 'low', updatedAt: '2026-04-10T10:00:00Z' }),
    ];

    const kpi = computeOpsKpi({ projects, specimens, tests, damages, now: NOW });
    expect(kpi.activeProjects).toBe(2);
    expect(kpi.totalProjects).toBe(3);
    expect(kpi.pendingSpecimens).toBe(2); // s1 + s3
    expect(kpi.completedTestsLast30Days).toBe(1);
    expect(kpi.abnormalFindingRatio).toBe(1); // 1 unique testId / 1 completed test
  });

  it('同一試験に複数所見があっても分子は 1 として数える（unique testId ベース）', () => {
    const tests = [makeTest({ id: 't1', status: 'completed', performedAt: '2026-04-10T10:00:00Z' })];
    const damages = [
      makeDamage({ id: 'd1', testId: 't1', confidenceLevel: 'high', updatedAt: '2026-04-10T10:00:00Z' }),
      makeDamage({ id: 'd2', testId: 't1', confidenceLevel: 'medium', updatedAt: '2026-04-11T10:00:00Z' }),
    ];
    const kpi = computeOpsKpi({ projects: [], specimens: [], tests, damages, now: NOW });
    expect(kpi.abnormalFindingRatio).toBe(1);
  });

  it('完了試験が 0 のとき異常所見比率は 0', () => {
    const kpi = computeOpsKpi({
      projects: [],
      specimens: [],
      tests: [],
      damages: [
        makeDamage({ id: 'd1', testId: 't1', confidenceLevel: 'high', updatedAt: '2026-04-10T10:00:00Z' }),
      ],
      now: NOW,
    });
    expect(kpi.abnormalFindingRatio).toBe(0);
  });
});

describe('collectDueRisk', () => {
  it('in_progress/reviewing かつ 7 日以内 or 遅延の案件のみを返す', () => {
    const projects = [
      makeProject({ id: 'a', status: 'in_progress', dueAt: '2026-04-23' }), // 残 3 日
      makeProject({ id: 'b', status: 'in_progress', dueAt: '2026-04-15' }), // 遅延 -5
      makeProject({ id: 'c', status: 'in_progress', dueAt: '2026-05-30' }), // 除外
      makeProject({ id: 'd', status: 'completed', dueAt: '2026-04-22' }),   // 除外
    ];
    const risk = collectDueRisk(projects, NOW, 7);
    expect(risk.map((r) => r.project.id)).toEqual(['b', 'a']);
    expect(risk[0]!.daysLeft).toBe(-5);
  });

  it('dueAt が null の案件は除外する', () => {
    const risk = collectDueRisk(
      [makeProject({ id: 'a', status: 'in_progress', dueAt: null })],
      NOW
    );
    expect(risk).toHaveLength(0);
  });
});

describe('buildActivityTimeline', () => {
  it('完了試験と損傷所見を時系列降順で混ぜ、上位 limit 件を返す', () => {
    const tests = [
      makeTest({ id: 't1', status: 'completed', performedAt: '2026-04-18T10:00:00Z' }),
      makeTest({ id: 't2', status: 'scheduled', performedAt: '2026-04-19T10:00:00Z' }),
      makeTest({ id: 't3', status: 'completed', performedAt: '2026-04-17T10:00:00Z' }),
    ];
    const damages = [
      makeDamage({ id: 'd1', confidenceLevel: 'high', updatedAt: '2026-04-19T11:00:00Z' }),
    ];
    const timeline = buildActivityTimeline(tests, damages, 5);
    expect(timeline).toHaveLength(3);
    expect(timeline[0]!.id).toBe('d1');
    expect(timeline[1]!.id).toBe('t1');
    expect(timeline[2]!.id).toBe('t3');
  });
});
