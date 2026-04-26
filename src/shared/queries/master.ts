// マスター系（材料・試験種別・顧客）の参照データ取得フック。
// 複数画面で使うため、queryKey を本ファイルに集約してキャッシュを共有する。
// stale time は 5 分。マスターは更新頻度が低く、画面遷移ごとに再取得する必要はない。

import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';

export const masterKeys = {
  materials: ['masters', 'materials'] as const,
  testTypes: ['masters', 'test-types'] as const,
  customers: ['masters', 'customers'] as const,
};

const STALE_5MIN = 5 * 60_000;

export const useMaterials = () => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: masterKeys.materials,
    queryFn: () => materials.list(),
    staleTime: STALE_5MIN,
  });
};

export const useTestTypes = () => {
  const { testTypes } = useRepositories();
  return useQuery({
    queryKey: masterKeys.testTypes,
    queryFn: () => testTypes.list(),
    staleTime: STALE_5MIN,
  });
};

export const useCustomers = () => {
  const { customers } = useRepositories();
  return useQuery({
    queryKey: masterKeys.customers,
    queryFn: async () => {
      const page = await customers.list();
      return page.items;
    },
    staleTime: STALE_5MIN,
  });
};
