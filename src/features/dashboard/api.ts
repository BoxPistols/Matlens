import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID, Material, Project, Customer } from '@/domain/types';

export const dashboardKeys = {
  all: ['ops-dashboard'] as const,
  projects: ['ops-dashboard', 'projects'] as const,
  specimens: ['ops-dashboard', 'specimens'] as const,
  tests: ['ops-dashboard', 'tests'] as const,
  damages: ['ops-dashboard', 'damages'] as const,
  tools: ['ops-dashboard', 'tools'] as const,
  cuttingProcesses: ['ops-dashboard', 'cutting-processes'] as const,
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
      const page = await projects.list({ pageSize: DASHBOARD_PROJECT_PAGE_SIZE });
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
      const page = await specimens.list({ pageSize: DASHBOARD_SPECIMEN_PAGE_SIZE });
      return page.items;
    },
    staleTime: 60_000,
  });
};

// TODO(stage2): 全件走査を Repository の集計専用エンドポイントに置き換える。
// 現状はモック規模（約 2,500 件）での PoC 用途に限定して pageSize を大きめに取る。
// 実 REST に差し替える際は /api/v1/dashboard/kpi のような集計 API を別途用意する前提。
const DASHBOARD_TEST_PAGE_SIZE = 3000;
const DASHBOARD_SPECIMEN_PAGE_SIZE = 1000;
const DASHBOARD_PROJECT_PAGE_SIZE = 500;
const DASHBOARD_DAMAGE_PAGE_SIZE = 500;
const DASHBOARD_TOOL_PAGE_SIZE = 200;
const DASHBOARD_CUTTING_PAGE_SIZE = 2000;

export const useAllTests = () => {
  const { tests } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.tests,
    queryFn: async () => {
      const page = await tests.list({ pageSize: DASHBOARD_TEST_PAGE_SIZE });
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
      const page = await damage.list({ pageSize: DASHBOARD_DAMAGE_PAGE_SIZE });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useAllTools = () => {
  const { tools } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.tools,
    queryFn: async () => {
      const page = await tools.list({ pageSize: DASHBOARD_TOOL_PAGE_SIZE });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useAllCuttingProcesses = () => {
  const { cuttingProcesses } = useRepositories();
  return useQuery({
    queryKey: dashboardKeys.cuttingProcesses,
    queryFn: async () => {
      const page = await cuttingProcesses.list({ pageSize: DASHBOARD_CUTTING_PAGE_SIZE });
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
      const page = await projects.list({ pageSize: DASHBOARD_PROJECT_PAGE_SIZE });
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
