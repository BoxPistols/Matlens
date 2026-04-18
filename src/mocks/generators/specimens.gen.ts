// Specimenジェネレータ

import type { Material, Project, Specimen, SpecimenShape, SpecimenStatus, User } from '@/domain/types';
import { createSeededFaker } from './seededFaker';

const SHAPES: SpecimenShape[] = ['bar', 'plate', 'pipe', 'block'];

export interface GenerateSpecimensInput {
  projects: Project[];
  materials: Material[];
  users: User[];
  perProject?: [number, number];
  seed?: number;
}

const statusForProject = (projectStatus: Project['status'], random: () => number): SpecimenStatus => {
  if (projectStatus === 'inquiry' || projectStatus === 'quoting') return 'received';
  if (projectStatus === 'in_progress') {
    const r = random();
    if (r < 0.2) return 'received';
    if (r < 0.5) return 'prepared';
    if (r < 0.8) return 'testing';
    return 'tested';
  }
  if (projectStatus === 'reviewing') {
    return random() < 0.5 ? 'tested' : 'stored';
  }
  if (projectStatus === 'completed') return 'stored';
  return 'stored';
};

export const generateSpecimens = (input: GenerateSpecimensInput): Specimen[] => {
  const { projects, materials, users, perProject = [3, 8], seed = 20260418 } = input;
  const faker = createSeededFaker(seed);
  const operators = users.filter((u) => u.role === 'operator' || u.role === 'engineer');
  if (operators.length === 0) throw new Error('operator users required');

  const specimens: Specimen[] = [];
  let running = 1;

  for (const project of projects) {
    const count = faker.number.int({ min: perProject[0], max: perProject[1] });
    for (let i = 0; i < count; i++) {
      const material = faker.helpers.arrayElement(materials);
      const shape = faker.helpers.arrayElement(SHAPES);
      const operator = faker.helpers.arrayElement(operators);

      const dim =
        shape === 'bar'
          ? { shape, length: faker.number.int({ min: 50, max: 200 }), diameter: faker.number.int({ min: 6, max: 25 }) }
          : shape === 'plate'
            ? {
                shape,
                length: faker.number.int({ min: 50, max: 200 }),
                width: faker.number.int({ min: 20, max: 80 }),
                thickness: faker.number.int({ min: 2, max: 20 }),
              }
            : shape === 'pipe'
              ? {
                  shape,
                  length: faker.number.int({ min: 80, max: 300 }),
                  diameter: faker.number.int({ min: 20, max: 80 }),
                  thickness: faker.number.int({ min: 2, max: 8 }),
                }
              : {
                  shape,
                  length: faker.number.int({ min: 20, max: 80 }),
                  width: faker.number.int({ min: 20, max: 80 }),
                  thickness: faker.number.int({ min: 20, max: 80 }),
                };

      // 試験片総数は数百件規模になり得るので 5 桁に拡張。
      // 月はプロジェクト開始日から決定論的に導出し、MM-NN の意味を壊さない。
      const seq = String(running).padStart(5, '0');
      const month = String(new Date(project.startedAt).getMonth() + 1).padStart(2, '0');
      const code = `SPC-${month}-${seq}`;

      const status = statusForProject(project.status, () => faker.number.float({ min: 0, max: 1 }));
      const receivedAt = project.startedAt;

      specimens.push({
        id: `spc_${String(running).padStart(5, '0')}`,
        code,
        projectId: project.id,
        materialId: material.id,
        dimensions: dim,
        cutFrom: {
          parentPart: faker.helpers.arrayElement([
            '主配管',
            'タービンブレード',
            '溶接継手部',
            '圧力容器胴体',
            'フランジ部',
            'ボルト',
            null,
          ]),
          location: faker.helpers.arrayElement(['内面側', '外面側', '中央部', '端部', null]),
          direction: faker.helpers.arrayElement(['L', 'T', 'S', null] as const),
        },
        receivedAt,
        location: `棚${faker.helpers.arrayElement(['A', 'B', 'C'])}-${faker.number.int({ min: 1, max: 30 })}`,
        status,
        notes: null,
        createdAt: new Date(receivedAt).toISOString(),
        updatedAt: new Date(receivedAt).toISOString(),
        createdBy: operator.id,
        updatedBy: operator.id,
      });
      running++;
    }
  }

  return specimens;
};
