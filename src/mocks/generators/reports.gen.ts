// レポート generator。完了した案件に紐づけて報告書を生成する。
// 1 案件あたり 1〜3 レポート（試験報告書・損傷解析・サマリのいずれか）。

import type {
  DamageFinding,
  Project,
  Report,
  ReportKind,
  ReportStatus,
  Specimen,
  Test,
  User,
} from '@/domain/types';
import { createSeededFaker } from './seededFaker';

export interface GenerateReportsInput {
  projects: Project[];
  specimens: Specimen[];
  tests: Test[];
  damages: DamageFinding[];
  users: User[];
  perProject?: [number, number];
  seed?: number;
}

const KIND_TEMPLATES: Record<ReportKind, { title: string; titleEn: string }> = {
  test_report: {
    title: '試験報告書',
    titleEn: 'Test Report',
  },
  damage_analysis: {
    title: '損傷解析報告書',
    titleEn: 'Damage Analysis Report',
  },
  material_certification: {
    title: '材料証明書',
    titleEn: 'Material Certification',
  },
  inspection: {
    title: '検査成績書',
    titleEn: 'Inspection Certificate',
  },
  summary: {
    title: 'サマリレポート',
    titleEn: 'Summary Report',
  },
};

const STATUS_WEIGHTS: Record<ReportStatus, number> = {
  draft: 10,
  review: 8,
  approved: 15,
  issued: 45,
  archived: 22,
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

const renderBody = (
  project: Project,
  tests: Test[],
  damages: DamageFinding[],
  kind: ReportKind
): string => {
  const sections: string[] = [];
  sections.push(`# ${KIND_TEMPLATES[kind].title}`);
  sections.push('');
  sections.push(`## 案件情報`);
  sections.push('');
  sections.push(`| 項目 | 内容 |`);
  sections.push(`| --- | --- |`);
  sections.push(`| 案件コード | ${project.code} |`);
  sections.push(`| 案件名 | ${project.title} |`);
  sections.push(`| 開始日 | ${project.startedAt} |`);
  if (project.dueAt) sections.push(`| 納期 | ${project.dueAt} |`);
  sections.push('');

  if (tests.length > 0) {
    sections.push(`## 実施試験サマリ`);
    sections.push('');
    sections.push(`対象試験件数: **${tests.length}** 件`);
    sections.push('');
    sections.push(`| 試験 ID | 試験種別 | ステータス | 実施日 | 温度 | 雰囲気 |`);
    sections.push(`| --- | --- | --- | --- | --- | --- |`);
    for (const t of tests.slice(0, 8)) {
      const unit = t.condition.temperature.unit === 'C' ? '℃' : 'K';
      sections.push(
        `| \`${t.id}\` | ${t.testTypeId} | ${t.status} | ${t.performedAt.slice(0, 10)} | ${t.condition.temperature.value}${unit} | ${t.condition.atmosphere} |`
      );
    }
    if (tests.length > 8) {
      sections.push(`| ... | ... | ... | ... | ... | ... |`);
    }
    sections.push('');
  }

  if (kind === 'damage_analysis' && damages.length > 0) {
    sections.push(`## 損傷所見`);
    sections.push('');
    for (const d of damages.slice(0, 5)) {
      sections.push(`### ${d.type} — ${d.location}`);
      sections.push('');
      sections.push(`- 確信度: **${d.confidenceLevel}**`);
      sections.push(`- 原因仮説: ${d.rootCauseHypothesis}`);
      sections.push('');
    }
  }

  sections.push(`## 考察`);
  sections.push('');
  if (kind === 'damage_analysis') {
    sections.push(
      '本損傷の進展メカニズムは、検出された所見の型と位置関係、および試験条件から推定される。'
    );
    sections.push(
      '同材料 / 類似使用環境の過去事例との比較により、再発防止の運用変更を提案する。'
    );
  } else if (kind === 'test_report') {
    sections.push(
      '本試験結果は依頼仕様を満たしており、試験条件・測定値の妥当性を確認した。'
    );
  } else {
    sections.push('本レポートは関連する試験・所見を集約した中間サマリである。');
  }
  sections.push('');

  sections.push(`## 結論`);
  sections.push('');
  sections.push(
    kind === 'damage_analysis'
      ? '- 主要因候補: 応力集中 × 環境腐食の複合 × 材料ばらつき'
      : kind === 'test_report'
        ? '- 試験結果は規格要求値を満足している'
        : '- 本案件の一連の試験は完了し、後続レポートへ引き継ぐ'
  );
  sections.push('');

  return sections.join('\n');
};

const SUMMARY_TEMPLATES: Record<ReportKind, (projectTitle: string) => string> = {
  test_report: (t) => `${t} に関する一連の機械試験結果をまとめた標準試験報告書。`,
  damage_analysis: (t) => `${t} における損傷所見の原因分析と再発防止策の提言。`,
  material_certification: (t) => `${t} の使用材料について規格適合性を証明する証明書。`,
  inspection: (t) => `${t} の各工程における検査成績を取りまとめた成績書。`,
  summary: (t) => `${t} の進捗・主要所見・次アクションを要約したサマリレポート。`,
};

export const generateReports = (input: GenerateReportsInput): Report[] => {
  const {
    projects,
    specimens,
    tests,
    damages,
    users,
    perProject = [1, 3],
    seed = 20260420,
  } = input;
  const faker = createSeededFaker(seed);
  const specimensByProject = new Map<string, string[]>();
  for (const s of specimens) {
    const bucket = specimensByProject.get(s.projectId) ?? [];
    bucket.push(s.id);
    specimensByProject.set(s.projectId, bucket);
  }
  const specimenProject = new Map<string, string>(specimens.map((s) => [s.id, s.projectId]));
  const testsByProject = new Map<string, Test[]>();
  for (const t of tests) {
    const projectId = specimenProject.get(t.specimenId);
    if (!projectId) continue;
    const bucket = testsByProject.get(projectId) ?? [];
    bucket.push(t);
    testsByProject.set(projectId, bucket);
  }
  const damagesByProject = new Map<string, DamageFinding[]>();
  const testProject = new Map<string, string>();
  for (const t of tests) {
    const projectId = specimenProject.get(t.specimenId);
    if (projectId) testProject.set(t.id, projectId);
  }
  for (const d of damages) {
    if (!d.testId) continue;
    const projectId = testProject.get(d.testId);
    if (!projectId) continue;
    const bucket = damagesByProject.get(projectId) ?? [];
    bucket.push(d);
    damagesByProject.set(projectId, bucket);
  }

  const authors = users.filter((u) => u.role === 'engineer' || u.role === 'pm');
  const reviewers = users.filter((u) => u.role === 'pm' || u.role === 'admin');
  if (authors.length === 0) throw new Error('engineer or pm users required');

  // 完了・進行系の案件を対象に、進捗に応じて数を揺らす
  const eligibleProjects = projects.filter(
    (p) => p.status === 'completed' || p.status === 'archived' || p.status === 'reviewing'
  );

  const reports: Report[] = [];
  let running = 1;
  const seqByYear = new Map<number, number>();

  for (const project of eligibleProjects) {
    const count = faker.number.int({ min: perProject[0], max: perProject[1] });
    const projectTests = testsByProject.get(project.id) ?? [];
    const projectDamages = damagesByProject.get(project.id) ?? [];
    const projectSpecimens = specimensByProject.get(project.id) ?? [];

    for (let i = 0; i < count; i++) {
      const kind: ReportKind = faker.helpers.arrayElement([
        'test_report',
        'test_report',
        'test_report',
        'damage_analysis',
        'summary',
        'inspection',
      ]);
      const status = pickWeighted(() => faker.number.float({ min: 0, max: 1 }), STATUS_WEIGHTS);
      const author = faker.helpers.arrayElement(authors);
      const reviewer =
        status === 'draft'
          ? null
          : reviewers.length > 0
            ? faker.helpers.arrayElement(reviewers)
            : null;
      const approver =
        status === 'approved' || status === 'issued' || status === 'archived'
          ? reviewer
          : null;

      const issuedYear = new Date(project.startedAt).getFullYear();
      const seq = (seqByYear.get(issuedYear) ?? 0) + 1;
      seqByYear.set(issuedYear, seq);
      const code = `RPT-${issuedYear}-${String(seq).padStart(4, '0')}`;

      const issuedAt =
        status === 'issued' || status === 'archived' || status === 'approved'
          ? (project.completedAt ?? project.dueAt ?? project.startedAt)
          : null;

      const relatedTests = kind === 'damage_analysis'
        ? projectTests.filter((t) => projectDamages.some((d) => d.testId === t.id))
        : projectTests.slice(0, 20);

      const body = renderBody(project, relatedTests, projectDamages, kind);
      const summary = SUMMARY_TEMPLATES[kind](project.title);

      reports.push({
        id: `rpt_${String(running).padStart(6, '0')}`,
        code,
        title: `${KIND_TEMPLATES[kind].title}: ${project.title}`,
        titleEn: `${KIND_TEMPLATES[kind].titleEn}: ${project.code}`,
        kind,
        status,
        projectId: project.id,
        testIds: relatedTests.slice(0, 10).map((t) => t.id),
        specimenIds: projectSpecimens.slice(0, 10),
        damageIds: kind === 'damage_analysis' ? projectDamages.slice(0, 5).map((d) => d.id) : [],
        issuedAt,
        authorId: author.id,
        reviewerId: reviewer?.id ?? null,
        approverId: approver?.id ?? null,
        body,
        summary,
        tags: Array.from(new Set([kind, project.status])),
        createdAt: project.createdAt,
        updatedAt: issuedAt ? `${issuedAt}T15:00:00+09:00` : project.updatedAt,
        createdBy: author.id,
        updatedBy: (approver ?? reviewer ?? author).id,
      });
      running++;
    }
  }

  return reports;
};
