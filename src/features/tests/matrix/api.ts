import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { MatrixQuery } from '@/infra/repositories/interfaces';

export const testMatrixKeys = {
  all: ['test-matrix'] as const,
  matrix: (query?: MatrixQuery) => [...testMatrixKeys.all, 'matrix', query] as const,
  testTypes: ['test-types'] as const,
  materials: (filter?: Record<string, unknown>) => ['materials', filter] as const,
};

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
