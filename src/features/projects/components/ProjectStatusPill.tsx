import type { ProjectStatus } from '@/domain/types';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  inquiry: '問合せ',
  quoting: '見積中',
  in_progress: '進行中',
  reviewing: 'レビュー中',
  completed: '完了',
  archived: 'アーカイブ',
};

const STATUS_COLOR: Record<ProjectStatus, string> = {
  inquiry: 'bg-slate-500/15 text-slate-400 border-slate-500/40',
  quoting: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  in_progress: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
  reviewing: 'bg-violet-500/15 text-violet-400 border-violet-500/40',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  archived: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
};

interface ProjectStatusPillProps {
  status: ProjectStatus;
}

export const ProjectStatusPill = ({ status }: ProjectStatusPillProps) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_COLOR[status]}`}
  >
    {STATUS_LABEL[status]}
  </span>
);

export const projectStatusLabel = (status: ProjectStatus): string => STATUS_LABEL[status];
