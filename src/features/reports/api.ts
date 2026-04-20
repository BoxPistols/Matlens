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

export const useUsersIndex = () => {
  const { users } = useRepositories() as unknown as {
    // User Repository は container にまだ露出していないため materials を回避。
    // 実装が必要になったら CustomerRepository と並べて UserRepository を追加する。
    users: { list: () => Promise<User[]> };
  };
  return useQuery({
    queryKey: reportsKeys.users,
    queryFn: async () => {
      // mock database から直接取る fallback。
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
