// メモリ内データベース
// src/mocks/fixtures/*.json（pnpm mocks:generate で生成）をロードする。
// faker や generators は本番バンドルには含まれない。

import type {
  CuttingProcess,
  Customer,
  DamageFinding,
  ID,
  Material,
  Project,
  Report,
  Specimen,
  Standard,
  Test,
  TestType,
  Tool,
  User,
  WaveformSample,
} from '@/domain/types';

import customersJson from './fixtures/customers.json';
import usersJson from './fixtures/users.json';
import materialsJson from './fixtures/materials.json';
import standardsJson from './fixtures/standards.json';
import testTypesJson from './fixtures/testTypes.json';
import projectsJson from './fixtures/projects.json';
import specimensJson from './fixtures/specimens.json';
import testsJson from './fixtures/tests.json';
import damagesJson from './fixtures/damages.json';
import toolsJson from './fixtures/tools.json';
import cuttingProcessesJson from './fixtures/cuttingProcesses.json';
import waveformsJson from './fixtures/waveforms.json';
import reportsJson from './fixtures/reports.json';

class InMemoryTable<T extends { id: ID }> {
  private items = new Map<ID, T>();

  constructor(initial: T[] = []) {
    initial.forEach((item) => this.items.set(item.id, item));
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }

  getById(id: ID): T | null {
    return this.items.get(id) ?? null;
  }

  upsert(item: T): T {
    this.items.set(item.id, item);
    return item;
  }

  update(id: ID, patch: Partial<T>): T {
    const current = this.items.get(id);
    if (!current) throw new Error(`Not found: ${id}`);
    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    } as T;
    this.items.set(id, updated);
    return updated;
  }

  delete(id: ID): void {
    this.items.delete(id);
  }

  count(): number {
    return this.items.size;
  }
}

export interface MockDatabase {
  customers: InMemoryTable<Customer>;
  users: InMemoryTable<User>;
  materials: InMemoryTable<Material>;
  standards: InMemoryTable<Standard>;
  testTypes: InMemoryTable<TestType>;
  projects: InMemoryTable<Project>;
  specimens: InMemoryTable<Specimen>;
  tests: InMemoryTable<Test>;
  damages: InMemoryTable<DamageFinding>;
  tools: InMemoryTable<Tool>;
  cuttingProcesses: InMemoryTable<CuttingProcess>;
  waveforms: InMemoryTable<WaveformSample>;
  reports: InMemoryTable<Report>;
}

let _database: MockDatabase | null = null;

export const getMockDatabase = (): MockDatabase => {
  if (_database) return _database;

  _database = {
    customers: new InMemoryTable(customersJson as Customer[]),
    users: new InMemoryTable(usersJson as User[]),
    materials: new InMemoryTable(materialsJson as Material[]),
    standards: new InMemoryTable(standardsJson as Standard[]),
    testTypes: new InMemoryTable(testTypesJson as TestType[]),
    projects: new InMemoryTable(projectsJson as Project[]),
    specimens: new InMemoryTable(specimensJson as Specimen[]),
    tests: new InMemoryTable(testsJson as Test[]),
    damages: new InMemoryTable(damagesJson as DamageFinding[]),
    tools: new InMemoryTable(toolsJson as Tool[]),
    cuttingProcesses: new InMemoryTable(cuttingProcessesJson as CuttingProcess[]),
    waveforms: new InMemoryTable(waveformsJson as WaveformSample[]),
    reports: new InMemoryTable(reportsJson as Report[]),
  };

  return _database;
};

export const resetMockDatabase = (): void => {
  _database = null;
};

export { InMemoryTable };
