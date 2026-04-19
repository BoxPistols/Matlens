import { beforeEach, describe, expect, it } from 'vitest';
import { createMockCuttingProcessRepository } from './cuttingProcess.mock.repo';
import { createMockToolRepository } from './tool.mock.repo';
import { resetMockDatabase, getMockDatabase } from '@/mocks/database';

describe('createMockCuttingProcessRepository', () => {
  beforeEach(() => {
    resetMockDatabase();
  });

  it('list() は seed 固定で複数件の加工プロセスを返す', async () => {
    const repo = createMockCuttingProcessRepository();
    const page1 = await repo.list({ page: 1, pageSize: 10 });
    expect(page1.pagination.total).toBeGreaterThan(0);
    expect(page1.items.length).toBeLessThanOrEqual(10);
  });

  it('findBySpecimen() は指定 specimen に紐づくプロセスを全件返す', async () => {
    const repo = createMockCuttingProcessRepository();
    const anyProcess = getMockDatabase().cuttingProcesses.getAll()[0];
    expect(anyProcess).toBeDefined();
    if (!anyProcess || anyProcess.specimenId === null) return;
    const results = await repo.findBySpecimen(anyProcess.specimenId);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.specimenId === anyProcess.specimenId)).toBe(true);
  });

  it('filter.chatterDetected=true でびびり発生のみ抽出できる', async () => {
    const repo = createMockCuttingProcessRepository();
    const result = await repo.list({
      filter: { chatterDetected: true },
      pageSize: 100,
    });
    expect(result.items.every((p) => p.chatterDetected === true)).toBe(true);
  });

  it('filter.cuttingSpeedMin / Max で切削速度レンジ絞り込みが効く', async () => {
    const repo = createMockCuttingProcessRepository();
    const result = await repo.list({
      filter: { cuttingSpeedMin: 100, cuttingSpeedMax: 200 },
      pageSize: 200,
    });
    expect(
      result.items.every(
        (p) => p.condition.cuttingSpeed >= 100 && p.condition.cuttingSpeed <= 200
      )
    ).toBe(true);
  });

  it('waveforms() は波形が存在するプロセスについて配列を返す', async () => {
    const repo = createMockCuttingProcessRepository();
    const withWaveform = getMockDatabase()
      .cuttingProcesses.getAll()
      .find((p) => p.waveformIds.length > 0);
    if (!withWaveform) return; // モック側で 0 本になっているケースはスキップ
    const waves = await repo.waveforms(withWaveform.id);
    expect(waves.length).toBeGreaterThan(0);
    expect(waves.every((w) => w.processId === withWaveform.id)).toBe(true);
  });

  it('create() + findById() でラウンドトリップできる', async () => {
    const repo = createMockCuttingProcessRepository();
    const tools = await createMockToolRepository().list({ pageSize: 1 });
    const tool = tools.items[0];
    expect(tool).toBeDefined();
    if (!tool) return;

    const created = await repo.create({
      materialId: 'mat_sus304',
      toolId: tool.id,
      operation: 'turning',
      condition: {
        cuttingSpeed: 150,
        feed: 0.2,
        feedUnit: 'mm/rev',
        depthOfCut: 1.5,
        widthOfCut: null,
        spindleSpeed: 4700,
        coolant: 'flood',
        notes: null,
      },
      machiningTimeSec: 30,
      cuttingDistanceMm: 4500,
      operatorId: 'usr_eng_001',
      performedAt: '2026-04-17T10:00:00Z',
    });
    expect(created.id).toMatch(/^cut_/);
    const found = await repo.findById(created.id);
    expect(found?.toolId).toBe(tool.id);
  });
});

describe('createMockToolRepository', () => {
  beforeEach(() => {
    resetMockDatabase();
  });

  it('list() は seed 固定の工具マスタを返す', async () => {
    const repo = createMockToolRepository();
    const page = await repo.list({ pageSize: 50 });
    expect(page.pagination.total).toBeGreaterThan(0);
  });

  it('filter.applicableMaterialId で推奨母材別に絞り込める', async () => {
    const repo = createMockToolRepository();
    const result = await repo.list({
      filter: { applicableMaterialId: 'mat_ti6al4v' },
      pageSize: 50,
    });
    expect(result.items.every((t) => t.applicableMaterials.includes('mat_ti6al4v'))).toBe(true);
  });

  it('filter.types でエンドミルのみ抽出できる', async () => {
    const repo = createMockToolRepository();
    const result = await repo.list({
      filter: { types: ['end_mill'] },
      pageSize: 50,
    });
    expect(result.items.every((t) => t.type === 'end_mill')).toBe(true);
  });
});
