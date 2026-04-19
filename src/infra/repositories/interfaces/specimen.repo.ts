import type {
  CreateSpecimenInput,
  ID,
  Paginated,
  Specimen,
  SpecimenStatus,
  SortOption,
  UpdateSpecimenInput,
} from '@/domain/types';

export interface SpecimenFilter {
  projectId?: ID;
  materialId?: ID;
  status?: SpecimenStatus[];
  search?: string;
}

export interface SpecimenQuery {
  filter?: SpecimenFilter;
  sort?: SortOption<Specimen>;
  page?: number;
  pageSize?: number;
}

export interface SpecimenRepository {
  list(query?: SpecimenQuery): Promise<Paginated<Specimen>>;
  findById(id: ID): Promise<Specimen | null>;
  create(input: CreateSpecimenInput): Promise<Specimen>;
  update(id: ID, input: UpdateSpecimenInput): Promise<Specimen>;
  delete(id: ID): Promise<void>;
}
