import type { DamageFinding, ID } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import type {
  DamageQuery,
  DamageRepository,
} from '../interfaces/damage.repo';

const matchFilter = (
  damage: DamageFinding,
  query: DamageQuery | undefined,
  damageMaterialMap: Map<ID, ID>
): boolean => {
  const f = query?.filter;
  if (!f) return true;
  if (f.types && f.types.length > 0 && !f.types.includes(damage.type)) return false;
  if (
    f.confidenceLevel &&
    f.confidenceLevel.length > 0 &&
    !f.confidenceLevel.includes(damage.confidenceLevel)
  ) {
    return false;
  }
  if (f.tags && f.tags.length > 0 && !f.tags.some((t) => damage.tags.includes(t))) {
    return false;
  }
  if (f.materialIds && f.materialIds.length > 0) {
    const materialId = damageMaterialMap.get(damage.id);
    if (!materialId || !f.materialIds.includes(materialId)) return false;
  }
  if (f.search) {
    const q = f.search.toLowerCase();
    if (
      !damage.location.toLowerCase().includes(q) &&
      !damage.rootCauseHypothesis.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  return true;
};

// damage → test → specimen → material の解決テーブルを構築
const buildDamageMaterialMap = (): Map<ID, ID> => {
  const db = getMockDatabase();
  const specimenMaterial = new Map<ID, ID>(
    db.specimens.getAll().map((s) => [s.id, s.materialId])
  );
  const testSpecimen = new Map<ID, ID>(db.tests.getAll().map((t) => [t.id, t.specimenId]));
  const map = new Map<ID, ID>();
  for (const d of db.damages.getAll()) {
    if (!d.testId) continue;
    const specimenId = testSpecimen.get(d.testId);
    if (!specimenId) continue;
    const materialId = specimenMaterial.get(specimenId);
    if (materialId) map.set(d.id, materialId);
  }
  return map;
};

export const createMockDamageRepository = (): DamageRepository => ({
  async list(query) {
    await delay(120);
    const damageMaterialMap = buildDamageMaterialMap();
    const all = getMockDatabase()
      .damages.getAll()
      .filter((d) => matchFilter(d, query, damageMaterialMap));
    return paginate(all, query?.page ?? 1, query?.pageSize ?? 24);
  },

  async findById(id) {
    await delay(60);
    return getMockDatabase().damages.getById(id);
  },

  async findSimilar(id, limit = 8) {
    await delay(150);
    const db = getMockDatabase();
    const target = db.damages.getById(id);
    if (!target) return [];
    // 単純に同一typeから近傍を返すモック
    return db.damages
      .getAll()
      .filter((d) => d.id !== id && d.type === target.type)
      .slice(0, limit);
  },
});
