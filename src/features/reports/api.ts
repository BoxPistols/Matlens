import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID, Project, User } from '@/domain/types';
import type { ReportQuery } from '@/infra/repositories/interfaces';

export const reportsKeys = {
  all: ['reports'] as const,
  list: (query?: ReportQuery) => [...reportsKeys.all, 'list', query] as const,
  detail: (id: ID) => [...reportsKeys.all, 'detail', id] as const,
  users: ['reports-users-index'] as const,
  projects: ['reports-projects-index'] as const,
};

export const useReports = (query?: ReportQuery) => {
  const { reports } = useRepositories();
  return useQuery({
    queryKey: reportsKeys.list(query),
    queryFn: () => reports.list(query),
    staleTime: 60_000,
  });
};

export const useReport = (id: ID | null) => {
  const { reports } = useRepositories();
  return useQuery({
    queryKey: reportsKeys.detail(id ?? ''),
    queryFn: () => (id ? reports.findById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 60_000,
  });
};

/**
 * ユーザインデックス。UserRepository は現状 container に露出していないため、
 * mock DB から直接引く。
 * TODO(stage2): UserRepository を container に追加し、実 REST では
 * `/api/v1/users` 経由に差し替える。
 */
export const useUsersIndex = () => {
  return useQuery({
    queryKey: reportsKeys.users,
    queryFn: async () => {
      const { getMockDatabase } = await import('@/mocks/database');
      const all = getMockDatabase().users.getAll();
      return new Map<ID, User>(all.map((u) => [u.id, u]));
    },
    staleTime: 10 * 60_000,
  });
};

export const useProjectsIndexForReports = () => {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: reportsKeys.projects,
    queryFn: async () => {
      const page = await projects.list({ pageSize: 500 });
      return new Map<ID, Project>(page.items.map((p) => [p.id, p]));
    },
    staleTime: 10 * 60_000,
  });
};
