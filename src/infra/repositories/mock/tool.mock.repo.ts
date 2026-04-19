import type { Tool } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import { nanoid } from 'nanoid';
import type { ToolQuery, ToolRepository } from '../interfaces/tool.repo';

const matchFilter = (tool: Tool, query?: ToolQuery): boolean => {
  const f = query?.filter;
  if (!f) return true;
  if (f.types && f.types.length > 0 && !f.types.includes(tool.type)) return false;
  if (f.materials && f.materials.length > 0 && !f.materials.includes(tool.material)) return false;
  if (f.applicableMaterialId && !tool.applicableMaterials.includes(f.applicableMaterialId)) {
    return false;
  }
  if (f.search) {
    const q = f.search.toLowerCase();
    if (
      !tool.code.toLowerCase().includes(q) &&
      !tool.name.toLowerCase().includes(q) &&
      !tool.nameEn.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  return true;
};

export const createMockToolRepository = (): ToolRepository => ({
  async list(query) {
    await delay(80);
    const all = getMockDatabase().tools.getAll().filter((t) => matchFilter(t, query));
    return paginate(all, query?.page ?? 1, query?.pageSize ?? 24);
  },

  async findById(id) {
    await delay(40);
    return getMockDatabase().tools.getById(id);
  },

  async create(input) {
    await delay(150);
    const db = getMockDatabase();
    const now = new Date('2026-04-17T10:00:00Z').toISOString();
    // TODO(auth): 実ユーザ情報が確立したら createdBy/updatedBy を current user から注入する
    const tool: Tool = {
      id: `tool_${nanoid(8)}`,
      code: input.code,
      name: input.name,
      nameEn: input.nameEn,
      type: input.type,
      material: input.material,
      coating: input.coating ?? null,
      diameter: input.diameter,
      fluteCount: input.fluteCount ?? null,
      rakeAngle: input.rakeAngle ?? null,
      reliefAngle: input.reliefAngle ?? null,
      helixAngle: input.helixAngle ?? null,
      cornerRadius: input.cornerRadius ?? null,
      maxDepthOfCut: input.maxDepthOfCut ?? null,
      applicableMaterials: input.applicableMaterials ?? [],
      vendor: input.vendor ?? null,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'usr_admin_001',
      updatedBy: 'usr_admin_001',
    };
    return db.tools.upsert(tool);
  },

  async update(id, input) {
    await delay(120);
    return getMockDatabase().tools.update(id, input);
  },

  async delete(id) {
    await delay(100);
    getMockDatabase().tools.delete(id);
  },
});
