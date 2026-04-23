// 案件詳細の担当者負荷サマリ。PM / リードエンジニアそれぞれが抱える
// 進行中案件の件数を表示し、「この担当者は他にも案件を持っている」ことを可視化する。

import type { Project, User } from '@/domain/types';

interface OwnerLoadSummaryProps {
  project: Project;
  allProjects: Project[];
  users: Map<string, User>;
}

const ACTIVE_STATUSES: Project['status'][] = [
  'inquiry',
  'quoting',
  'in_progress',
  'reviewing',
];

const countActiveForUser = (projects: Project[], userId: string): number => {
  return projects.filter(
    (p) =>
      ACTIVE_STATUSES.includes(p.status) &&
      (p.pmId === userId || p.leadEngineerId === userId)
  ).length;
};

export const OwnerLoadSummary = ({ project, allProjects, users }: OwnerLoadSummaryProps) => {
  const pm = users.get(project.pmId);
  const eng = users.get(project.leadEngineerId);
  const pmLoad = countActiveForUser(allProjects, project.pmId);
  const engLoad =
    project.leadEngineerId === project.pmId
      ? pmLoad
      : countActiveForUser(allProjects, project.leadEngineerId);

  // 軽い負荷警告閾値（3 案件以上で warn、5 以上で err）
  const toneForLoad = (count: number): string => {
    if (count >= 5) return 'var(--err,#dc2626)';
    if (count >= 3) return 'var(--warn,#d97706)';
    return 'var(--text-hi)';
  };

  return (
    <div
      role="group"
      aria-label="担当者別負荷"
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
    >
      <OwnerCard
        roleLabel="PM"
        userId={project.pmId}
        userName={pm?.name ?? null}
        activeCount={pmLoad}
        color={toneForLoad(pmLoad)}
      />
      <OwnerCard
        roleLabel="リードエンジニア"
        userId={project.leadEngineerId}
        userName={eng?.name ?? null}
        activeCount={engLoad}
        color={toneForLoad(engLoad)}
      />
    </div>
  );
};

interface OwnerCardProps {
  roleLabel: string;
  userId: string;
  userName: string | null;
  activeCount: number;
  color: string;
}

const OwnerCard = ({ roleLabel, userId, userName, activeCount, color }: OwnerCardProps) => (
  <div className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] px-3 py-2 flex flex-col gap-1">
    <div className="text-[11px] text-[var(--text-lo)]">{roleLabel}</div>
    <div className="text-[13px] font-semibold text-[var(--text-hi)]">
      {userName ?? <span className="font-mono text-[12px]">{userId}</span>}
    </div>
    <div className="text-[12px] text-[var(--text-md)] mt-0.5">
      進行中案件{' '}
      <span
        className="font-mono font-bold tabular-nums text-[14px]"
        style={{ color }}
      >
        {activeCount}
      </span>{' '}
      件（本案件を含む）
    </div>
  </div>
);
