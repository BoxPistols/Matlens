import { describe, expect, it } from 'vitest';
import type {
  CuttingProcess,
  DamageFinding,
  Material,
  Project,
  Specimen,
  Test,
  TestType,
  Tool,
} from '@/domain/types';
import {
  buildActivityTimeline,
  collectDueRisk,
  computeCuttingKpi,
  computeMaterialCategoryDistribution,
  computeOpsKpi,
  computeTestTypeDistribution,
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

const makeTool = (p: Partial<Tool> & { id: string }): Tool => ({
  id: p.id,
  code: p.code ?? `TOOL-${p.id}`,
  name: p.name ?? 'テスト工具',
  nameEn: 'Test Tool',
  type: p.type ?? 'end_mill',
  material: p.material ?? 'coated_carbide',
  coating: null,
  diameter: 10,
  fluteCount: 4,
  rakeAngle: null,
  reliefAngle: null,
  helixAngle: null,
  cornerRadius: null,
  maxDepthOfCut: null,
  applicableMaterials: [],
  vendor: null,
  description: null,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  createdBy: 'usr_op_001',
  updatedBy: 'usr_op_001',
});

const makeCuttingProcess = (
  p: Partial<CuttingProcess> & { id: string; toolId: string; performedAt: string }
): CuttingProcess => ({
  id: p.id,
  code: p.code ?? `CUT-${p.id}`,
  specimenId: p.specimenId ?? null,
  materialId: p.materialId ?? 'mat_ti64',
  toolId: p.toolId,
  operation: p.operation ?? 'milling_face',
  condition: {
    cuttingSpeed: 80,
    feed: 0.1,
    feedUnit: 'mm/tooth',
    depthOfCut: 1,
    widthOfCut: null,
    spindleSpeed: 2500,
    coolant: 'flood',
    notes: null,
  },
  machiningTimeSec: 300,
  cuttingDistanceMm: 5000,
  surfaceRoughnessRa: null,
  toolWearVB: p.toolWearVB ?? null,
  chatterDetected: p.chatterDetected ?? null,
  cuttingForceFc: null,
  cuttingTemperatureC: null,
  waveformIds: [],
  operatorId: 'usr_op_001',
  machine: null,
  performedAt: p.performedAt,
  notes: null,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  createdBy: 'usr_op_001',
  updatedBy: 'usr_op_001',
});

describe('computeCuttingKpi', () => {
  it('VB >= 0.3 の最新プロセスを持つ工具を「限界超過」としてカウント', () => {
    const tools = [makeTool({ id: 'tool_a' }), makeTool({ id: 'tool_b' }), makeTool({ id: 'tool_c' })];
    const cuttingProcesses = [
      // tool_a: 最新 VB=0.32 (超過)
      makeCuttingProcess({ id: 'p1', toolId: 'tool_a', performedAt: '2026-04-18T10:00:00Z', toolWearVB: 0.20 }),
      makeCuttingProcess({ id: 'p2', toolId: 'tool_a', performedAt: '2026-04-19T10:00:00Z', toolWearVB: 0.32 }),
      // tool_b: 最新 VB=0.25 (未超過)
      makeCuttingProcess({ id: 'p3', toolId: 'tool_b', performedAt: '2026-04-18T10:00:00Z', toolWearVB: 0.25 }),
      // tool_c: プロセスなし（未使用工具）
    ];
    const kpi = computeCuttingKpi({ tools, cuttingProcesses, now: NOW });
    expect(kpi.toolsOverWearLimit).toBe(1);
    expect(kpi.totalTools).toBe(3);
  });

  it('最新プロセスで toolWearVB が null の場合は 1 つ前の評価済み値を採用', () => {
    const tools = [makeTool({ id: 'tool_a' })];
    const cuttingProcesses = [
      makeCuttingProcess({ id: 'p1', toolId: 'tool_a', performedAt: '2026-04-18T10:00:00Z', toolWearVB: 0.35 }),
      makeCuttingProcess({ id: 'p2', toolId: 'tool_a', performedAt: '2026-04-19T10:00:00Z', toolWearVB: null }),
    ];
    const kpi = computeCuttingKpi({ tools, cuttingProcesses, now: NOW });
    expect(kpi.toolsOverWearLimit).toBe(1);
  });

  it('過去 30 日のびびり検出率を evaluated only で算出（null は分母から除外）', () => {
    const tools = [makeTool({ id: 'tool_a' })];
    const cuttingProcesses = [
      makeCuttingProcess({ id: 'p1', toolId: 'tool_a', performedAt: '2026-04-18T10:00:00Z', chatterDetected: true }),
      makeCuttingProcess({ id: 'p2', toolId: 'tool_a', performedAt: '2026-04-18T11:00:00Z', chatterDetected: false }),
      makeCuttingProcess({ id: 'p3', toolId: 'tool_a', performedAt: '2026-04-18T12:00:00Z', chatterDetected: false }),
      makeCuttingProcess({ id: 'p4', toolId: 'tool_a', performedAt: '2026-04-18T13:00:00Z', chatterDetected: null }),
    ];
    const kpi = computeCuttingKpi({ tools, cuttingProcesses, now: NOW });
    // evaluated: 3 (p1 true, p2 false, p3 false)、chatter=1 → 1/3 ≈ 0.333
    expect(kpi.evaluatedCuttingProcessesLast30Days).toBe(3);
    expect(kpi.chatterRatioLast30Days).toBeCloseTo(1 / 3, 5);
  });

  it('過去 30 日より古いプロセスは分母から除外', () => {
    const tools = [makeTool({ id: 'tool_a' })];
    const cuttingProcesses = [
      makeCuttingProcess({ id: 'p1', toolId: 'tool_a', performedAt: '2026-04-18T10:00:00Z', chatterDetected: true }),
      // 60 日前
      makeCuttingProcess({ id: 'p_old', toolId: 'tool_a', performedAt: '2026-02-18T10:00:00Z', chatterDetected: false }),
    ];
    const kpi = computeCuttingKpi({ tools, cuttingProcesses, now: NOW });
    expect(kpi.evaluatedCuttingProcessesLast30Days).toBe(1);
    expect(kpi.chatterRatioLast30Days).toBe(1);
  });

  it('評価済みデータがゼロなら chatter 率は 0', () => {
    const tools = [makeTool({ id: 'tool_a' })];
    const cuttingProcesses = [
      makeCuttingProcess({ id: 'p1', toolId: 'tool_a', performedAt: '2026-04-18T10:00:00Z', chatterDetected: null }),
    ];
    const kpi = computeCuttingKpi({ tools, cuttingProcesses, now: NOW });
    expect(kpi.evaluatedCuttingProcessesLast30Days).toBe(0);
    expect(kpi.chatterRatioLast30Days).toBe(0);
  });

  it('tools が空なら toolsOverWearLimit=0', () => {
    const kpi = computeCuttingKpi({ tools: [], cuttingProcesses: [], now: NOW });
    expect(kpi.toolsOverWearLimit).toBe(0);
    expect(kpi.totalTools).toBe(0);
    expect(kpi.chatterRatioLast30Days).toBe(0);
  });
});

describe('computeTestTypeDistribution', () => {
  const makeTestType = (id: string, name: string): TestType => ({
    id,
    name,
    nameEn: name,
    category: 'mechanical',
    defaultStandardIds: [],
    iconKey: 'test',
    description: '',
  });

  it('完了試験を testTypeId 別に集計、多い順にソート', () => {
    const tests = [
      makeTest({ id: 't1', status: 'completed', performedAt: '2026-04-18T10:00:00Z' }),
      makeTest({ id: 't2', status: 'completed', performedAt: '2026-04-18T11:00:00Z' }),
      makeTest({ id: 't3', status: 'completed', performedAt: '2026-04-18T12:00:00Z' }),
      makeTest({ id: 't4', status: 'completed', performedAt: '2026-04-18T13:00:00Z' }),
    ];
    // t1/t2/t3 は tt_tensile、t4 は tt_hardness とする
    (tests[0] as Test).testTypeId = 'tt_tensile';
    (tests[1] as Test).testTypeId = 'tt_tensile';
    (tests[2] as Test).testTypeId = 'tt_tensile';
    (tests[3] as Test).testTypeId = 'tt_hardness';

    const types = new Map<string, TestType>([
      ['tt_tensile', makeTestType('tt_tensile', '引張試験')],
      ['tt_hardness', makeTestType('tt_hardness', '硬度試験')],
    ]);

    const dist = computeTestTypeDistribution(tests, types, NOW);
    expect(dist).toHaveLength(2);
    expect(dist[0]!.label).toBe('引張試験');
    expect(dist[0]!.value).toBe(3);
    expect(dist[1]!.label).toBe('硬度試験');
    expect(dist[1]!.value).toBe(1);
  });

  it('過去 30 日より古い試験と未完了試験は除外', () => {
    const tests = [
      makeTest({ id: 't1', status: 'completed', performedAt: '2026-04-18T10:00:00Z' }),
      makeTest({ id: 't_old', status: 'completed', performedAt: '2026-02-18T10:00:00Z' }),
      makeTest({ id: 't_scheduled', status: 'scheduled', performedAt: '2026-04-19T10:00:00Z' }),
    ];
    (tests[0] as Test).testTypeId = 'tt_tensile';
    (tests[1] as Test).testTypeId = 'tt_tensile';
    (tests[2] as Test).testTypeId = 'tt_tensile';

    const types = new Map<string, TestType>([['tt_tensile', makeTestType('tt_tensile', '引張試験')]]);
    const dist = computeTestTypeDistribution(tests, types, NOW);
    expect(dist).toHaveLength(1);
    expect(dist[0]!.value).toBe(1);
  });

  it('testTypes index にない id は id そのままをラベルに使う', () => {
    const tests = [makeTest({ id: 't1', status: 'completed', performedAt: '2026-04-18T10:00:00Z' })];
    (tests[0] as Test).testTypeId = 'tt_unknown';
    const dist = computeTestTypeDistribution(tests, new Map(), NOW);
    expect(dist[0]!.label).toBe('tt_unknown');
  });
});

describe('computeMaterialCategoryDistribution', () => {
  const makeMaterial = (id: string, category: Material['category']): Material => ({
    id,
    designation: id,
    category,
    composition: [],
    standardRefs: [],
    properties: {},
    description: null,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  });

  it('進行中案件の試験片を母材カテゴリ別に集計', () => {
    const projects = [
      makeProject({ id: 'p_active', status: 'in_progress' }),
      makeProject({ id: 'p_done', status: 'completed' }),
    ];
    const specimens = [
      makeSpecimen({ id: 's1', projectId: 'p_active', status: 'received', receivedAt: '2026-04-18', materialId: 'mat_ti' }),
      makeSpecimen({ id: 's2', projectId: 'p_active', status: 'testing', receivedAt: '2026-04-18', materialId: 'mat_ti' }),
      makeSpecimen({ id: 's3', projectId: 'p_active', status: 'prepared', receivedAt: '2026-04-18', materialId: 'mat_ni' }),
      // 完了案件の試験片は除外される
      makeSpecimen({ id: 's4', projectId: 'p_done', status: 'stored', receivedAt: '2026-04-01', materialId: 'mat_ti' }),
    ];
    const materials = new Map<string, Material>([
      ['mat_ti', makeMaterial('mat_ti', 'titanium')],
      ['mat_ni', makeMaterial('mat_ni', 'nickel_alloy')],
    ]);

    const dist = computeMaterialCategoryDistribution({ projects, specimens, materials });
    expect(dist).toHaveLength(2);
    expect(dist[0]!.key).toBe('titanium');
    expect(dist[0]!.label).toBe('Ti 合金');
    expect(dist[0]!.value).toBe(2);
    expect(dist[1]!.key).toBe('nickel_alloy');
    expect(dist[1]!.label).toBe('Ni 基超合金');
    expect(dist[1]!.value).toBe(1);
  });

  it('materials index にない materialId の試験片は除外', () => {
    const projects = [makeProject({ id: 'p_active', status: 'in_progress' })];
    const specimens = [
      makeSpecimen({ id: 's1', projectId: 'p_active', status: 'received', receivedAt: '2026-04-18', materialId: 'mat_missing' }),
    ];
    const dist = computeMaterialCategoryDistribution({
      projects,
      specimens,
      materials: new Map(),
    });
    expect(dist).toHaveLength(0);
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
