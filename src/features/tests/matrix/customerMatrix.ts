// 顧客 × 試験種別のマトリクスセル集計。
// Test.specimenId → Specimen.projectId → Project.customerId の 2 段階逆引きで
// (customerId, testTypeId) ペアのカウントを出す。

import type { MatrixCell } from '@/infra/repositories/interfaces';
import type { Project, Specimen, Test } from '@/domain/types';

export const computeCustomerTestTypeCells = (input: {
  tests: Test[];
  specimens: Specimen[];
  projects: Project[];
}): MatrixCell[] => {
  const { tests, specimens, projects } = input;

  const specimenById = new Map<string, Specimen>();
  for (const s of specimens) specimenById.set(s.id, s);

  const projectById = new Map<string, Project>();
  for (const p of projects) projectById.set(p.id, p);

  // (customerId, testTypeId) ごとの集計
  type CellAgg = {
    customerId: string;
    testTypeId: string;
    count: number;
    latestPerformedAt: string | null;
  };
  const cellMap = new Map<string, CellAgg>();

  for (const t of tests) {
    if (t.status !== 'completed') continue;
    const spec = specimenById.get(t.specimenId);
    if (!spec) continue;
    const proj = projectById.get(spec.projectId);
    if (!proj) continue;

    const key = `${proj.customerId}__${t.testTypeId}`;
    const existing = cellMap.get(key) ?? {
      customerId: proj.customerId,
      testTypeId: t.testTypeId,
      count: 0,
      latestPerformedAt: null,
    };
    existing.count += 1;
    // 最新 performedAt を ISO 文字列比較で更新
    if (!existing.latestPerformedAt || t.performedAt > existing.latestPerformedAt) {
      existing.latestPerformedAt = t.performedAt;
    }
    cellMap.set(key, existing);
  }

  // MatrixCell 形状で返す（materialId フィールドに customerId を入れる）
  // HeatmapMatrix は (rowId, testTypeId) を見るだけなのでフィールド名は問題ない
  return Array.from(cellMap.values()).map((a) => ({
    materialId: a.customerId,
    testTypeId: a.testTypeId,
    count: a.count,
    latestPerformedAt: a.latestPerformedAt,
    representativeTemperature: null,
    atmospheres: [],
  }));
};
