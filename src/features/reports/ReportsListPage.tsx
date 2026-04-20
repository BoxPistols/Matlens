// Reports 一覧 (#/reports)
// kind / status タブ + キーワード検索 + テーブル。

import { useMemo, useState } from 'react';
import type { Report, ReportKind, ReportStatus } from '@/domain/types';
import type { ReportQuery } from '@/infra/repositories/interfaces';
import {
  useProjectsIndexForReports,
  useReports,
  useUsersIndex,
} from './api';

interface ReportsListPageProps {
  onNav: (page: string) => void;
}

const KIND_LABEL: Record<ReportKind, string> = {
  test_report: '試験報告書',
  damage_analysis: '損傷解析',
  material_certification: '材料証明書',
  inspection: '検査成績書',
  summary: 'サマリ',
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  draft: '下書き',
  review: 'レビュー中',
  approved: '承認済',
  issued: '発行済',
  archived: 'アーカイブ',
};

const STATUS_ACCENT: Record<ReportStatus, string> = {
  draft: '#64748b',
  review: '#f59e0b',
  approved: '#3b82f6',
  issued: '#22c55e',
  archived: '#94a3b8',
};

const KIND_OPTIONS: ReportKind[] = [
  'test_report',
  'damage_analysis',
  'material_certification',
  'inspection',
  'summary',
];

const STATUS_OPTIONS: ReportStatus[] = [
  'draft',
  'review',
  'approved',
  'issued',
  'archived',
];

export const ReportsListPage = ({ onNav }: ReportsListPageProps) => {
  const [search, setSearch] = useState('');
  const [kindSet, setKindSet] = useState<Set<ReportKind>>(new Set());
  const [statusSet, setStatusSet] = useState<Set<ReportStatus>>(new Set());

  const query = useMemo<ReportQuery>(() => {
    const filter: ReportQuery['filter'] = {};
    if (search.trim()) filter.search = search.trim();
    if (kindSet.size > 0) filter.kind = Array.from(kindSet);
    if (statusSet.size > 0) filter.status = Array.from(statusSet);
    return {
      filter,
      sort: { field: 'updatedAt', order: 'desc' },
      pageSize: 200,
    };
  }, [search, kindSet, statusSet]);

  const reportsQ = useReports(query);
  const projectsQ = useProjectsIndexForReports();
  const usersQ = useUsersIndex();

  // 現ページ（pageSize=200、fixture 規模で 1 ページに収まる）のステータス分布を
  // 集計する。総件数は pagination.total をヘッダに表示する。
  // TODO(stage2): 実 REST では /api/v1/reports/status-counts のような集計 API を用意する
  const countsByStatus = useMemo(() => {
    const map = new Map<ReportStatus, number>();
    for (const s of STATUS_OPTIONS) map.set(s, 0);
    for (const r of reportsQ.data?.items ?? []) {
      map.set(r.status, (map.get(r.status) ?? 0) + 1);
    }
    return map;
  }, [reportsQ.data]);

  const toggleKind = (k: ReportKind) => {
    setKindSet((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const toggleStatus = (s: ReportStatus) => {
    setStatusSet((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  if (reportsQ.isError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        レポートの読み込みに失敗しました。
      </div>
    );
  }
  if (reportsQ.isLoading || !reportsQ.data) {
    return <div className="p-6 text-[var(--text-lo)]">レポートを読み込んでいます…</div>;
  }

  const reports: Report[] = reportsQ.data.items;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">レポート</h1>
          <span className="text-[11px] text-[var(--text-lo)]">Reports (PoC)</span>
          <span className="ml-auto text-[12px] text-[var(--text-lo)]">
            表示 {reports.length} / 全 {reportsQ.data.pagination.total} 件
          </span>
        </div>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          試験報告書 / 損傷解析 / 検査成績書 / サマリを横断して俯瞰します。
        </p>
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
          {STATUS_OPTIONS.map((s) => (
            <div
              key={s}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-[var(--border-faint)]"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: STATUS_ACCENT[s] }}
              />
              <span className="text-[var(--text-lo)]">{STATUS_LABEL[s]}</span>
              <span className="font-mono tabular-nums">{countsByStatus.get(s) ?? 0}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-2 px-6 py-3 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="タイトル・コード・サマリで検索"
            className="min-w-[280px] px-3 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[var(--text-lo)] mr-1">種別:</span>
          {KIND_OPTIONS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleKind(k)}
              aria-pressed={kindSet.has(k)}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                kindSet.has(k)
                  ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                  : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
              }`}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[var(--text-lo)] mr-1">ステータス:</span>
          {STATUS_OPTIONS.map((s) => (
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
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {reports.length === 0 ? (
          <div className="p-6 text-[var(--text-lo)]">該当するレポートはありません。</div>
        ) : (
          <div className="overflow-auto border border-[var(--border-faint)] rounded-lg">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-[var(--bg-raised)] z-10">
                <tr className="text-left border-b border-[var(--border-faint)]">
                  <th className="px-3 py-2 font-semibold">コード</th>
                  <th className="px-3 py-2 font-semibold">種別</th>
                  <th className="px-3 py-2 font-semibold">タイトル</th>
                  <th className="px-3 py-2 font-semibold">案件</th>
                  <th className="px-3 py-2 font-semibold w-[100px]">ステータス</th>
                  <th className="px-3 py-2 font-semibold">作成者</th>
                  <th className="px-3 py-2 font-semibold text-right w-[110px]">更新日</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const project = r.projectId ? projectsQ.data?.get(r.projectId) : null;
                  const author = usersQ.data?.get(r.authorId);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onNav(`report_${r.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onNav(`report_${r.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`レポート ${r.code} ${r.title} を開く`}
                      className="border-b border-[var(--border-faint)] cursor-pointer hover:bg-[var(--hover)] focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)]"
                    >
                      <td className="px-3 py-1.5 font-mono">{r.code}</td>
                      <td className="px-3 py-1.5">{KIND_LABEL[r.kind]}</td>
                      <td className="px-3 py-1.5">
                        <div className="truncate max-w-[360px]">{r.title}</div>
                        <div className="text-[11px] text-[var(--text-lo)] truncate max-w-[360px]">
                          {r.summary}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-[var(--text-md)] truncate max-w-[200px]">
                        {project ? project.code : r.projectId ?? '—'}
                      </td>
                      <td className="px-3 py-1.5">
                        <span
                          className="inline-block px-2 py-0.5 text-[11px] rounded"
                          style={{
                            background: `${STATUS_ACCENT[r.status]}22`,
                            color: STATUS_ACCENT[r.status],
                          }}
                        >
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-[var(--text-md)]">
                        {author?.name ?? r.authorId}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right text-[11px]">
                        {r.updatedAt.slice(0, 10)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export { KIND_LABEL as REPORT_KIND_LABEL, STATUS_LABEL as REPORT_STATUS_LABEL, STATUS_ACCENT as REPORT_STATUS_ACCENT };
