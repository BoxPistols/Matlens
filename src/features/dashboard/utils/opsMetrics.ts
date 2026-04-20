// 受託試験 PoC ダッシュボード用の集計ロジック。
// 純関数で実装してテスト容易に。UI 側は結果を受け取って描画するだけに寄せる。

import type {
  DamageFinding,
  Project,
  Specimen,
  Test,
} from '@/domain/types';

export interface OpsKpi {
  /** 進行中案件数（inquiry / quoting / in_progress / reviewing） */
  activeProjects: number;
  /** 総案件数 */
  totalProjects: number;
  /** 要アクションの試験片（進行中案件に紐づく received / prepared） */
  pendingSpecimens: number;
  /** 過去 30 日間に完了した試験件数 */
  completedTestsLast30Days: number;
  /**
   * 異常所見比率（過去 30 日間）。
   * 分母: 過去 30 日の完了試験件数。
   * 分子: 過去 30 日の非 low 損傷所見が紐づくユニーク testId 数
   * （同一試験に複数所見があっても 1 件として数える）。
   */
  abnormalFindingRatio: number;
}

const ACTIVE_STATUSES: Project['status'][] = [
  'inquiry',
  'quoting',
  'in_progress',
  'reviewing',
];

export const computeOpsKpi = (input: {
  projects: Project[];
  specimens: Specimen[];
  tests: Test[];
  damages: DamageFinding[];
  /** 集計基準時刻（テスト容易のため注入可能） */
  now?: Date;
}): OpsKpi => {
  const { projects, specimens, tests, damages } = input;
  const now = input.now ?? new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = new Date(now.getTime() - 30 * msPerDay);

  const activeProjects = projects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length;

  const activeProjectIds = new Set(
    projects
      .filter((p) => ACTIVE_STATUSES.includes(p.status))
      .map((p) => p.id)
  );
  // 進行中案件で受入/準備止まりの試験片（= 現場で待機している / 着手待ち）。
  // 受入日による絞り込みはしない（1 年前に来て未着手のまま、は「滞留」として KPI で可視化したい）。
  const pendingSpecimens = specimens.filter((s) => {
    if (!activeProjectIds.has(s.projectId)) return false;
    return s.status === 'received' || s.status === 'prepared';
  }).length;

  const completedTestsInLast30Days = tests.filter(
    (t) =>
      t.status === 'completed' &&
      new Date(t.performedAt).getTime() >= thirtyDaysAgo.getTime()
  );
  const completedTestsLast30Days = completedTestsInLast30Days.length;
  const completedTestIdsLast30Days = new Set(completedTestsInLast30Days.map((t) => t.id));

  // 1 試験に複数所見があっても 1 件として数えるため unique testId でカウント。
  // 分子: 過去 30 日の非 low 所見が紐づく完了試験の testId 集合 (過去 30 日完了試験の部分集合)。
  const abnormalTestIds = new Set<string>();
  for (const d of damages) {
    if (d.confidenceLevel === 'low') continue;
    if (new Date(d.updatedAt).getTime() < thirtyDaysAgo.getTime()) continue;
    if (!d.testId) continue;
    if (!completedTestIdsLast30Days.has(d.testId)) continue;
    abnormalTestIds.add(d.testId);
  }
  const ratio = completedTestsLast30Days > 0
    ? Math.min(1, abnormalTestIds.size / completedTestsLast30Days)
    : 0;

  return {
    activeProjects,
    totalProjects: projects.length,
    pendingSpecimens,
    completedTestsLast30Days,
    abnormalFindingRatio: ratio,
  };
};

export interface DueRiskItem {
  project: Project;
  daysLeft: number; // 負なら遅延
}

/**
 * 納期リスク一覧: `status in {in_progress, reviewing}` かつ
 * dueAt が `now + thresholdDays` 以内、または既に超過しているもの。
 *
 * `dueAt` は `YYYY-MM-DD` 想定。UTC 解釈で±1日ブレるのを避けるため
 * JST (+09:00) の日末 23:59:59 を使って残日数を算出する。
 */
export const collectDueRisk = (
  projects: Project[],
  now: Date = new Date(),
  thresholdDays = 7
): DueRiskItem[] => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const items: DueRiskItem[] = [];
  for (const p of projects) {
    if (p.status !== 'in_progress' && p.status !== 'reviewing') continue;
    if (!p.dueAt) continue;
    // 日付文字列は JST の日末に正規化（時刻指定済みの ISO の場合はそのまま）
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(p.dueAt);
    const due = new Date(isoDateOnly ? `${p.dueAt}T23:59:59+09:00` : p.dueAt);
    if (Number.isNaN(due.getTime())) continue;
    // 小数日を切り捨てて「あと○日」の意味を明確にする
    const daysLeft = Math.floor((due.getTime() - now.getTime()) / msPerDay);
    if (daysLeft <= thresholdDays) {
      items.push({ project: p, daysLeft });
    }
  }
  // 残日数が少ない（＝リスク高）順に並べる。同値は stable order（元の順序）を保つ。
  return items.sort((a, b) => a.daysLeft - b.daysLeft);
};

export type ActivityKind = 'test_completed' | 'damage_reported';

export interface ActivityEvent {
  kind: ActivityKind;
  timestamp: string; // ISO
  id: string;
  primary: string;
  secondary: string;
}

/**
 * 最新活動: 試験完了と損傷所見登録を時系列降順で混ぜ、上位 N 件を返す。
 */
export const buildActivityTimeline = (
  tests: Test[],
  damages: DamageFinding[],
  limit = 20
): ActivityEvent[] => {
  const events: ActivityEvent[] = [];
  for (const t of tests) {
    if (t.status !== 'completed') continue;
    events.push({
      kind: 'test_completed',
      timestamp: t.performedAt,
      id: t.id,
      primary: `試験完了: ${t.id}`,
      secondary: `試験種別 ${t.testTypeId} / 試験片 ${t.specimenId}`,
    });
  }
  for (const d of damages) {
    events.push({
      kind: 'damage_reported',
      timestamp: d.updatedAt,
      id: d.id,
      primary: `損傷所見登録: ${d.type} (${d.location})`,
      secondary: d.rootCauseHypothesis,
    });
  }
  // ソート契約違反（同値でも非 0 を返す）を避けるため、数値差で比較する。
  // 無効な日時は末尾へ。
  events.sort((a, b) => {
    const aTime = Date.parse(a.timestamp);
    const bTime = Date.parse(b.timestamp);
    const aValid = !Number.isNaN(aTime);
    const bValid = !Number.isNaN(bTime);
    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;
    return bTime - aTime;
  });
  return events.slice(0, limit);
};
