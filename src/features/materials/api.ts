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
  /** 材料 id → 関連試験片 / 試験件数 */
  usage: ['material-usage'] as const,
  /** 全試験（recent tests を材料横断で共有するためのグローバルキー） */
  allTests: ['material-all-tests'] as const,
};

// TODO(stage2): 現状 client 側で全件取って集計している。実 REST では集計
// 専用エンドポイントに切り出す（dashboard/api.ts と同方針）。
const MATERIAL_SPECIMEN_PAGE_SIZE = 1000;
const MATERIAL_TEST_PAGE_SIZE = 3000;

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
 */
export const useMaterialUsage = () => {
  const { specimens, tests } = useRepositories();
  return useQuery({
    queryKey: materialsMasterKeys.usage,
    queryFn: async () => {
      const specimenPage = await specimens.list({ pageSize: MATERIAL_SPECIMEN_PAGE_SIZE });
      const testPage = await tests.list({ pageSize: MATERIAL_TEST_PAGE_SIZE });
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
 * 全試験の単一取得。useMaterialRecentTests で材料横断に共有する。
 * 材料ごとに 3000 件 fetch を繰り返さないためのキャッシュ。
 */
const useAllTestsShared = () => {
  const { tests } = useRepositories();
  return useQuery({
    queryKey: materialsMasterKeys.allTests,
    queryFn: async () => {
      const page = await tests.list({ pageSize: MATERIAL_TEST_PAGE_SIZE });
      return page.items;
    },
    staleTime: 2 * 60_000,
  });
};

/**
 * 指定材料で実施された試験の上位 N 件（新しい順）。詳細画面の試験履歴用。
 * 全試験は useAllTestsShared で 1 回だけ取得し、クライアント側で specimenId で絞る。
 */
export const useMaterialRecentTests = (materialId: ID | null, limit = 20) => {
  const { specimens } = useRepositories();
  const allTestsQ = useAllTestsShared();
  const specPageQ = useQuery({
    queryKey: [...materialsMasterKeys.all, 'specimens-of-material', materialId] as const,
    queryFn: async () => {
      if (!materialId) return [];
      const page = await specimens.list({
        filter: { materialId },
        pageSize: 500,
      });
      return page.items;
    },
    enabled: !!materialId,
    staleTime: 2 * 60_000,
  });

  const isLoading = allTestsQ.isLoading || specPageQ.isLoading;
  const isError = allTestsQ.isError || specPageQ.isError;
  const data = !materialId
    ? []
    : (() => {
        if (!allTestsQ.data || !specPageQ.data) return undefined;
        const specimenIds = new Set(specPageQ.data.map((s) => s.id));
        if (specimenIds.size === 0) return [];
        return allTestsQ.data
          .filter((t) => specimenIds.has(t.specimenId))
          .sort((a, b) => {
            const aTime = Date.parse(a.performedAt);
            const bTime = Date.parse(b.performedAt);
            return bTime - aTime;
          })
          .slice(0, limit);
      })();

  return { data, isLoading, isError };
};
