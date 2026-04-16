// メモリ内データベース
// Seeds + faker ジェネレータ（seed固定）で決定論的にデータを生成する。

import type {
  Customer,
  DamageFinding,
  ID,
  Material,
  Project,
  Specimen,
  Standard,
  Test,
  TestType,
  User,
} from '@/domain/types';
import { seedCustomers } from './seeds/customers.seed';
import { seedMaterials } from './seeds/materials.seed';
import { seedStandards } from './seeds/standards.seed';
import { seedTestTypes } from './seeds/testTypes.seed';
import { seedUsers } from './seeds/users.seed';
import { generateProjects } from './generators/projects.gen';
import { generateSpecimens } from './generators/specimens.gen';
import { generateTests } from './generators/tests.gen';
import { generateDamages } from './generators/damages.gen';

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
}

let _database: MockDatabase | null = null;

export const getMockDatabase = (): MockDatabase => {
  if (_database) return _database;

  const customers = seedCustomers();
  const users = seedUsers();
  const materials = seedMaterials();
  const standards = seedStandards();
  const testTypes = seedTestTypes();

  const projects = generateProjects({ customers, users, count: 150 });
  const specimens = generateSpecimens({ projects, materials, users, perProject: [3, 8] });
  const tests = generateTests({ specimens, testTypes, standards, users, perSpecimen: [1, 5] });
  const damages = generateDamages({ tests, users, count: 200 });

  // Project集計（specimen/test件数）
  const specimenCountByProject = new Map<ID, number>();
  specimens.forEach((s) => {
    specimenCountByProject.set(s.projectId, (specimenCountByProject.get(s.projectId) ?? 0) + 1);
  });
  const testCountByProject = new Map<ID, number>();
  const specimenById = new Map(specimens.map((s) => [s.id, s]));
  tests.forEach((t) => {
    const spec = specimenById.get(t.specimenId);
    if (spec) {
      testCountByProject.set(spec.projectId, (testCountByProject.get(spec.projectId) ?? 0) + 1);
    }
  });
  const enrichedProjects = projects.map((p) => ({
    ...p,
    specimenCount: specimenCountByProject.get(p.id) ?? 0,
    testCount: testCountByProject.get(p.id) ?? 0,
  }));

  _database = {
    customers: new InMemoryTable(customers),
    users: new InMemoryTable(users),
    materials: new InMemoryTable(materials),
    standards: new InMemoryTable(standards),
    testTypes: new InMemoryTable(testTypes),
    projects: new InMemoryTable(enrichedProjects),
    specimens: new InMemoryTable(specimens),
    tests: new InMemoryTable(tests),
    damages: new InMemoryTable(damages),
  };

  return _database;
};

export const resetMockDatabase = (): void => {
  _database = null;
};

export { InMemoryTable };
