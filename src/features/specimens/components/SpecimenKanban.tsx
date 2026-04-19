// Specimen Kanban: 5 カラムのカンバンボード。
// ステータス遷移: received → prepared → testing → tested → stored
// discarded は別列として右端に出す（オプション）。

import type {
  ID,
  Material,
  Project,
  Specimen,
  SpecimenStatus,
} from '@/domain/types';

export interface SpecimenKanbanProps {
  specimens: Specimen[];
  projectsById: Map<ID, Project> | undefined;
  materialsById: Map<ID, Material> | undefined;
  onSelect?: (id: ID) => void;
  selectedId?: ID | null;
  includeDiscarded?: boolean;
}

interface ColumnDef {
  status: SpecimenStatus;
  label: string;
  accent: string;
}

const COLUMNS: ColumnDef[] = [
  { status: 'received', label: '受入', accent: '#64748b' },
  { status: 'prepared', label: '準備', accent: '#0ea5e9' },
  { status: 'testing', label: '試験中', accent: '#f59e0b' },
  { status: 'tested', label: '試験済', accent: '#22c55e' },
  { status: 'stored', label: '保管', accent: '#64748b' },
];

const DISCARDED_COLUMN: ColumnDef = {
  status: 'discarded',
  label: '廃棄',
  accent: '#dc2626',
};

interface SpecimenCardProps {
  specimen: Specimen;
  project: Project | undefined;
  material: Material | undefined;
  onSelect?: (id: ID) => void;
  isSelected: boolean;
}

const SpecimenCard = ({
  specimen,
  project,
  material,
  onSelect,
  isSelected,
}: SpecimenCardProps) => {
  const handleActivate = () => onSelect?.(specimen.id);
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKey}
      aria-pressed={isSelected}
      aria-label={`試験片 ${specimen.code}${project ? ` / ${project.code}` : ''}`}
      className={`rounded-md border p-2 text-[12px] cursor-pointer transition-colors ${
        isSelected
          ? 'border-[var(--accent,#2563eb)] bg-[var(--hover)]'
          : 'border-[var(--border-faint)] bg-[var(--bg-base,transparent)] hover:bg-[var(--hover)]'
      } focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)]`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-semibold">{specimen.code}</span>
        {specimen.location && (
          <span className="text-[10px] text-[var(--text-lo)] font-mono">
            {specimen.location}
          </span>
        )}
      </div>
      {material && (
        <div className="mt-1 text-[11px] font-mono text-[var(--text-md)]">
          {material.designation}
        </div>
      )}
      {project && (
        <div className="mt-0.5 text-[10px] text-[var(--text-lo)] truncate">
          {project.code} / {project.title}
        </div>
      )}
      <div className="mt-1 text-[10px] text-[var(--text-lo)] font-mono">
        {specimen.receivedAt}
      </div>
    </div>
  );
};

export const SpecimenKanban = ({
  specimens,
  projectsById,
  materialsById,
  onSelect,
  selectedId,
  includeDiscarded = false,
}: SpecimenKanbanProps) => {
  const columns = includeDiscarded ? [...COLUMNS, DISCARDED_COLUMN] : COLUMNS;
  const bucketed = new Map<SpecimenStatus, Specimen[]>();
  for (const c of columns) bucketed.set(c.status, []);
  for (const s of specimens) {
    bucketed.get(s.status)?.push(s);
  }

  return (
    <div
      className="grid gap-3 min-w-[960px]"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      role="list"
      aria-label="試験片カンバン"
    >
      {columns.map((col) => {
        const items = bucketed.get(col.status) ?? [];
        return (
          <section
            key={col.status}
            role="listitem"
            aria-label={`${col.label} ${items.length} 件`}
            className="flex flex-col gap-2 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-faint)] p-2"
          >
            <header className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: col.accent }}
                  aria-hidden
                />
                <span className="text-[12px] font-semibold">{col.label}</span>
              </div>
              <span className="text-[11px] text-[var(--text-lo)] font-mono tabular-nums">
                {items.length}
              </span>
            </header>
            <div className="flex flex-col gap-2 overflow-auto max-h-[calc(100vh-280px)] pr-0.5">
              {items.length === 0 ? (
                <div className="text-[11px] text-[var(--text-lo)] px-1 py-2">
                  該当なし
                </div>
              ) : (
                items.map((s) => (
                  <SpecimenCard
                    key={s.id}
                    specimen={s}
                    project={projectsById?.get(s.projectId)}
                    material={materialsById?.get(s.materialId)}
                    onSelect={onSelect}
                    isSelected={selectedId === s.id}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};
