// 損傷所見ジェネレータ

import type { DamageFinding, DamageType, Test, User } from '@/domain/types';
import { createSeededFaker } from './seededFaker';

const DAMAGE_TYPES: DamageType[] = [
  'fatigue',
  'creep',
  'corrosion',
  'stress_corrosion',
  'brittle_fracture',
  'ductile_fracture',
  'wear',
  'thermal',
];

const ROOT_CAUSE_BY_TYPE: Record<DamageType, string[]> = {
  fatigue: [
    '繰返し荷重により粒内滑りが蓄積し、表面起点き裂が進展した可能性',
    '応力集中部からの疲労き裂発生と考えられる',
  ],
  creep: ['高温長時間保持により粒界空洞が合体し、クリープ破断に至った', '粒界における第二相析出が起点'],
  corrosion: ['塩化物環境下で局部腐食（孔食）が進行したと推定される', '不動態皮膜の破れと再不動態化遅延'],
  stress_corrosion: ['引張応力と腐食環境の同時作用により粒界型SCCが進展', '粒界炭化物析出とCl⁻の複合作用'],
  brittle_fracture: ['低温脆性遷移以下での衝撃負荷により脆性破壊', 'き裂先端部での劈開破面観察'],
  ductile_fracture: ['過負荷による延性破壊、ディンプル破面が顕著'],
  wear: ['摺動界面での凝着・アブレシブ摩耗の進展'],
  thermal: ['熱サイクルに伴う熱疲労き裂の発生'],
};

const LOCATION_SAMPLES = ['フランジ根元', '溶接止端部', 'ねじ部根元', '肉厚変化部', '内面全周', '外面局所'];

export interface GenerateDamagesInput {
  tests: Test[];
  users: User[];
  count?: number;
  seed?: number;
}

export const generateDamages = (input: GenerateDamagesInput): DamageFinding[] => {
  const { tests, users, count = 200, seed = 20260420 } = input;
  const faker = createSeededFaker(seed);
  const engineers = users.filter((u) => u.role === 'engineer');
  if (engineers.length === 0) throw new Error('engineer users required');

  const completedTests = tests.filter((t) => t.status === 'completed');
  if (completedTests.length === 0) return [];

  const damages: DamageFinding[] = [];
  const target = Math.min(count, completedTests.length);

  for (let i = 0; i < target; i++) {
    const test = completedTests[i % completedTests.length]!;
    const type = faker.helpers.arrayElement(DAMAGE_TYPES);
    const engineer = faker.helpers.arrayElement(engineers);
    const confidenceLevel = faker.helpers.arrayElement(['low', 'medium', 'high'] as const);

    damages.push({
      id: `dmg_${String(i + 1).padStart(5, '0')}`,
      reportId: `rpt_${test.id}`,
      testId: test.id,
      type,
      location: faker.helpers.arrayElement(LOCATION_SAMPLES),
      rootCauseHypothesis: faker.helpers.arrayElement(ROOT_CAUSE_BY_TYPE[type]),
      confidenceLevel,
      images: [],
      similarCaseIds: [],
      tags: [type, confidenceLevel],
      createdAt: test.performedAt,
      updatedAt: test.performedAt,
      createdBy: engineer.id,
      updatedBy: engineer.id,
    });
  }

  return damages;
};
