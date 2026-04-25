// Project のフィルタ純粋関数。
// Mock Repository と MSW ハンドラ双方で共有し、実装の乖離を防ぐ。

import type { Project } from '@/domain/types';
import type { ProjectQuery } from '../../interfaces/project.repo';

export const matchProjectFilter = (project: Project, query?: ProjectQuery): boolean => {
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

export const applyProjectSort = (items: Project[], query?: ProjectQuery): Project[] => {
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
