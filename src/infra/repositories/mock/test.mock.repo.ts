import type { ID, Test } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import { nanoid } from 'nanoid';
import type {
  MatrixCell,
  MatrixQuery,
  MatrixResult,
  TestQuery,
  TestRepository,
  TestTypeRepository,
} from '../interfaces/test.repo';

const matchFilter = (test: Test, query?: TestQuery, specimenProjectMap?: Map<ID, ID>): boolean => {
  const f = query?.filter;
  if (!f) return true;
  if (f.specimenId && test.specimenId !== f.specimenId) return false;
  if (f.testTypeId && test.testTypeId !== f.testTypeId) return false;
  if (f.status && f.status.length > 0 && !f.status.includes(test.status)) return false;
  if (f.performedAfter && test.performedAt < f.performedAfter) return false;
  if (f.performedBefore && test.performedAt > f.performedBefore) return false;
  const tempC =
    test.condition.temperature.unit === 'K'
      ? test.condition.temperature.value - 273.15
      : test.condition.temperature.value;
  if (f.temperatureMin !== undefined && tempC < f.temperatureMin) return false;
  if (f.temperatureMax !== undefined && tempC > f.temperatureMax) return false;
  if (f.projectId && specimenProjectMap) {
    if (specimenProjectMap.get(test.specimenId) !== f.projectId) return false;
  }
  return true;
};

export const createMockTestRepository = (): TestRepository => ({
  async list(query) {
    await delay(150);
    const db = getMockDatabase();
    const specimenProjectMap = new Map<ID, ID>(
      db.specimens.getAll().map((s) => [s.id, s.projectId])
    );
    const all = db.tests.getAll().filter((t) => matchFilter(t, query, specimenProjectMap));
    return paginate(all, query?.page ?? 1, query?.pageSize ?? 20);
  },

  async findById(id) {
    await delay(80);
    return getMockDatabase().tests.getById(id);
  },

  async create(input) {
    await delay(200);
    const db = getMockDatabase();
    const now = new Date().toISOString();
    const test: Test = {
      id: `tst_${nanoid(8)}`,
      specimenId: input.specimenId,
      testTypeId: input.testTypeId,
      condition: input.condition,
      standardIds: input.standardIds,
      performedAt: input.performedAt,
      operatorId: input.operatorId,
      equipmentId: input.equipmentId ?? null,
      status: 'scheduled',
      resultMetrics: [],
      rawDataRefs: [],
      observations: [],
      createdAt: now,
      updatedAt: now,
      createdBy: input.operatorId,
      updatedBy: input.operatorId,
    };
    return db.tests.upsert(test);
  },

  async update(id, input) {
    await delay(150);
    return getMockDatabase().tests.update(id, input);
  },

  async delete(id) {
    await delay(120);
    getMockDatabase().tests.delete(id);
  },

  async matrix(query?: MatrixQuery): Promise<MatrixResult> {
    await delay(200);
    const db = getMockDatabase();
    const specimens = db.specimens.getAll();
    const specimenById = new Map(specimens.map((s) => [s.id, s]));
    const projectById = new Map(db.projects.getAll().map((p) => [p.id, p]));

    // 'YYYY-MM-DD' のような日付のみの指定は、時刻付き performedAt と比較するために
    // その日の末尾 (23:59:59.999Z) に正規化する
    const normalizedDateFrom = query?.dateFrom;
    const normalizedDateTo =
      query?.dateTo && /^\d{4}-\d{2}-\d{2}$/.test(query.dateTo)
        ? `${query.dateTo}T23:59:59.999Z`
        : query?.dateTo;

    const allTests = db.tests.getAll().filter((t) => {
      if (normalizedDateFrom && t.performedAt < normalizedDateFrom) return false;
      if (normalizedDateTo && t.performedAt > normalizedDateTo) return false;
      if (query?.customerId) {
        const spec = specimenById.get(t.specimenId);
        if (!spec) return false;
        const project = projectById.get(spec.projectId);
        if (!project || project.customerId !== query.customerId) return false;
      }
      return true;
    });

    const cellMap = new Map<string, MatrixCell>();
    for (const t of allTests) {
      const spec = specimenById.get(t.specimenId);
      if (!spec) continue;
      const materialId = spec.materialId;
      const testTypeId = t.testTypeId;

      if (query?.materialIds && query.materialIds.length > 0 && !query.materialIds.includes(materialId)) continue;
      if (query?.testTypeIds && query.testTypeIds.length > 0 && !query.testTypeIds.includes(testTypeId)) continue;

      const key = `${materialId}__${testTypeId}`;
      const existing = cellMap.get(key);
      const tempC =
        t.condition.temperature.unit === 'K'
          ? t.condition.temperature.value - 273.15
          : t.condition.temperature.value;
      if (!existing) {
        cellMap.set(key, {
          materialId,
          testTypeId,
          count: 1,
          latestPerformedAt: t.performedAt,
          representativeTemperature: tempC,
          atmospheres: [t.condition.atmosphere],
        });
      } else {
        existing.count += 1;
        if (!existing.latestPerformedAt || t.performedAt > existing.latestPerformedAt) {
          existing.latestPerformedAt = t.performedAt;
          // 代表温度は「最新試験の温度」を反映する
          existing.representativeTemperature = tempC;
        }
        if (!existing.atmospheres.includes(t.condition.atmosphere)) {
          existing.atmospheres.push(t.condition.atmosphere);
        }
      }
    }

    const cells = Array.from(cellMap.values());
    const rowTotalsMap = new Map<ID, number>();
    const colTotalsMap = new Map<ID, number>();
    cells.forEach((c) => {
      rowTotalsMap.set(c.materialId, (rowTotalsMap.get(c.materialId) ?? 0) + c.count);
      colTotalsMap.set(c.testTypeId, (colTotalsMap.get(c.testTypeId) ?? 0) + c.count);
    });

    return {
      cells,
      rowTotals: Array.from(rowTotalsMap, ([materialId, count]) => ({ materialId, count })),
      columnTotals: Array.from(colTotalsMap, ([testTypeId, count]) => ({ testTypeId, count })),
    };
  },
});

export const createMockTestTypeRepository = (): TestTypeRepository => ({
  async list() {
    await delay(50);
    return getMockDatabase().testTypes.getAll();
  },
  async findById(id) {
    await delay(30);
    return getMockDatabase().testTypes.getById(id);
  },
});
