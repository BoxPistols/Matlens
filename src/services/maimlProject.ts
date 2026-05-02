// 案件バンドル / 試験集合を MaiML (JIS K 0200:2024) XML で書き出すシリアライザ。
//
// Material 単位の serializer は `src/services/maiml.ts` 側にあり、こちらは
// 「案件 + 試験 + 損傷所見」のような複合バンドル向けの別 schema。
//
// 出力ドキュメントは以下のブロックで構成される:
//   <maiml>
//     <header> ... </header>
//     <data>
//       <project>     ... </project>     -- 案件バンドル時のみ
//       <specimens>   ... </specimens>
//       <tests>       ... </tests>
//       <damages>     ... </damages>
//     </data>
//   </maiml>
//
// 試験集合 (TestSetBundle) では <project> ブロックを省略する。これにより
// 「マトリクスのセルから抜き出した試験群」のように案件をまたぐ集合も
// 共通の reader で読める。

import type { DamageFinding, Project, Specimen, Test } from '@/domain/types';

// ---------------------------------------------------------------------------
// 内部ヘルパ
// ---------------------------------------------------------------------------

function escapeXml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const indent = (depth: number) => '  '.repeat(depth);

function propertyLine(
  depth: number,
  key: string,
  value: string | number | null | undefined,
): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `${indent(depth)}<property key="${escapeXml(key)}">${escapeXml(text)}</property>`;
}

function writeProjectBlock(lines: string[], project: Project): void {
  lines.push(`${indent(2)}<project id="${escapeXml(project.id)}">`);
  lines.push(propertyLine(3, 'code', project.code));
  lines.push(propertyLine(3, 'title', project.title));
  lines.push(propertyLine(3, 'customerId', project.customerId));
  lines.push(propertyLine(3, 'status', project.status));
  lines.push(propertyLine(3, 'startedAt', project.startedAt));
  lines.push(propertyLine(3, 'dueAt', project.dueAt));
  lines.push(propertyLine(3, 'completedAt', project.completedAt));
  lines.push(propertyLine(3, 'pmId', project.pmId));
  lines.push(propertyLine(3, 'leadEngineerId', project.leadEngineerId));
  if (project.description) lines.push(propertyLine(3, 'description', project.description));
  lines.push(`${indent(2)}</project>`);
}

function writeSpecimensBlock(lines: string[], specimens: Specimen[]): void {
  lines.push(`${indent(2)}<specimens count="${specimens.length}">`);
  for (const s of specimens) {
    lines.push(`${indent(3)}<specimen id="${escapeXml(s.id)}">`);
    lines.push(propertyLine(4, 'code', s.code));
    lines.push(propertyLine(4, 'materialId', s.materialId));
    lines.push(propertyLine(4, 'shape', s.dimensions.shape));
    lines.push(propertyLine(4, 'location', s.location));
    lines.push(propertyLine(4, 'status', s.status));
    lines.push(propertyLine(4, 'receivedAt', s.receivedAt));
    lines.push(`${indent(3)}</specimen>`);
  }
  lines.push(`${indent(2)}</specimens>`);
}

function writeTestsBlock(lines: string[], tests: Test[]): void {
  lines.push(`${indent(2)}<tests count="${tests.length}">`);
  for (const t of tests) {
    lines.push(
      `${indent(3)}<test id="${escapeXml(t.id)}" specimenRef="${escapeXml(t.specimenId)}">`,
    );
    lines.push(propertyLine(4, 'testTypeId', t.testTypeId));
    lines.push(propertyLine(4, 'status', t.status));
    lines.push(propertyLine(4, 'performedAt', t.performedAt));
    lines.push(propertyLine(4, 'temperature', t.condition.temperature.value));
    lines.push(propertyLine(4, 'temperatureUnit', t.condition.temperature.unit));
    lines.push(propertyLine(4, 'atmosphere', t.condition.atmosphere));
    if (t.condition.loadRate !== undefined) {
      lines.push(propertyLine(4, 'loadRate', t.condition.loadRate));
    }
    for (const rm of t.resultMetrics) {
      lines.push(
        `${indent(4)}<result key="${escapeXml(rm.key)}" label="${escapeXml(rm.label)}" unit="${escapeXml(rm.unit)}">`,
      );
      lines.push(`${indent(5)}<content>${escapeXml(rm.value)}</content>`);
      if (rm.uncertainty !== undefined) {
        lines.push(propertyLine(5, 'uncertainty', rm.uncertainty));
      }
      lines.push(`${indent(4)}</result>`);
    }
    lines.push(`${indent(3)}</test>`);
  }
  lines.push(`${indent(2)}</tests>`);
}

function writeDamagesBlock(lines: string[], damages: DamageFinding[]): void {
  lines.push(`${indent(2)}<damages count="${damages.length}">`);
  for (const d of damages) {
    lines.push(
      `${indent(3)}<damage id="${escapeXml(d.id)}" testRef="${escapeXml(d.testId ?? '')}">`,
    );
    lines.push(propertyLine(4, 'type', d.type));
    lines.push(propertyLine(4, 'location', d.location));
    lines.push(propertyLine(4, 'confidenceLevel', d.confidenceLevel));
    lines.push(propertyLine(4, 'rootCauseHypothesis', d.rootCauseHypothesis));
    lines.push(`${indent(3)}</damage>`);
  }
  lines.push(`${indent(2)}</damages>`);
}

function writeHeader(
  lines: string[],
  documentKind: string,
  generatedAt: string,
  source: string,
  extraProperties: Record<string, string | number> = {},
): void {
  lines.push(`${indent(1)}<header>`);
  lines.push(propertyLine(2, 'generatedAt', generatedAt));
  lines.push(propertyLine(2, 'source', source));
  lines.push(propertyLine(2, 'documentKind', documentKind));
  for (const [key, value] of Object.entries(extraProperties)) {
    lines.push(propertyLine(2, key, value));
  }
  lines.push(`${indent(1)}</header>`);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ProjectBundle {
  project: Project;
  specimens: Specimen[];
  tests: Test[];
  damages: DamageFinding[];
}

export interface TestSetBundle {
  /** ドキュメント識別用のラベル。例: 「マトリクス選択: SUS304 × 引張」 */
  label: string;
  specimens: Specimen[];
  tests: Test[];
  damages: DamageFinding[];
}

export interface MaimlSerializeOptions {
  generatedAt?: Date;
  source?: string;
}

export function serializeProjectToMaiml(
  bundle: ProjectBundle,
  options: MaimlSerializeOptions = {},
): string {
  const generatedAt = (options.generatedAt ?? new Date()).toISOString();
  const source = options.source ?? 'matlens';
  const { project, specimens, tests, damages } = bundle;

  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<maiml version="1.0">');
  writeHeader(lines, 'project-bundle', generatedAt, source, {
    projectCode: project.code,
  });
  lines.push(`${indent(1)}<data>`);
  writeProjectBlock(lines, project);
  writeSpecimensBlock(lines, specimens);
  writeTestsBlock(lines, tests);
  writeDamagesBlock(lines, damages);
  lines.push(`${indent(1)}</data>`);
  lines.push('</maiml>');
  return lines.join('\n') + '\n';
}

/**
 * 試験集合（特定セル抽出・任意の試験 N 件）を MaiML 形式で書き出す。
 * <project> ブロックは持たず、ドキュメント識別は header.label で行う。
 */
export function serializeTestSetToMaiml(
  bundle: TestSetBundle,
  options: MaimlSerializeOptions = {},
): string {
  const generatedAt = (options.generatedAt ?? new Date()).toISOString();
  const source = options.source ?? 'matlens';
  const { label, specimens, tests, damages } = bundle;

  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<maiml version="1.0">');
  writeHeader(lines, 'test-set', generatedAt, source, {
    label,
    testCount: tests.length,
  });
  lines.push(`${indent(1)}<data>`);
  writeSpecimensBlock(lines, specimens);
  writeTestsBlock(lines, tests);
  writeDamagesBlock(lines, damages);
  lines.push(`${indent(1)}</data>`);
  lines.push('</maiml>');
  return lines.join('\n') + '\n';
}

export function defaultProjectMaimlFilename(project: Project): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${project.code}_${date}.maiml`;
}

/**
 * 試験集合用のファイル名生成。`tests_<slug>_<date>.maiml`。
 * slug は label をアスキーセーフ + 30 字程度に縮める。
 */
export function defaultTestSetMaimlFilename(label: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug =
    label
      .normalize('NFKC')
      .replace(/[^A-Za-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30) || 'test-set';
  return `tests_${slug}_${date}.maiml`;
}
