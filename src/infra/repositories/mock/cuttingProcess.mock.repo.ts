import type { CuttingProcess, ID, WaveformSample } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import { nanoid } from 'nanoid';
import type {
  CuttingProcessQuery,
  CuttingProcessRepository,
} from '../interfaces/cuttingProcess.repo';

const matchFilter = (p: CuttingProcess, query?: CuttingProcessQuery): boolean => {
  const f = query?.filter;
  if (!f) return true;
  if (f.specimenId && p.specimenId !== f.specimenId) return false;
  if (f.toolId && p.toolId !== f.toolId) return false;
  if (f.materialId && p.materialId !== f.materialId) return false;
  if (f.operation && f.operation.length > 0 && !f.operation.includes(p.operation)) return false;
  if (f.chatterDetected !== undefined && p.chatterDetected !== f.chatterDetected) return false;
  if (
    f.maxSurfaceRoughness !== undefined &&
    p.surfaceRoughnessRa !== null &&
    p.surfaceRoughnessRa > f.maxSurfaceRoughness
  ) {
    return false;
  }
  if (f.cuttingSpeedMin !== undefined && p.condition.cuttingSpeed < f.cuttingSpeedMin) return false;
  if (f.cuttingSpeedMax !== undefined && p.condition.cuttingSpeed > f.cuttingSpeedMax) return false;
  return true;
};

export const createMockCuttingProcessRepository = (): CuttingProcessRepository => ({
  async list(query) {
    await delay(120);
    const all = getMockDatabase()
      .cuttingProcesses.getAll()
      .filter((p) => matchFilter(p, query));
    return paginate(all, query?.page ?? 1, query?.pageSize ?? 20);
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
    const code = input.code ?? `CUT-NEW-${nanoid(6).toUpperCase()}`;
    const process: CuttingProcess = {
      id: `cut_${nanoid(8)}`,
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
