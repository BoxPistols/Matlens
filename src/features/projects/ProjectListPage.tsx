import { useMemo, useState } from 'react';
import type { ProjectStatus } from '@/domain/types';
import { ProjectStatusPill, projectStatusLabel } from './components/ProjectStatusPill';
import { useCustomersIndex, useProjects } from './api';

const STATUS_FILTERS: ProjectStatus[] = [
  'inquiry',
  'quoting',
  'in_progress',
  'reviewing',
  'completed',
  'archived',
];

interface ProjectListPageProps {
  onNav: (page: string) => void;
}

export const ProjectListPage = ({ onNav }: ProjectListPageProps) => {
  const [search, setSearch] = useState('');
  const [statusSet, setStatusSet] = useState<Set<ProjectStatus>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const query = useMemo(
    () => ({
      filter: {
        search: search.trim() || undefined,
        status: statusSet.size > 0 ? Array.from(statusSet) : undefined,
      },
      sort: { field: 'dueAt' as const, order: 'asc' as const },
      page,
      pageSize,
    }),
    [search, statusSet, page]
  );

  const { data, isLoading } = useProjects(query);
  const { data: customerIndex } = useCustomersIndex();

  const toggleStatus = (s: ProjectStatus) => {
    setStatusSet((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <h1 className="text-xl font-bold">案件一覧</h1>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          受託試験案件の全体を納期順に俯瞰し、ステータスや顧客で絞り込みます。
        </p>
      </header>
      <div className="flex flex-col gap-3 px-6 py-3 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="案件コード・タイトルで検索"
            className="flex-1 min-w-[240px] px-3 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
          />
          <span className="text-[12px] text-[var(--text-lo)]">
            {data ? `${data.pagination.total} 件` : '…'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleStatus(s)}
              aria-pressed={statusSet.has(s)}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                statusSet.has(s)
                  ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                  : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
              }`}
            >
              {projectStatusLabel(s)}
            </button>
          ))}
          {statusSet.size > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatusSet(new Set());
                setPage(1);
              }}
              className="px-2 py-1 text-[11px] text-[var(--text-lo)] underline"
            >
              解除
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading || !data ? (
          <div className="p-6 text-[var(--text-lo)]">読み込み中…</div>
        ) : data.items.length === 0 ? (
          <div className="p-6 text-[var(--text-lo)]">該当する案件はありません。</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-[var(--bg-raised)] z-10">
              <tr className="text-left border-b border-[var(--border-faint)]">
                <th className="px-4 py-2 font-semibold w-[130px]">案件コード</th>
                <th className="px-4 py-2 font-semibold">タイトル</th>
                <th className="px-4 py-2 font-semibold w-[180px]">顧客</th>
                <th className="px-4 py-2 font-semibold w-[120px]">ステータス</th>
                <th className="px-4 py-2 font-semibold w-[110px] text-right">納期</th>
                <th className="px-4 py-2 font-semibold w-[70px] text-right">試験片</th>
                <th className="px-4 py-2 font-semibold w-[70px] text-right">試験</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onNav(`pjdetail_${p.id}`)}
                  className="border-b border-[var(--border-faint)] cursor-pointer hover:bg-[var(--hover)]"
                >
                  <td className="px-4 py-2 font-mono text-[12px]">{p.code}</td>
                  <td className="px-4 py-2">{p.title}</td>
                  <td className="px-4 py-2 text-[12px] text-[var(--text-md)]">
                    {customerIndex?.get(p.customerId)?.name ?? p.customerId}
                  </td>
                  <td className="px-4 py-2">
                    <ProjectStatusPill status={p.status} />
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[12px]">
                    {p.dueAt ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums">
                    {p.specimenCount}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums">{p.testCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-faint)] text-[12px]">
          <span className="text-[var(--text-lo)]">
            {data.pagination.page} / {data.pagination.totalPages} ページ
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-[var(--border-faint)] disabled:opacity-40"
            >
              前へ
            </button>
            <button
              type="button"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              className="px-3 py-1 rounded border border-[var(--border-faint)] disabled:opacity-40"
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
