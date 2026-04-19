#!/usr/bin/env node
// pnpm mocks:generate でモックデータ fixture を JSON に書き出すスクリプト。
// database.ts は JSON を直接 import するので、faker は本番バンドルから外れる。

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { seedCustomers } from '../src/mocks/seeds/customers.seed.ts';
import { seedUsers } from '../src/mocks/seeds/users.seed.ts';
import { seedMaterials } from '../src/mocks/seeds/materials.seed.ts';
import { seedStandards } from '../src/mocks/seeds/standards.seed.ts';
import { seedTestTypes } from '../src/mocks/seeds/testTypes.seed.ts';
import { seedTools } from '../src/mocks/seeds/tools.seed.ts';
import { generateProjects } from '../src/mocks/generators/projects.gen.ts';
import { generateSpecimens } from '../src/mocks/generators/specimens.gen.ts';
import { generateTests } from '../src/mocks/generators/tests.gen.ts';
import { generateDamages } from '../src/mocks/generators/damages.gen.ts';
import { generateCuttingProcesses } from '../src/mocks/generators/cuttingProcesses.gen.ts';
import type { ID } from '../src/domain/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const FIXTURE_DIR = resolve(dirname(__filename), '../src/mocks/fixtures');

const writeJson = (name: string, data: unknown) => {
  const path = resolve(FIXTURE_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  const count = Array.isArray(data) ? data.length : 1;
  console.log(`  ✔ ${name}.json (${count} records)`);
};

const main = () => {
  console.log('Generating mock fixtures...');
  mkdirSync(FIXTURE_DIR, { recursive: true });

  const customers = seedCustomers();
  const users = seedUsers();
  const materials = seedMaterials();
  const standards = seedStandards();
  const testTypes = seedTestTypes();
  const tools = seedTools();

  const rawProjects = generateProjects({ customers, users, count: 150 });
  const specimens = generateSpecimens({
    projects: rawProjects,
    materials,
    users,
    perProject: [3, 8],
  });
  const tests = generateTests({ specimens, testTypes, standards, users, perSpecimen: [1, 5] });
  const damages = generateDamages({ tests, users, count: 200 });
  const { processes: cuttingProcesses, waveforms } = generateCuttingProcesses({
    specimens,
    tools,
    users,
    perSpecimen: [1, 2],
    waveformProbability: 0.2,
  });

  // Project に specimenCount / testCount を集計埋め込み
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
  const projects = rawProjects.map((p) => ({
    ...p,
    specimenCount: specimenCountByProject.get(p.id) ?? 0,
    testCount: testCountByProject.get(p.id) ?? 0,
  }));

  writeJson('customers', customers);
  writeJson('users', users);
  writeJson('materials', materials);
  writeJson('standards', standards);
  writeJson('testTypes', testTypes);
  writeJson('projects', projects);
  writeJson('specimens', specimens);
  writeJson('tests', tests);
  writeJson('damages', damages);
  writeJson('tools', tools);
  writeJson('cuttingProcesses', cuttingProcesses);
  writeJson('waveforms', waveforms);

  console.log('Done.');
};

main();
