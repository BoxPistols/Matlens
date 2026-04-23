// 試験片のステータス別件数を横並びカラムで表示するミニ Kanban。
// 案件詳細画面に埋めて「今どの工程に何件滞留しているか」を一目で把握する。

import type { Specimen } from '@/domain/types';

interface SpecimenKanbanMiniProps {
  specimens: Specimen[];
}

const STATUS_DEFS: {
  status: Specimen['status'];
  label: string;
  color: string;
}[] = [
  { status: 'received', label: '受入', color: 'var(--accent,#2563eb)' },
  { status: 'prepared', label: '準備', color: 'var(--vec,#0ea5e9)' },
  { status: 'testing', label: '試験中', color: 'var(--warn,#d97706)' },
  { status: 'tested', label: '試験済', color: 'var(--ai-col,#a855f7)' },
  { status: 'stored', label: '保管', color: 'var(--ok,#22c55e)' },
  { status: 'discarded', label: '廃棄', color: 'var(--text-lo,#94a3b8)' },
];

export const SpecimenKanbanMini = ({ specimens }: SpecimenKanbanMiniProps) => {
  const counts = new Map<Specimen['status'], number>();
  for (const s of specimens) {
    counts.set(s.status, (counts.get(s.status) ?? 0) + 1);
  }
  const total = specimens.length;

  return (
    <div
      role="group"
      aria-label="試験片ステータス別件数"
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${STATUS_DEFS.length}, 1fr)` }}
    >
      {STATUS_DEFS.map(({ status, label, color }) => {
        const count = counts.get(status) ?? 0;
        const ratio = total > 0 ? count / total : 0;
        return (
          <div
            key={status}
            className="flex flex-col gap-1 px-2 py-1.5 rounded border border-[var(--border-faint)] bg-[var(--bg-raised)]"
          >
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-[11px] text-[var(--text-lo)]">{label}</span>
              <span className="text-[14px] font-mono font-semibold tabular-nums text-[var(--text-hi)]">
                {count}
              </span>
            </div>
            {/* 比率バー */}
            <div className="h-1 rounded-sm bg-[var(--border-faint)] overflow-hidden">
              <div
                aria-hidden="true"
                className="h-full rounded-sm transition-all"
                style={{ width: `${(ratio * 100).toFixed(1)}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
