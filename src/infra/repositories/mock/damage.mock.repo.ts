import type { DamageFinding } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import type {
  DamageQuery,
  DamageRepository,
} from '../interfaces/damage.repo';

const matchFilter = (damage: DamageFinding, query?: DamageQuery): boolean => {
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

export const createMockDamageRepository = (): DamageRepository => ({
  async list(query) {
    await delay(120);
    const all = getMockDatabase().damages.getAll().filter((d) => matchFilter(d, query));
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
