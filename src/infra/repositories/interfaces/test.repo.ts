import type {
  CreateTestInput,
  ID,
  Paginated,
  SortOption,
  Test,
  TestStatus,
  TestType,
  UpdateTestInput,
} from '@/domain/types';

export interface TestFilter {
  specimenId?: ID;
  projectId?: ID;
  testTypeId?: ID;
  status?: TestStatus[];
  performedAfter?: string;
  performedBefore?: string;
  temperatureMin?: number;
  temperatureMax?: number;
}

export interface TestQuery {
  filter?: TestFilter;
  sort?: SortOption<Test>;
  page?: number;
  pageSize?: number;
}

export interface MatrixCell {
  materialId: ID;
  testTypeId: ID;
  count: number;
  latestPerformedAt: string | null;
  representativeTemperature: number | null;
  atmospheres: string[];
}

export interface MatrixResult {
  cells: MatrixCell[];
  rowTotals: { materialId: ID; count: number }[];
  columnTotals: { testTypeId: ID; count: number }[];
}

export interface MatrixQuery {
  materialIds?: ID[];
  testTypeIds?: ID[];
  dateFrom?: string;
  dateTo?: string;
  customerId?: ID;
}

export interface TestRepository {
  list(query?: TestQuery): Promise<Paginated<Test>>;
  findById(id: ID): Promise<Test | null>;
  create(input: CreateTestInput): Promise<Test>;
  update(id: ID, input: UpdateTestInput): Promise<Test>;
  delete(id: ID): Promise<void>;
  matrix(query?: MatrixQuery): Promise<MatrixResult>;
}

export interface TestTypeRepository {
  list(): Promise<TestType[]>;
  findById(id: ID): Promise<TestType | null>;
}
