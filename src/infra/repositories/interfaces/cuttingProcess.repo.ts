import type {
  CreateCuttingProcessInput,
  CuttingProcess,
  ID,
  MachiningOperation,
  Paginated,
  SortOption,
  UpdateCuttingProcessInput,
  WaveformSample,
} from '@/domain/types';

export interface CuttingProcessFilter {
  specimenId?: ID;
  toolId?: ID;
  materialId?: ID;
  operations?: MachiningOperation[];
  /** びびり振動の検出有無でフィルタ */
  chatterDetected?: boolean;
  /** 表面粗さ Ra の上限 (µm) */
  maxSurfaceRoughness?: number;
  /** 切削速度レンジ (m/min) */
  cuttingSpeedMin?: number;
  cuttingSpeedMax?: number;
}

export interface CuttingProcessQuery {
  filter?: CuttingProcessFilter;
  sort?: SortOption<CuttingProcess>;
  page?: number;
  pageSize?: number;
}

export interface CuttingProcessRepository {
  list(query?: CuttingProcessQuery): Promise<Paginated<CuttingProcess>>;
  findById(id: ID): Promise<CuttingProcess | null>;
  findBySpecimen(specimenId: ID): Promise<CuttingProcess[]>;
  create(input: CreateCuttingProcessInput): Promise<CuttingProcess>;
  update(id: ID, input: UpdateCuttingProcessInput): Promise<CuttingProcess>;
  delete(id: ID): Promise<void>;
  /** プロセスに紐づく波形サンプル（別テーブル）を取得 */
  waveforms(processId: ID): Promise<WaveformSample[]>;
}
