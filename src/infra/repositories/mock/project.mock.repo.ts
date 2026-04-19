import type { ID, Project } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import { nanoid } from 'nanoid';
import type {
  ProjectQuery,
  ProjectRepository,
} from '../interfaces/project.repo';

// 削除と再作成が交互に走っても採番が衝突しないよう単調増加カウンタを保持する。
// 初期値は fixture 最大 seq（4 桁）を超えるところから開始。
let projectCodeCounter = 0;
const nextProjectSeq = (): number => {
  if (projectCodeCounter === 0) {
    const existing = getMockDatabase()
      .projects.getAll()
      .map((p) => Number(p.code.split('-').pop() ?? 0))
      .filter((n) => Number.isFinite(n));
    projectCodeCounter = existing.length > 0 ? Math.max(...existing) : 0;
  }
  projectCodeCounter += 1;
  return projectCodeCounter;
};

const matchFilter = (project: Project, query?: ProjectQuery): boolean => {
  const f = query?.filter;
  if (!f) return true;
  if (f.status && f.status.length > 0 && !f.status.includes(project.status)) return false;
  if (f.customerId && project.customerId !== f.customerId) return false;
  if (
    f.industryTagIds &&
    f.industryTagIds.length > 0 &&
    !f.industryTagIds.some((t) => project.industryTagIds.includes(t))
  ) {
    return false;
  }
  if (f.dueBefore && project.dueAt && project.dueAt > f.dueBefore) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    if (
      !project.title.toLowerCase().includes(q) &&
      !project.code.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  return true;
};

const applySort = (items: Project[], query?: ProjectQuery): Project[] => {
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

export const createMockProjectRepository = (): ProjectRepository => ({
  async list(query) {
    await delay(150);
    const db = getMockDatabase();
    const all = db.projects.getAll();
    const filtered = all.filter((p) => matchFilter(p, query));
    const sorted = applySort(filtered, query);
    return paginate(sorted, query?.page ?? 1, query?.pageSize ?? 20);
  },

  async findById(id: ID) {
    await delay(80);
    return getMockDatabase().projects.getById(id);
  },

  async create(input) {
    await delay(200);
    const db = getMockDatabase();
    // 固定時刻を基準にすることでテストのスナップショット比較が flaky にならない
    const nowDate = new Date('2026-04-17T10:00:00Z');
    const now = nowDate.toISOString();
    const year = nowDate.getFullYear();
    const seq = String(nextProjectSeq()).padStart(4, '0');
    const project: Project = {
      id: `prj_${nanoid(8)}`,
      code: `IIC-${year}-${seq}`,
      title: input.title,
      customerId: input.customerId,
      industryTagIds: input.industryTagIds,
      status: 'inquiry',
      startedAt: now.slice(0, 10),
      dueAt: input.dueAt ?? null,
      completedAt: null,
      specimenCount: 0,
      testCount: 0,
      pmId: input.pmId,
      leadEngineerId: input.leadEngineerId,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
      createdBy: input.pmId,
      updatedBy: input.pmId,
    };
    return db.projects.upsert(project);
  },

  async update(id, input) {
    await delay(150);
    const db = getMockDatabase();
    const patch: Partial<Project> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.status !== undefined) patch.status = input.status;
    if (input.dueAt !== undefined) patch.dueAt = input.dueAt ?? null;
    if (input.description !== undefined) patch.description = input.description ?? null;
    if (input.industryTagIds !== undefined) patch.industryTagIds = input.industryTagIds;
    if (input.pmId !== undefined) patch.pmId = input.pmId;
    if (input.leadEngineerId !== undefined) patch.leadEngineerId = input.leadEngineerId;
    return db.projects.update(id, patch);
  },

  async delete(id) {
    await delay(120);
    getMockDatabase().projects.delete(id);
  },
});
