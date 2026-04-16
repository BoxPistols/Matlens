// Projectジェネレータ

import type { Customer, Project, ProjectStatus, User } from '@/domain/types';
import { createSeededFaker } from './seededFaker';

// ステータス分布を現実的に（完了多め、進行中多め）
const STATUS_WEIGHTS: Record<ProjectStatus, number> = {
  inquiry: 5,
  quoting: 10,
  in_progress: 25,
  reviewing: 10,
  completed: 40,
  archived: 10,
};

const pickWeighted = <T extends string>(
  random: () => number,
  weights: Record<T, number>
): T => {
  const keys = Object.keys(weights) as T[];
  const total = keys.reduce((sum, k) => sum + weights[k], 0);
  let r = random() * total;
  for (const k of keys) {
    r -= weights[k];
    if (r <= 0) return k;
  }
  return keys[keys.length - 1]!;
};

export interface GenerateProjectsInput {
  customers: Customer[];
  users: User[];
  count?: number;
  seed?: number;
}

export const generateProjects = (input: GenerateProjectsInput): Project[] => {
  const { customers, users, count = 150, seed = 20260417 } = input;
  const faker = createSeededFaker(seed);

  const pms = users.filter((u) => u.role === 'pm');
  const engineers = users.filter((u) => u.role === 'engineer');
  if (pms.length === 0 || engineers.length === 0) {
    throw new Error('PM and engineer users are required to generate projects');
  }

  // 過去3年分に分散
  const now = new Date('2026-04-17T00:00:00+09:00').getTime();
  const threeYearsMs = 3 * 365 * 24 * 60 * 60 * 1000;

  const projects: Project[] = [];
  for (let i = 0; i < count; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const started = new Date(now - Math.floor(faker.number.float({ min: 0, max: 1 }) * threeYearsMs));
    const year = started.getFullYear();
    const seq = String(i + 1).padStart(4, '0');
    const code = `IIC-${year}-${seq}`;

    const status = pickWeighted(() => faker.number.float({ min: 0, max: 1 }), STATUS_WEIGHTS);
    const durationDays = faker.number.int({ min: 14, max: 180 });
    const dueAt = new Date(started.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const completedAt =
      status === 'completed' || status === 'archived'
        ? new Date(
            started.getTime() +
              faker.number.int({ min: 7, max: durationDays + 30 }) * 24 * 60 * 60 * 1000
          )
        : null;

    const pm = faker.helpers.arrayElement(pms);
    const leadEngineer = faker.helpers.arrayElement(engineers);
    const industryTagIds = faker.helpers.arrayElements(customer.industryTagIds, {
      min: 1,
      max: customer.industryTagIds.length,
    });

    const titleTemplates = [
      '定期点検に伴う材料調査',
      '疲労き裂発生原因調査',
      '耐食性評価試験',
      '部品破損の原因究明',
      '経年劣化評価',
      '高温特性評価',
      '新材料採用に向けた特性評価',
      '規格適合性確認試験',
    ];
    const title = `${customer.name.split('株式会社')[0]} ${faker.helpers.arrayElement(titleTemplates)}`;

    projects.push({
      id: `prj_${String(i + 1).padStart(4, '0')}`,
      code,
      title,
      customerId: customer.id,
      industryTagIds: industryTagIds.length > 0 ? industryTagIds : customer.industryTagIds.slice(0, 1),
      status,
      startedAt: started.toISOString().slice(0, 10),
      dueAt: dueAt.toISOString().slice(0, 10),
      completedAt: completedAt ? completedAt.toISOString().slice(0, 10) : null,
      specimenCount: 0, // 後でspecimen生成後に更新
      testCount: 0,
      pmId: pm.id,
      leadEngineerId: leadEngineer.id,
      description: null,
      createdAt: started.toISOString(),
      updatedAt: (completedAt ?? started).toISOString(),
      createdBy: pm.id,
      updatedBy: pm.id,
    });
  }

  return projects;
};
