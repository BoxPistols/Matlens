import type {
  CreateReportInput,
  ID,
  Paginated,
  Report,
  ReportKind,
  ReportStatus,
  SortOption,
  UpdateReportInput,
} from '@/domain/types';

export interface ReportFilter {
  projectId?: ID;
  testId?: ID;
  kind?: ReportKind[];
  status?: ReportStatus[];
  authorId?: ID;
  tags?: string[];
  search?: string;
}

export interface ReportQuery {
  filter?: ReportFilter;
  sort?: SortOption<Report>;
  page?: number;
  pageSize?: number;
}

export interface ReportRepository {
  list(query?: ReportQuery): Promise<Paginated<Report>>;
  findById(id: ID): Promise<Report | null>;
  create(input: CreateReportInput): Promise<Report>;
  update(id: ID, input: UpdateReportInput): Promise<Report>;
  delete(id: ID): Promise<void>;
}
