// Repository DIコンテナ
// VITE_BACKEND_MODE により mock / rest を切り替える想定。
// REST実装は Stage 2 以降で追加する（現時点ではモックのみ）。

import type {
  CustomerRepository,
  CuttingProcessRepository,
  DamageRepository,
  MaterialRepository,
  ProjectRepository,
  ReportRepository,
  SearchRepository,
  SpecimenRepository,
  StandardRepository,
  TestRepository,
  TestTypeRepository,
  ToolRepository,
} from './interfaces';

import {
  createMockProjectRepository,
  createMockSpecimenRepository,
  createMockTestRepository,
  createMockTestTypeRepository,
  createMockMaterialRepository,
  createMockStandardRepository,
  createMockCustomerRepository,
  createMockDamageRepository,
  createMockSearchRepository,
  createMockToolRepository,
  createMockCuttingProcessRepository,
  createMockReportRepository,
} from './mock';

export type BackendMode = 'mock' | 'rest' | 'graphql';

export interface RepositoryContainer {
  projects: ProjectRepository;
  specimens: SpecimenRepository;
  tests: TestRepository;
  testTypes: TestTypeRepository;
  materials: MaterialRepository;
  standards: StandardRepository;
  customers: CustomerRepository;
  damage: DamageRepository;
  search: SearchRepository;
  tools: ToolRepository;
  cuttingProcesses: CuttingProcessRepository;
  reports: ReportRepository;
}

const createMockRepositories = (): RepositoryContainer => ({
  projects: createMockProjectRepository(),
  specimens: createMockSpecimenRepository(),
  tests: createMockTestRepository(),
  testTypes: createMockTestTypeRepository(),
  materials: createMockMaterialRepository(),
  standards: createMockStandardRepository(),
  customers: createMockCustomerRepository(),
  damage: createMockDamageRepository(),
  search: createMockSearchRepository(),
  tools: createMockToolRepository(),
  cuttingProcesses: createMockCuttingProcessRepository(),
  reports: createMockReportRepository(),
});

export const createRepositories = (mode: BackendMode): RepositoryContainer => {
  switch (mode) {
    case 'mock':
      return createMockRepositories();
    case 'rest':
      throw new Error('REST repositories are not implemented yet. Use mock mode.');
    case 'graphql':
      throw new Error('GraphQL repositories are not implemented yet. Use mock mode.');
  }
};

export const resolveBackendMode = (): BackendMode => {
  const raw = (import.meta.env.VITE_BACKEND_MODE ?? 'mock') as string;
  if (raw === 'mock' || raw === 'rest' || raw === 'graphql') return raw;
  return 'mock';
};
