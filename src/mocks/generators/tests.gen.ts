// Testジェネレータ

import type { Specimen, Standard, Test, TestType, User } from '@/domain/types';
import { createSeededFaker } from './seededFaker';

export interface GenerateTestsInput {
  specimens: Specimen[];
  testTypes: TestType[];
  standards: Standard[];
  users: User[];
  perSpecimen?: [number, number];
  seed?: number;
}

const atmospheresByCategory: Record<TestType['category'], Test['condition']['atmosphere'][]> = {
  mechanical: ['air', 'inert'],
  chemical: ['air'],
  metallographic: ['air'],
  thermal: ['air', 'inert', 'vacuum'],
  corrosion: ['air', 'corrosive'],
  non_destructive: ['air'],
  environmental: ['air'],
};

const temperatureRangeByCategory: Record<TestType['category'], [number, number]> = {
  mechanical: [-196, 600],
  chemical: [20, 30],
  metallographic: [20, 30],
  thermal: [300, 1000],
  corrosion: [20, 80],
  non_destructive: [20, 30],
  environmental: [-40, 85],
};

export const generateTests = (input: GenerateTestsInput): Test[] => {
  const { specimens, testTypes, standards, users, perSpecimen = [1, 5], seed = 20260419 } = input;
  const faker = createSeededFaker(seed);
  const operators = users.filter((u) => u.role === 'operator' || u.role === 'engineer');
  if (operators.length === 0) throw new Error('operator users required');

  const tests: Test[] = [];
  let running = 1;

  for (const specimen of specimens) {
    const count = faker.number.int({ min: perSpecimen[0], max: perSpecimen[1] });
    const baseTime = new Date(specimen.receivedAt + 'T10:00:00+09:00').getTime();

    for (let i = 0; i < count; i++) {
      const testType = faker.helpers.arrayElement(testTypes);
      const operator = faker.helpers.arrayElement(operators);
      const [tMin, tMax] = temperatureRangeByCategory[testType.category];
      const atmospheres = atmospheresByCategory[testType.category];
      const atmosphere = faker.helpers.arrayElement(atmospheres);

      const performedOffsetDays = faker.number.int({ min: 1, max: 60 });
      const performedAt = new Date(
        baseTime + performedOffsetDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const status: Test['status'] =
        specimen.status === 'stored' || specimen.status === 'tested'
          ? 'completed'
          : specimen.status === 'testing'
            ? faker.helpers.arrayElement<Test['status']>(['running', 'completed'])
            : 'scheduled';

      const applicableStandards = standards.filter((s) =>
        s.relatedTestTypeIds.includes(testType.id)
      );
      const standardIds =
        applicableStandards.length > 0
          ? [faker.helpers.arrayElement(applicableStandards).id]
          : testType.defaultStandardIds.slice(0, 1);

      const resultMetrics =
        status === 'completed'
          ? generateMetricsForCategory(testType.category, faker)
          : [];

      tests.push({
        id: `tst_${String(running).padStart(6, '0')}`,
        specimenId: specimen.id,
        testTypeId: testType.id,
        condition: {
          temperature: {
            value: faker.number.int({ min: tMin, max: tMax }),
            unit: 'C',
          },
          atmosphere,
          loadRate: testType.category === 'mechanical' ? faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }) : undefined,
          frequency: testType.id === 'tt_fatigue' ? faker.number.int({ min: 5, max: 50 }) : undefined,
          duration: testType.id === 'tt_creep' ? faker.number.int({ min: 1000, max: 100000 }) : undefined,
          cycles: testType.id === 'tt_fatigue' ? faker.number.int({ min: 10000, max: 1_000_000 }) : undefined,
        },
        standardIds,
        performedAt,
        operatorId: operator.id,
        equipmentId: null,
        status,
        resultMetrics,
        rawDataRefs: [],
        observations: [],
        createdAt: performedAt,
        updatedAt: performedAt,
        createdBy: operator.id,
        updatedBy: operator.id,
      });
      running++;
    }
  }

  return tests;
};

const generateMetricsForCategory = (
  category: TestType['category'],
  faker: ReturnType<typeof createSeededFaker>
): Test['resultMetrics'] => {
  switch (category) {
    case 'mechanical':
      return [
        {
          key: 'yield_strength',
          label: '降伏強さ',
          value: faker.number.float({ min: 200, max: 1200, fractionDigits: 1 }),
          unit: 'MPa',
        },
        {
          key: 'tensile_strength',
          label: '引張強さ',
          value: faker.number.float({ min: 400, max: 1400, fractionDigits: 1 }),
          unit: 'MPa',
        },
        {
          key: 'elongation',
          label: '伸び',
          value: faker.number.float({ min: 5, max: 40, fractionDigits: 1 }),
          unit: '%',
        },
      ];
    case 'thermal':
      return [
        {
          key: 'rupture_time',
          label: '破断時間',
          value: faker.number.int({ min: 100, max: 100000 }),
          unit: 'h',
        },
      ];
    case 'corrosion':
      return [
        {
          key: 'corrosion_rate',
          label: '腐食速度',
          value: faker.number.float({ min: 0.01, max: 5, fractionDigits: 3 }),
          unit: 'mm/y',
        },
      ];
    default:
      return [];
  }
};
