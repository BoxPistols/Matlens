import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID, Standard } from '@/domain/types';
import type { MaterialFilter } from '@/infra/repositories/interfaces';

export const materialsMasterKeys = {
  all: ['materials-master'] as const,
  list: (filter?: MaterialFilter) =>
    [...materialsMasterKeys.all, 'list', filter] as const,
  detail: (id: ID) => [...materialsMasterKeys.all, 'detail', id] as const,
  standards: ['standards-index'] as const,
  /** 材料 id → 関連試験件数 */
  testCountByMaterial: ['material-test-counts'] as const,
  /** 材料 id → 関連試験片件数 */
  specimenCountByMaterial: ['material-specimen-counts'] as const,
};

export const useMaterials = (filter?: MaterialFilter) => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: materialsMasterKeys.list(filter),
    queryFn: () => materials.list(filter),
    staleTime: 5 * 60_000,
  });
};

export const useMaterial = (id: ID | null) => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: materialsMasterKeys.detail(id ?? ''),
    queryFn: () => (id ? materials.findById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
};

/**
 * Standards を id 引きできる Map。
 * Material.standardRefs を詳細画面で表示するときに使う。
 */
export const useStandardsIndex = () => {
  const { standards } = useRepositories();
  return useQuery({
    queryKey: materialsMasterKeys.standards,
    queryFn: async () => {
      const all = await standards.list();
      return new Map<ID, Standard>(all.map((s) => [s.id, s]));
    },
    staleTime: 10 * 60_000,
  });
};

/**
 * 材料ごとの試験片件数と試験件数を集計する。
 * 一覧で「実績数」列に表示する用途。
 * 規模が大きくなれば Repository 側に集計エンドポイントを切り出す。
 */
export const useMaterialUsage = () => {
  const { specimens, tests } = useRepositories();
  return useQuery({
    queryKey: materialsMasterKeys.testCountByMaterial,
    queryFn: async () => {
      const specimenPage = await specimens.list({ pageSize: 1000 });
      const testPage = await tests.list({ pageSize: 3000 });
      const specimenByMaterial = new Map<ID, number>();
      const specimenIdToMaterial = new Map<ID, ID>();
      for (const s of specimenPage.items) {
        specimenByMaterial.set(s.materialId, (specimenByMaterial.get(s.materialId) ?? 0) + 1);
        specimenIdToMaterial.set(s.id, s.materialId);
      }
      const testByMaterial = new Map<ID, number>();
      for (const t of testPage.items) {
        const matId = specimenIdToMaterial.get(t.specimenId);
        if (!matId) continue;
        testByMaterial.set(matId, (testByMaterial.get(matId) ?? 0) + 1);
      }
      return { specimenByMaterial, testByMaterial };
    },
    staleTime: 2 * 60_000,
  });
};

/**
 * 指定材料で実施された試験の上位 N 件（新しい順）。詳細画面の試験履歴用。
 */
export const useMaterialRecentTests = (materialId: ID | null, limit = 20) => {
  const { specimens, tests } = useRepositories();
  return useQuery({
    queryKey: [...materialsMasterKeys.all, 'recent-tests', materialId, limit] as const,
    queryFn: async () => {
      if (!materialId) return [];
      const specPage = await specimens.list({
        filter: { materialId },
        pageSize: 500,
      });
      const specimenIds = new Set(specPage.items.map((s) => s.id));
      if (specimenIds.size === 0) return [];
      const testPage = await tests.list({ pageSize: 3000 });
      return testPage.items
        .filter((t) => specimenIds.has(t.specimenId))
        .sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1))
        .slice(0, limit);
    },
    enabled: !!materialId,
    staleTime: 2 * 60_000,
  });
};
