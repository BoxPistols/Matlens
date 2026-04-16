import type {
  ConfidenceLevel,
  DamageFinding,
  DamageType,
  ID,
  Paginated,
  SortOption,
} from '@/domain/types';

export interface DamageFilter {
  types?: DamageType[];
  materialIds?: ID[];
  confidenceLevel?: ConfidenceLevel[];
  tags?: string[];
  search?: string;
}

export interface DamageQuery {
  filter?: DamageFilter;
  sort?: SortOption<DamageFinding>;
  page?: number;
  pageSize?: number;
}

export interface DamageRepository {
  list(query?: DamageQuery): Promise<Paginated<DamageFinding>>;
  findById(id: ID): Promise<DamageFinding | null>;
  findSimilar(id: ID, limit?: number): Promise<DamageFinding[]>;
}
