import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type {
  CuttingProcess,
  ID,
  Material,
} from '@/domain/types';
import type { ToolQuery } from '@/infra/repositories/interfaces';

export const toolsKeys = {
  all: ['tools-master'] as const,
  list: (query?: ToolQuery) => [...toolsKeys.all, 'list', query] as const,
  detail: (id: ID) => [...toolsKeys.all, 'detail', id] as const,
  processes: ['tools-processes'] as const,
  materials: ['tools-materials-index'] as const,
};

// TODO(stage2): 集計専用エンドポイントに移行する（/api/v1/tools/<id>/usage など）。
// 現状は client 側で CuttingProcess 全件を pull して絞り込み。
const TOOL_PROCESS_PAGE_SIZE = 2000;

export const useTools = (query?: ToolQuery) => {
  const { tools } = useRepositories();
  return useQuery({
    queryKey: toolsKeys.list(query),
    queryFn: () => tools.list(query),
    staleTime: 5 * 60_000,
  });
};

export const useTool = (id: ID | null) => {
  const { tools } = useRepositories();
  return useQuery({
    queryKey: toolsKeys.detail(id ?? ''),
    queryFn: () => (id ? tools.findById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
};

/**
 * 全加工プロセス（工具ライフ集計に使う）。
 * 同じクエリキーなので材料マスタの useAllTestsShared と同様にキャッシュされる。
 */
export const useAllCuttingProcesses = () => {
  const { cuttingProcesses } = useRepositories();
  return useQuery({
    queryKey: toolsKeys.processes,
    queryFn: async () => {
      const page = await cuttingProcesses.list({ pageSize: TOOL_PROCESS_PAGE_SIZE });
      return page.items;
    },
    staleTime: 2 * 60_000,
  });
};

export const useMaterialsIndex = () => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: toolsKeys.materials,
    queryFn: async () => {
      const all = await materials.list();
      return new Map<ID, Material>(all.map((m) => [m.id, m]));
    },
    staleTime: 10 * 60_000,
  });
};

export interface ToolUsageSummary {
  processCount: number;
  totalDistanceMm: number;
  maxVB: number | null;
  lastUsedAt: string | null;
  chatterCount: number;
}

/**
 * 工具別の簡易集計。一覧テーブルで件数 / 最終 VB / 最終使用日を出すのに使う。
 */
export const summarizeByTool = (
  processes: CuttingProcess[]
): Map<ID, ToolUsageSummary> => {
  const map = new Map<ID, ToolUsageSummary>();
  for (const p of processes) {
    const prev = map.get(p.toolId) ?? {
      processCount: 0,
      totalDistanceMm: 0,
      maxVB: null,
      lastUsedAt: null,
      chatterCount: 0,
    };
    prev.processCount += 1;
    prev.totalDistanceMm += p.cuttingDistanceMm;
    if (p.toolWearVB !== null) {
      prev.maxVB = prev.maxVB === null ? p.toolWearVB : Math.max(prev.maxVB, p.toolWearVB);
    }
    if (!prev.lastUsedAt || p.performedAt > prev.lastUsedAt) {
      prev.lastUsedAt = p.performedAt;
    }
    if (p.chatterDetected === true) prev.chatterCount += 1;
    map.set(p.toolId, prev);
  }
  return map;
};

export interface WearPoint {
  cumulativeDistanceMm: number;
  toolWearVB: number;
  performedAt: string;
  processId: ID;
  chatter: boolean;
}

/**
 * 指定工具の VB 進展系列を（累積加工距離 × VB）で並べる。
 * performedAt 昇順で累積距離を計算し、toolWearVB が null のプロセスはスキップ。
 */
export const buildWearSeries = (
  processes: CuttingProcess[],
  toolId: ID
): WearPoint[] => {
  const relevant = processes
    .filter((p) => p.toolId === toolId && p.toolWearVB !== null)
    .sort((a, b) => a.performedAt.localeCompare(b.performedAt));
  let cumulative = 0;
  const out: WearPoint[] = [];
  for (const p of relevant) {
    cumulative += p.cuttingDistanceMm;
    out.push({
      cumulativeDistanceMm: cumulative,
      toolWearVB: p.toolWearVB as number,
      performedAt: p.performedAt,
      processId: p.id,
      chatter: p.chatterDetected === true,
    });
  }
  return out;
};

