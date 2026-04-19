import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type {
  CuttingProcessQuery,
  ToolQuery,
} from '@/infra/repositories/interfaces';

export const cuttingKeys = {
  all: ['cutting'] as const,
  processes: (query?: CuttingProcessQuery) =>
    [...cuttingKeys.all, 'processes', query] as const,
  tools: (query?: ToolQuery) => [...cuttingKeys.all, 'tools', query] as const,
  materials: ['materials-master'] as const,
  waveforms: (processId: string) =>
    [...cuttingKeys.all, 'waveforms', processId] as const,
};

/**
 * 加工プロセス一覧。フィルタ・ソートを含めてキャッシュする。
 */
export const useCuttingProcesses = (query?: CuttingProcessQuery) => {
  const { cuttingProcesses } = useRepositories();
  return useQuery({
    queryKey: cuttingKeys.processes(query),
    queryFn: () => cuttingProcesses.list(query),
    staleTime: 60_000,
  });
};

/**
 * 工具マスタ。母材別・種別別のフィルタ用。
 */
export const useTools = (query?: ToolQuery) => {
  const { tools } = useRepositories();
  return useQuery({
    queryKey: cuttingKeys.tools(query),
    queryFn: () => tools.list(query),
    staleTime: 5 * 60_000,
  });
};

/**
 * 母材マスタ。散布図の母材フィルタで使う。
 */
export const useCuttingMaterials = () => {
  const { materials } = useRepositories();
  return useQuery({
    queryKey: cuttingKeys.materials,
    queryFn: () => materials.list(),
    staleTime: 5 * 60_000,
  });
};

/**
 * 選択プロセスに紐づく波形（必要時のみ fetch）。
 */
export const useProcessWaveforms = (processId: string | null) => {
  const { cuttingProcesses } = useRepositories();
  return useQuery({
    queryKey: cuttingKeys.waveforms(processId ?? ''),
    queryFn: () =>
      processId ? cuttingProcesses.waveforms(processId) : Promise.resolve([]),
    enabled: !!processId,
    staleTime: 60_000,
  });
};
