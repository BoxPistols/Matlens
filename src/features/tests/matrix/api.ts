import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { MatrixQuery } from '@/infra/repositories/interfaces';

export const testMatrixKeys = {
  all: ['test-matrix'] as const,
  matrix: (query?: MatrixQuery) => [...testMatrixKeys.all, 'matrix', query] as const,
  testTypes: ['test-types'] as const,
  materials: (filter?: Record<string, unknown>) => ['materials', filter] as const,
  tests: (query?: Record<string, unknown>) => [...testMatrixKeys.all, 'tests', query] as const,
  damages: ['test-matrix', 'damages'] as const,
  specimens: ['test-matrix', 'specimens'] as const,
  customers: ['test-matrix', 'customers'] as const,
  projects: ['test-matrix', 'projects'] as const,
};

// マトリクス画面で異常率計算に使う補助データ。
// dateFrom 付きで tests を絞ることでフロント集計の計算量を減らす。
const MATRIX_TEST_PAGE_SIZE = 3000;
const MATRIX_DAMAGE_PAGE_SIZE = 500;
const MATRIX_SPECIMEN_PAGE_SIZE = 1000;

export const useTestMatrix = (query?: MatrixQuery) => {
  const { tests } = useRepositories();
  return useQuery({
    queryKey: testMatrixKeys.matrix(query),
    queryFn: () => tests.matrix(query),
    staleTime: 60_000,
  });
};

export const useTestTypes = () => {
  const { testTypes } = useRepositories();
  return useQuery({
    queryKey: testMatrixKeys.testTypes,
    queryFn: () => testTypes.list(),
    staleTime: 5 * 60_000,
  });
};

export const useMaterials = () => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: testMatrixKeys.materials(),
    queryFn: () => materials.list(),
    staleTime: 5 * 60_000,
  });
};

export const useMatrixTests = (dateFrom?: string) => {
  const { tests } = useRepositories();
  return useQuery({
    queryKey: testMatrixKeys.tests({ dateFrom }),
    queryFn: async () => {
      const page = await tests.list({
        filter: dateFrom ? { performedAfter: dateFrom } : undefined,
        pageSize: MATRIX_TEST_PAGE_SIZE,
      });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useMatrixDamages = () => {
  const { damage } = useRepositories();
  return useQuery({
    queryKey: testMatrixKeys.damages,
    queryFn: async () => {
      const page = await damage.list({ pageSize: MATRIX_DAMAGE_PAGE_SIZE });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useMatrixSpecimens = () => {
  const { specimens } = useRepositories();
  return useQuery({
    queryKey: testMatrixKeys.specimens,
    queryFn: async () => {
      const page = await specimens.list({ pageSize: MATRIX_SPECIMEN_PAGE_SIZE });
      return page.items;
    },
    staleTime: 60_000,
  });
};

export const useMatrixCustomers = () => {
  const { customers } = useRepositories();
  return useQuery({
    queryKey: testMatrixKeys.customers,
    queryFn: async () => {
      const page = await customers.list();
      return page.items;
    },
    staleTime: 5 * 60_000,
  });
};

export const useMatrixProjects = () => {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: testMatrixKeys.projects,
    queryFn: async () => {
      const page = await projects.list({ pageSize: 500 });
      return page.items;
    },
    staleTime: 60_000,
  });
};
