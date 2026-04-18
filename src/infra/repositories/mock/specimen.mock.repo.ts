import type { Specimen } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import { nanoid } from 'nanoid';
import type {
  SpecimenQuery,
  SpecimenRepository,
} from '../interfaces/specimen.repo';

const matchFilter = (specimen: Specimen, query?: SpecimenQuery): boolean => {
  const f = query?.filter;
  if (!f) return true;
  if (f.projectId && specimen.projectId !== f.projectId) return false;
  if (f.materialId && specimen.materialId !== f.materialId) return false;
  if (f.status && f.status.length > 0 && !f.status.includes(specimen.status)) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    if (!specimen.code.toLowerCase().includes(q)) return false;
  }
  return true;
};

export const createMockSpecimenRepository = (): SpecimenRepository => ({
  async list(query) {
    await delay(150);
    const db = getMockDatabase();
    const all = db.specimens.getAll().filter((s) => matchFilter(s, query));
    return paginate(all, query?.page ?? 1, query?.pageSize ?? 20);
  },

  async findById(id) {
    await delay(80);
    return getMockDatabase().specimens.getById(id);
  },

  async create(input) {
    await delay(200);
    const db = getMockDatabase();
    const now = new Date('2026-04-17T10:00:00Z').toISOString();
    // 削除後の再作成でも衝突しないよう nanoid 派生サフィックスを使う
    const code = input.code ?? `SPC-NEW-${nanoid(6).toUpperCase()}`;
    // TODO(auth): 実ユーザ情報が確立したら createdBy/updatedBy を current user から注入する
    const specimen: Specimen = {
      id: `spc_${nanoid(8)}`,
      code,
      projectId: input.projectId,
      materialId: input.materialId,
      dimensions: input.dimensions,
      cutFrom: input.cutFrom ?? { parentPart: null, location: null, direction: null },
      receivedAt: input.receivedAt,
      location: input.location ?? null,
      status: 'received',
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'usr_admin_001',
      updatedBy: 'usr_admin_001',
    };
    return db.specimens.upsert(specimen);
  },

  async update(id, input) {
    await delay(150);
    const db = getMockDatabase();
    return db.specimens.update(id, input);
  },

  async delete(id) {
    await delay(120);
    getMockDatabase().specimens.delete(id);
  },
});
