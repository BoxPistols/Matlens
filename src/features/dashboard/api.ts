import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID, Material, Project, Customer } from '@/domain/types';

export const dashboardKeys = {
  all: ['ops-dashboard'] as const,
  projects: ['ops-dashboard', 'projects'] as const,
  specimens: ['ops-dashboard', 'specimens'] as const,
  tests: ['ops-dashboard', 'tests'] as const,
  damages: ['ops-dashboard', 'damages'] as const,
  projectsIndex: ['ops-dashboard', 'projects-index'] as const,
  materialsIndex: ['ops-dashboard', 'materials-index'] as const,
  customersIndex: ['ops-dashboard', 'customers-index'] as const,
};

/**
 * 全案件（KPI 集計・納期リスク判定に使う）。
 */
export const useAllProjects = () => {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.projects,
    queryFn: async () => {
      const page = await projects.list({ pageSize: 500 });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useAllSpecimens = () => {
  const { specimens } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.specimens,
    queryFn: async () => {
      const page = await specimens.list({ pageSize: 1000 });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useAllTests = () => {
  const { tests } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.tests,
    queryFn: async () => {
      const page = await tests.list({ pageSize: 3000 });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useAllDamages = () => {
  const { damage } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.damages,
    queryFn: async () => {
      const page = await damage.list({ pageSize: 500 });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useProjectsIndex = () => {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.projectsIndex,
    queryFn: async () => {
      const page = await projects.list({ pageSize: 500 });
      return new Map<ID, Project>(page.items.map((p) => [p.id, p]));
    },
    staleTime: 5 * 60_000,
  });
};

export const useMaterialsIndex = () => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.materialsIndex,
    queryFn: async () => {
      const all = await materials.list();
      return new Map<ID, Material>(all.map((m) => [m.id, m]));
    },
    staleTime: 5 * 60_000,
  });
};

export const useCustomersIndex = () => {
  const { customers } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.customersIndex,
    queryFn: async () => {
      const page = await customers.list();
      return new Map<ID, Customer>(page.items.map((c) => [c.id, c]));
    },
    staleTime: 5 * 60_000,
  });
};
