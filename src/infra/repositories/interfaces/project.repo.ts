import type {
  CreateProjectInput,
  ID,
  Paginated,
  Project,
  ProjectStatus,
  SortOption,
  UpdateProjectInput,
} from '@/domain/types';

export interface ProjectFilter {
  status?: ProjectStatus[];
  customerId?: ID;
  industryTagIds?: ID[];
  dueBefore?: string;
  search?: string;
}

export interface ProjectQuery {
  filter?: ProjectFilter;
  sort?: SortOption<Project>;
  page?: number;
  pageSize?: number;
}

export interface ProjectRepository {
  list(query?: ProjectQuery): Promise<Paginated<Project>>;
  findById(id: ID): Promise<Project | null>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: ID, input: UpdateProjectInput): Promise<Project>;
  delete(id: ID): Promise<void>;
}
