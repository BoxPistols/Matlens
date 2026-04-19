import type { CuttingProcess, ID, WaveformSample } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import type {
  CuttingProcessQuery,
  CuttingProcessRepository,
} from '../interfaces/cuttingProcess.repo';

// 削除と再作成の衝突を避けるため、fixture の最大 seq から継続する単調増加カウンタを使う
let cuttingProcessSeq = 0;
const nextProcessSeq = (): number => {
  if (cuttingProcessSeq === 0) {
    const existing = getMockDatabase()
      .cuttingProcesses.getAll()
      .map((p) => {
        const m = /^cut_(\d+)$/.exec(p.id);
        return m ? Number(m[1]) : 0;
      })
      .filter((n) => Number.isFinite(n));
    cuttingProcessSeq = existing.length > 0 ? Math.max(...existing) : 0;
  }
  cuttingProcessSeq += 1;
  return cuttingProcessSeq;
};

const applySort = (
  items: CuttingProcess[],
  query?: CuttingProcessQuery
): CuttingProcess[] => {
  if (!query?.sort) return items;
  const { field, order } = query.sort;
  const sign = order === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return av > bv ? sign : -sign;
  });
};

const matchFilter = (p: CuttingProcess, query?: CuttingProcessQuery): boolean => {
  const f = query?.filter;
  if (!f) return true;
  if (f.specimenId && p.specimenId !== f.specimenId) return false;
  if (f.toolId && p.toolId !== f.toolId) return false;
  if (f.materialId && p.materialId !== f.materialId) return false;
  if (f.operations && f.operations.length > 0 && !f.operations.includes(p.operation)) return false;
  if (f.chatterDetected !== undefined && p.chatterDetected !== f.chatterDetected) return false;
  if (f.maxSurfaceRoughness !== undefined) {
    // 未測定 (null) は Ra 閾値フィルタで除外する — 誤って「閾値以下」に含めないため
    if (p.surfaceRoughnessRa === null || p.surfaceRoughnessRa > f.maxSurfaceRoughness) {
      return false;
    }
  }
  if (f.cuttingSpeedMin !== undefined && p.condition.cuttingSpeed < f.cuttingSpeedMin) return false;
  if (f.cuttingSpeedMax !== undefined && p.condition.cuttingSpeed > f.cuttingSpeedMax) return false;
  return true;
};

export const createMockCuttingProcessRepository = (): CuttingProcessRepository => ({
  async list(query) {
    await delay(120);
    const filtered = getMockDatabase()
      .cuttingProcesses.getAll()
      .filter((p) => matchFilter(p, query));
    const sorted = applySort(filtered, query);
    return paginate(sorted, query?.page ?? 1, query?.pageSize ?? 20);
  },

  async findById(id) {
    await delay(60);
    return getMockDatabase().cuttingProcesses.getById(id);
  },

  async findBySpecimen(specimenId: ID) {
    await delay(80);
    return getMockDatabase()
      .cuttingProcesses.getAll()
      .filter((p) => p.specimenId === specimenId);
  },

  async create(input) {
    await delay(180);
    const db = getMockDatabase();
    const now = new Date('2026-04-17T10:00:00Z').toISOString();
    const seq = nextProcessSeq();
    const id = `cut_${String(seq).padStart(6, '0')}`;
    const year = new Date(input.performedAt).getFullYear();
    const code = input.code ?? `CUT-${year}-${String(seq).padStart(4, '0')}`;
    const process: CuttingProcess = {
      id,
      code,
      specimenId: input.specimenId ?? null,
      materialId: input.materialId,
      toolId: input.toolId,
      operation: input.operation,
      condition: input.condition,
      machiningTimeSec: input.machiningTimeSec,
      cuttingDistanceMm: input.cuttingDistanceMm,
      surfaceRoughnessRa: input.surfaceRoughnessRa ?? null,
      toolWearVB: input.toolWearVB ?? null,
      chatterDetected: input.chatterDetected ?? null,
      cuttingForceFc: input.cuttingForceFc ?? null,
      cuttingTemperatureC: input.cuttingTemperatureC ?? null,
      waveformIds: [],
      operatorId: input.operatorId,
      machine: input.machine ?? null,
      performedAt: input.performedAt,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: input.operatorId,
      updatedBy: input.operatorId,
    };
    return db.cuttingProcesses.upsert(process);
  },

  async update(id, input) {
    await delay(140);
    return getMockDatabase().cuttingProcesses.update(id, input);
  },

  async delete(id) {
    await delay(100);
    getMockDatabase().cuttingProcesses.delete(id);
  },

  async waveforms(processId: ID): Promise<WaveformSample[]> {
    await delay(80);
    return getMockDatabase()
      .waveforms.getAll()
      .filter((w) => w.processId === processId);
  },
});
