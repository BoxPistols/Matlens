// 試験マトリクスの「異常率」セル値計算。
// 各 (materialId, testTypeId) セルについて、
// 分母: 完了試験件数（Test.status === 'completed'、dateFrom で絞り込み済みを想定）
// 分子: 非 low 所見が紐づく testId の unique 数（1 試験に複数所見があっても 1 件として数える）

import type { DamageFinding, Specimen, Test } from '@/domain/types';

export interface AbnormalCell {
  materialId: string;
  testTypeId: string;
  abnormalCount: number;
  totalCount: number;
  ratio: number; // 0..1
}

/**
 * (materialId, testTypeId) ごとの異常率を計算する。
 *
 * tests は事前に dateFrom で絞り込み済みの想定。
 * specimens は materialId を Test から逆引きするために使う（Test に materialId は無い）。
 */
export const computeAbnormalCellMap = (input: {
  tests: Test[];
  damages: DamageFinding[];
  specimens: Specimen[];
}): Map<string, AbnormalCell> => {
  const { tests, damages, specimens } = input;

  const specimenById = new Map<string, Specimen>();
  for (const s of specimens) specimenById.set(s.id, s);

  // testId → materialId の逆引き索引（specimen 経由）
  // 同時に testId → testTypeId も保持
  const testMeta = new Map<string, { materialId: string; testTypeId: string }>();
  for (const t of tests) {
    if (t.status !== 'completed') continue;
    const spec = specimenById.get(t.specimenId);
    if (!spec) continue;
    testMeta.set(t.id, { materialId: spec.materialId, testTypeId: t.testTypeId });
  }

  // 非 low 所見の testId を抽出（unique）
  const abnormalTestIds = new Set<string>();
  for (const d of damages) {
    if (d.confidenceLevel === 'low') continue;
    if (!d.testId) continue;
    if (!testMeta.has(d.testId)) continue; // 期間外 / 未完了の Test に紐づく所見は無視
    abnormalTestIds.add(d.testId);
  }

  // セルごとに totalCount / abnormalCount を積む
  const cellMap = new Map<string, AbnormalCell>();
  const keyOf = (materialId: string, testTypeId: string) => `${materialId}__${testTypeId}`;

  for (const [testId, meta] of testMeta) {
    const key = keyOf(meta.materialId, meta.testTypeId);
    const cell = cellMap.get(key) ?? {
      materialId: meta.materialId,
      testTypeId: meta.testTypeId,
      abnormalCount: 0,
      totalCount: 0,
      ratio: 0,
    };
    cell.totalCount += 1;
    if (abnormalTestIds.has(testId)) cell.abnormalCount += 1;
    cellMap.set(key, cell);
  }

  // 比率を最後に計算（ゼロ割回避）
  for (const cell of cellMap.values()) {
    cell.ratio = cell.totalCount > 0 ? cell.abnormalCount / cell.totalCount : 0;
  }

  return cellMap;
};
