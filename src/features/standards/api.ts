import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID, Material, TestType } from '@/domain/types';
import type { StandardFilter } from '@/infra/repositories/interfaces';

export const standardsKeys = {
  all: ['standards-master'] as const,
  list: (filter?: StandardFilter) =>
    [...standardsKeys.all, 'list', filter] as const,
  detail: (id: ID) => [...standardsKeys.all, 'detail', id] as const,
  testTypes: ['standards-testtypes-index'] as const,
  materialsRef: ['standards-materials-ref'] as const,
  testCounts: ['standards-test-counts'] as const,
};

// TODO(stage2): 現状 client 側で全件走査。実 REST では集計エンドポイントへ
const STANDARDS_TEST_PAGE_SIZE = 3000;

export const useStandards = (filter?: StandardFilter) => {
  const { standards } = useRepositories();
  return useQuery({
    queryKey: standardsKeys.list(filter),
    queryFn: () => standards.list(filter),
    staleTime: 10 * 60_000,
  });
};

export const useStandard = (id: ID | null) => {
  const { standards } = useRepositories();
  return useQuery({
    queryKey: standardsKeys.detail(id ?? ''),
    queryFn: () => (id ? standards.findById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 10 * 60_000,
  });
};

/**
 * TestType を id 引きできる Map。詳細画面で relatedTestTypeIds を表示するとき使う。
 */
export const useTestTypesIndex = () => {
  const { testTypes } = useRepositories();
  return useQuery({
    queryKey: standardsKeys.testTypes,
    queryFn: async () => {
      const all = await testTypes.list();
      return new Map<ID, TestType>(all.map((t) => [t.id, t]));
    },
    staleTime: 10 * 60_000,
  });
};

/**
 * 規格 id → この規格を standardRefs に含む材料の配列。
 * 詳細画面で「この規格に準拠した材料」を出す用途。
 */
export const useMaterialsByStandard = () => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: standardsKeys.materialsRef,
    queryFn: async () => {
      const all = await materials.list();
      const map = new Map<ID, Material[]>();
      for (const m of all) {
        for (const sid of m.standardRefs) {
          const bucket = map.get(sid) ?? [];
          bucket.push(m);
          map.set(sid, bucket);
        }
      }
      return map;
    },
    staleTime: 10 * 60_000,
  });
};

/**
 * 規格 id → この規格を使って実施された試験件数。
 * tests.standardIds を全件走査して集計。
 */
export const useTestCountsByStandard = () => {
  const { tests } = useRepositories();
  return useQuery({
    queryKey: standardsKeys.testCounts,
    queryFn: async () => {
      const page = await tests.list({ pageSize: STANDARDS_TEST_PAGE_SIZE });
      const map = new Map<ID, number>();
      for (const t of page.items) {
        for (const sid of t.standardIds ?? []) {
          map.set(sid, (map.get(sid) ?? 0) + 1);
        }
      }
      return map;
    },
    staleTime: 2 * 60_000,
  });
};
