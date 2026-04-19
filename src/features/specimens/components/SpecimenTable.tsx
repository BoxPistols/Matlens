// Specimen Table: 試験片をテーブル表示。列でソート可能。

import { useMemo, useState } from 'react';
import type {
  ID,
  Material,
  Project,
  Specimen,
  SpecimenStatus,
} from '@/domain/types';

export interface SpecimenTableProps {
  specimens: Specimen[];
  projectsById: Map<ID, Project> | undefined;
  materialsById: Map<ID, Material> | undefined;
  onSelect?: (id: ID) => void;
  selectedId?: ID | null;
}

type SortField = 'code' | 'receivedAt' | 'status' | 'location';
type SortOrder = 'asc' | 'desc';

const STATUS_LABEL: Record<SpecimenStatus, string> = {
  received: '受入',
  prepared: '準備',
  testing: '試験中',
  tested: '試験済',
  stored: '保管',
  discarded: '廃棄',
};

export const SpecimenTable = ({
  specimens,
  projectsById,
  materialsById,
  onSelect,
  selectedId,
}: SpecimenTableProps) => {
  const [sortField, setSortField] = useState<SortField>('receivedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sorted = useMemo(() => {
    const sign = sortOrder === 'asc' ? 1 : -1;
    return [...specimens].sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      if (av === bv) return 0;
      return av > bv ? sign : -sign;
    });
  }, [specimens, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : '';

  return (
    <div className="overflow-auto border border-[var(--border-faint)] rounded-lg">
      <table className="w-full text-[12px]">
        <thead className="sticky top-0 bg-[var(--bg-raised)] z-10">
          <tr className="text-left border-b border-[var(--border-faint)]">
            <th className="px-3 py-2 font-semibold">
              <button
                type="button"
                onClick={() => toggleSort('code')}
                className="underline-offset-2 hover:underline"
              >
                コード {sortIndicator('code')}
              </button>
            </th>
            <th className="px-3 py-2 font-semibold">案件</th>
            <th className="px-3 py-2 font-semibold">母材</th>
            <th className="px-3 py-2 font-semibold">
              <button
                type="button"
                onClick={() => toggleSort('location')}
                className="underline-offset-2 hover:underline"
              >
                保管 {sortIndicator('location')}
              </button>
            </th>
            <th className="px-3 py-2 font-semibold">
              <button
                type="button"
                onClick={() => toggleSort('status')}
                className="underline-offset-2 hover:underline"
              >
                ステータス {sortIndicator('status')}
              </button>
            </th>
            <th className="px-3 py-2 font-semibold text-right">
              <button
                type="button"
                onClick={() => toggleSort('receivedAt')}
                className="underline-offset-2 hover:underline"
              >
                受入日 {sortIndicator('receivedAt')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const project = projectsById?.get(s.projectId);
            const material = materialsById?.get(s.materialId);
            const isSelected = selectedId === s.id;
            return (
              <tr
                key={s.id}
                onClick={() => onSelect?.(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect?.(s.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`試験片 ${s.code}`}
                className={`border-b border-[var(--border-faint)] cursor-pointer focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)] ${
                  isSelected ? 'bg-[var(--hover)]' : 'hover:bg-[var(--hover)]'
                }`}
              >
                <td className="px-3 py-1.5 font-mono">{s.code}</td>
                <td className="px-3 py-1.5 text-[11px] text-[var(--text-md)] truncate max-w-[220px]">
                  {project ? (
                    <>
                      <span className="font-mono">{project.code}</span>
                      <span className="ml-2 text-[var(--text-lo)]">{project.title}</span>
                    </>
                  ) : (
                    s.projectId
                  )}
                </td>
                <td className="px-3 py-1.5 font-mono">
                  {material?.designation ?? s.materialId}
                </td>
                <td className="px-3 py-1.5 font-mono text-[11px]">
                  {s.location ?? '—'}
                </td>
                <td className="px-3 py-1.5">
                  <span className="text-[11px]">{STATUS_LABEL[s.status]}</span>
                </td>
                <td className="px-3 py-1.5 font-mono text-right">{s.receivedAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
