import type {
  CreateToolInput,
  ID,
  Paginated,
  SortOption,
  Tool,
  ToolMaterial,
  ToolType,
  UpdateToolInput,
} from '@/domain/types';

export interface ToolFilter {
  types?: ToolType[];
  materials?: ToolMaterial[];
  applicableMaterialId?: ID;
  search?: string;
}

export interface ToolQuery {
  filter?: ToolFilter;
  sort?: SortOption<Tool>;
  page?: number;
  pageSize?: number;
}

export interface ToolRepository {
  list(query?: ToolQuery): Promise<Paginated<Tool>>;
  findById(id: ID): Promise<Tool | null>;
  create(input: CreateToolInput): Promise<Tool>;
  update(id: ID, input: UpdateToolInput): Promise<Tool>;
  delete(id: ID): Promise<void>;
}
