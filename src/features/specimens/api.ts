import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID, Material, Project } from '@/domain/types';
import type { SpecimenQuery } from '@/infra/repositories/interfaces';

export const specimenKeys = {
  all: ['specimens'] as const,
  list: (query?: SpecimenQuery) => [...specimenKeys.all, 'list', query] as const,
  projects: ['specimens-projects-index'] as const,
  materials: ['specimens-materials-index'] as const,
};

export const useSpecimens = (query?: SpecimenQuery) => {
  const { specimens } = useRepositories();
  return useQuery({
    queryKey: specimenKeys.list(query),
    queryFn: () => specimens.list(query),
    staleTime: 60_000,
  });
};

/**
 * 案件インデックス: id → Project を Map で引けるようにする。
 * 試験片カードのバッジ / テーブルの案件名表示に使う。
 */
export const useProjectsIndex = () => {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: specimenKeys.projects,
    queryFn: async () => {
      const all = await projects.list({ pageSize: 500 });
      return new Map<ID, Project>(all.items.map((p) => [p.id, p]));
    },
    staleTime: 5 * 60_000,
  });
};

/**
 * 材料マスタインデックス: id → Material。
 */
export const useMaterialsIndex = () => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: specimenKeys.materials,
    queryFn: async () => {
      const all = await materials.list();
      return new Map<ID, Material>(all.map((m) => [m.id, m]));
    },
    staleTime: 5 * 60_000,
  });
};
