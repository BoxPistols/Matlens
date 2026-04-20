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
  /** 今週受入〜期限の試験片数（来週までに何らかアクションが必要） */
  dueSoonSpecimens: number;
  /** 過去 30 日間に完了した試験件数 */
  completedTestsLast30Days: number;
  /** 異常所見比率（低確信度以外の損傷所見 / 総試験） */
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
  const weekAhead = new Date(now.getTime() + 7 * msPerDay);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * msPerDay);

  const activeProjects = projects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length;

  const activeProjectIds = new Set(
    projects
      .filter((p) => ACTIVE_STATUSES.includes(p.status))
      .map((p) => p.id)
  );
  // 今週到着済 〜 今週中に試験化が必要な試験片
  const dueSoonSpecimens = specimens.filter((s) => {
    if (!activeProjectIds.has(s.projectId)) return false;
    if (s.status !== 'received' && s.status !== 'prepared') return false;
    const received = new Date(s.receivedAt).getTime();
    return received <= weekAhead.getTime();
  }).length;

  const completedTestsLast30Days = tests.filter(
    (t) =>
      t.status === 'completed' &&
      new Date(t.performedAt).getTime() >= thirtyDaysAgo.getTime()
  ).length;

  // 異常所見比率: 「過去 30 日の低確信度以外の損傷所見」/「過去 30 日の完了試験」
  // 分子・分母の期間を揃える（揃えないと蓄積分で常に 1.0 に張り付く）。
  const abnormal = damages.filter(
    (d) =>
      d.confidenceLevel !== 'low' &&
      new Date(d.updatedAt).getTime() >= thirtyDaysAgo.getTime()
  ).length;
  const ratio = completedTestsLast30Days > 0
    ? Math.min(1, abnormal / completedTestsLast30Days)
    : 0;

  return {
    activeProjects,
    totalProjects: projects.length,
    dueSoonSpecimens,
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
    const due = new Date(p.dueAt);
    if (Number.isNaN(due.getTime())) continue;
    const daysLeft = Math.round((due.getTime() - now.getTime()) / msPerDay);
    if (daysLeft <= thresholdDays) {
      items.push({ project: p, daysLeft });
    }
  }
  // 残日数が少ない（＝リスク高）順に並べる
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
  events.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return events.slice(0, limit);
};
