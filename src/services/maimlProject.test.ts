import { describe, expect, it } from 'vitest';
import type {
  DamageFinding,
  Project,
  Specimen,
  Test,
} from '@/domain/types';
import {
  defaultProjectMaimlFilename,
  defaultTestSetMaimlFilename,
  serializeProjectToMaiml,
  serializeTestSetToMaiml,
  type ProjectBundle,
  type TestSetBundle,
} from './maimlProject';

const audit = {
  createdAt: '2026-04-17T10:00:00+09:00',
  updatedAt: '2026-04-17T10:00:00+09:00',
  createdBy: 'user-1',
  updatedBy: 'user-1',
};

const project: Project = {
  id: 'prj-1',
  code: 'IIC-2026-0001',
  title: 'Ti-6Al-4V 疲労試験',
  customerId: 'cust-1',
  industryTagIds: ['aero'],
  status: 'in_progress',
  startedAt: '2026-04-01',
  dueAt: '2026-05-31',
  completedAt: null,
  specimenCount: 1,
  testCount: 1,
  pmId: 'user-1',
  leadEngineerId: 'user-2',
  description: 'ブレード根元部 <重要>',
  ...audit,
};

const specimen: Specimen = {
  id: 'spec-1',
  code: 'SP-001',
  projectId: 'prj-1',
  materialId: 'mat-1',
  dimensions: { shape: 'bar', diameter: 10 },
  cutFrom: { parentPart: null, location: null, direction: 'L' },
  receivedAt: '2026-04-02',
  location: 'R1-A3',
  status: 'tested',
  notes: null,
  ...audit,
};

const test: Test = {
  id: 'test-1',
  specimenId: 'spec-1',
  testTypeId: 'tt-fatigue',
  condition: {
    temperature: { value: 25, unit: 'C' },
    atmosphere: 'air',
    loadRate: 10,
  },
  standardIds: ['astm-e466'],
  performedAt: '2026-04-10T10:00:00+09:00',
  operatorId: 'user-2',
  equipmentId: 'eq-1',
  status: 'completed',
  resultMetrics: [
    { key: 'cycles_to_failure', label: '破断繰返し数', value: 12345, unit: 'cycle', uncertainty: 500 },
  ],
  rawDataRefs: [],
  observations: [],
  ...audit,
};

const damage: DamageFinding = {
  id: 'dmg-1',
  reportId: 'rep-1',
  testId: 'test-1',
  type: 'fatigue',
  location: 'fillet R',
  rootCauseHypothesis: '表面粗さ起因のき裂進展',
  confidenceLevel: 'medium',
  images: [],
  similarCaseIds: [],
  tags: ['fillet'],
  ...audit,
};

const bundle: ProjectBundle = { project, specimens: [specimen], tests: [test], damages: [damage] };

describe('serializeProjectToMaiml', () => {
  it('produces a well-formed MaiML XML document', () => {
    const xml = serializeProjectToMaiml(bundle, {
      generatedAt: new Date('2026-04-20T00:00:00.000Z'),
    });
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<maiml version="1.0">');
    expect(xml.trim().endsWith('</maiml>')).toBe(true);
  });

  it('emits header metadata with project code', () => {
    const xml = serializeProjectToMaiml(bundle, {
      generatedAt: new Date('2026-04-20T00:00:00.000Z'),
      source: 'vitest',
    });
    expect(xml).toContain('<property key="generatedAt">2026-04-20T00:00:00.000Z</property>');
    expect(xml).toContain('<property key="source">vitest</property>');
    expect(xml).toContain('<property key="documentKind">project-bundle</property>');
    expect(xml).toContain('<property key="projectCode">IIC-2026-0001</property>');
  });

  it('emits project block with escaped description', () => {
    const xml = serializeProjectToMaiml(bundle);
    expect(xml).toContain('<project id="prj-1">');
    expect(xml).toContain('<property key="title">Ti-6Al-4V 疲労試験</property>');
    expect(xml).toContain('ブレード根元部 &lt;重要&gt;');
  });

  it('emits specimen, test, damage blocks with counts', () => {
    const xml = serializeProjectToMaiml(bundle);
    expect(xml).toContain('<specimens count="1">');
    expect(xml).toContain('<specimen id="spec-1">');
    expect(xml).toContain('<tests count="1">');
    expect(xml).toContain('<test id="test-1" specimenRef="spec-1">');
    expect(xml).toContain('<damages count="1">');
    expect(xml).toContain('<damage id="dmg-1" testRef="test-1">');
  });

  it('emits result metrics with uncertainty', () => {
    const xml = serializeProjectToMaiml(bundle);
    expect(xml).toContain('<result key="cycles_to_failure" label="破断繰返し数" unit="cycle">');
    expect(xml).toContain('<content>12345</content>');
    expect(xml).toContain('<property key="uncertainty">500</property>');
  });

  it('handles empty collections', () => {
    const xml = serializeProjectToMaiml({ project, specimens: [], tests: [], damages: [] });
    expect(xml).toContain('<specimens count="0">');
    expect(xml).toContain('<tests count="0">');
    expect(xml).toContain('<damages count="0">');
  });
});

describe('defaultProjectMaimlFilename', () => {
  it('uses the project code as a prefix and .maiml extension', () => {
    const name = defaultProjectMaimlFilename(project);
    expect(name).toMatch(/^IIC-2026-0001_\d{4}-\d{2}-\d{2}\.maiml$/);
  });
});

describe('serializeTestSetToMaiml', () => {
  const setBundle: TestSetBundle = {
    label: 'matrix-cell SUS304 引張',
    specimens: [specimen],
    tests: [test],
    damages: [damage],
  };

  it('produces a test-set document without project block', () => {
    const xml = serializeTestSetToMaiml(setBundle, {
      generatedAt: new Date('2026-05-02T00:00:00.000Z'),
    });
    expect(xml).toContain('<property key="documentKind">test-set</property>');
    expect(xml).toContain('<property key="label">matrix-cell SUS304 引張</property>');
    expect(xml).toContain('<property key="testCount">1</property>');
    // Project block must NOT appear
    expect(xml).not.toContain('<project ');
    // Same blocks as project bundle
    expect(xml).toContain('<specimens count="1">');
    expect(xml).toContain('<test id="test-1" specimenRef="spec-1">');
    expect(xml).toContain('<damages count="1">');
  });

  it('handles single test with no damages or specimens', () => {
    const xml = serializeTestSetToMaiml({
      label: 'single test',
      specimens: [],
      tests: [test],
      damages: [],
    });
    expect(xml).toContain('<specimens count="0">');
    expect(xml).toContain('<tests count="1">');
    expect(xml).toContain('<damages count="0">');
  });
});

describe('defaultTestSetMaimlFilename', () => {
  it('slugifies the label and adds the date and extension', () => {
    const name = defaultTestSetMaimlFilename('SUS304 × 引張');
    expect(name).toMatch(/^tests_SUS304_\d{4}-\d{2}-\d{2}\.maiml$/);
  });

  it('keeps inner ascii-safe segments separated by single dashes', () => {
    const name = defaultTestSetMaimlFilename('part-A_B (test)');
    expect(name).toMatch(/^tests_part-A_B-test_\d{4}-\d{2}-\d{2}\.maiml$/);
  });

  it('falls back to test-set when label has no ascii-safe chars', () => {
    const name = defaultTestSetMaimlFilename('！？');
    expect(name).toMatch(/^tests_test-set_\d{4}-\d{2}-\d{2}\.maiml$/);
  });
});
