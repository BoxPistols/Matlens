// Specimen Tracker Page (#/specimens / #45 Phase 3)
// Kanban / Table 2 ビュー切替 + 案件・母材・ステータス・キーワードフィルタ。
// 上部に KPI（各ステータス件数）を表示し、今週到着分を目立たせる。

import { useEffect, useMemo, useState } from 'react';
import type { ID, SpecimenStatus } from '@/domain/types';
import type { SpecimenQuery } from '@/infra/repositories/interfaces';
import { SpecimenKanban } from './components/SpecimenKanban';
import { SpecimenTable } from './components/SpecimenTable';
import {
  useMaterialsIndex,
  useProjectsIndex,
  useSpecimens,
} from './api';

type ViewMode = 'kanban' | 'table';

const STATUS_OPTIONS: { value: SpecimenStatus; label: string }[] = [
  { value: 'received', label: '受入' },
  { value: 'prepared', label: '準備' },
  { value: 'testing', label: '試験中' },
  { value: 'tested', label: '試験済' },
  { value: 'stored', label: '保管' },
  { value: 'discarded', label: '廃棄' },
];

export const SpecimenTrackerPage = () => {
  const [view, setView] = useState<ViewMode>('kanban');
  const [projectId, setProjectId] = useState<string>('');
  const [materialId, setMaterialId] = useState<string>('');
  const [statusSet, setStatusSet] = useState<Set<SpecimenStatus>>(new Set());
  const [search, setSearch] = useState<string>('');
  // 入力毎のクエリ発火を抑えるため、debounce した値を Repository へ渡す
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedId, setSelectedId] = useState<ID | null>(null);
  const [includeDiscarded, setIncludeDiscarded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const query = useMemo<SpecimenQuery>(() => {
    const filter: SpecimenQuery['filter'] = {};
    if (projectId) filter.projectId = projectId;
    if (materialId) filter.materialId = materialId;
    if (statusSet.size > 0) filter.status = Array.from(statusSet);
    if (debouncedSearch.trim()) filter.search = debouncedSearch.trim();
    // 試験片総数 (fixture 861 件) を一括俯瞰できるよう余裕をもって 1000 とする
    return { filter, pageSize: 1000 };
  }, [projectId, materialId, statusSet, debouncedSearch]);

  const {
    data: specimensData,
    isLoading: specimensLoading,
    isError: specimensError,
  } = useSpecimens(query);
  const {
    data: projectsById,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjectsIndex();
  const {
    data: materialsById,
    isLoading: materialsLoading,
    isError: materialsError,
  } = useMaterialsIndex();

  // 廃棄表示は「includeDiscarded トグル」または「ステータスフィルタで廃棄を選択」のいずれかで有効
  const specimens = useMemo(() => {
    if (!specimensData) return [];
    const showDiscarded = includeDiscarded || statusSet.has('discarded');
    return showDiscarded
      ? specimensData.items
      : specimensData.items.filter((s) => s.status !== 'discarded');
  }, [specimensData, includeDiscarded, statusSet]);

  const projectOptions = useMemo(() => {
    if (!projectsById) return [];
    return Array.from(projectsById.values()).sort((a, b) =>
      a.code > b.code ? 1 : -1
    );
  }, [projectsById]);

  const materialOptions = useMemo(() => {
    if (!materialsById) return [];
    return Array.from(materialsById.values()).sort((a, b) =>
      a.designation > b.designation ? 1 : -1
    );
  }, [materialsById]);

  const statusCounts = useMemo(() => {
    const base: Record<SpecimenStatus, number> = {
      received: 0,
      prepared: 0,
      testing: 0,
      tested: 0,
      stored: 0,
      discarded: 0,
    };
    if (!specimensData) return base;
    for (const s of specimensData.items) base[s.status] += 1;
    return base;
  }, [specimensData]);

  const toggleStatus = (s: SpecimenStatus) => {
    setStatusSet((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
    setSelectedId(null);
  };

  if (specimensError || projectsError || materialsError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        試験片の読み込みに失敗しました。時間をおいて再度お試しください。
      </div>
    );
  }

  if (specimensLoading || projectsLoading || materialsLoading || !specimensData) {
    return (
      <div className="p-6">
        <div className="text-[var(--text-lo)]">試験片を読み込んでいます…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">試験片トラッカー</h1>
          <span className="text-[11px] text-[var(--text-lo)]">
            Specimen Tracker
          </span>
        </div>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          試験片のライフサイクル（受入 → 準備 → 試験中 → 試験済 → 保管）をカンバンとテーブルで追跡します。
        </p>
        <div className="mt-3 flex items-center gap-3 flex-wrap text-[12px]">
          {STATUS_OPTIONS.map((s) => (
            <div
              key={s.value}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-[var(--border-faint)]"
            >
              <span className="text-[var(--text-lo)]">{s.label}</span>
              <span className="font-mono tabular-nums">
                {statusCounts[s.value]}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* フィルタ + ビュー切替 */}
      <div className="flex flex-col gap-2 px-6 py-3 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedId(null);
            }}
            placeholder="コードで検索"
            className="min-w-[200px] px-3 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
          />

          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setSelectedId(null);
            }}
            className="px-2 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
            aria-label="案件フィルタ"
          >
            <option value="">すべての案件</option>
            {projectOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} / {p.title}
              </option>
            ))}
          </select>

          <select
            value={materialId}
            onChange={(e) => {
              setMaterialId(e.target.value);
              setSelectedId(null);
            }}
            className="px-2 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
            aria-label="母材フィルタ"
          >
            <option value="">すべての母材</option>
            {materialOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.designation}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 text-[12px]">
            <input
              type="checkbox"
              checked={includeDiscarded}
              onChange={(e) => setIncludeDiscarded(e.target.checked)}
            />
            廃棄も表示
          </label>

          <div
            className="ml-auto inline-flex rounded border border-[var(--border-faint)] overflow-hidden"
            role="tablist"
            aria-label="表示切替"
          >
            {(['kanban', 'table'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-[12px] ${
                  view === v
                    ? 'bg-[var(--accent,#2563eb)] text-white'
                    : 'bg-transparent text-[var(--text-md)] hover:bg-[var(--hover)]'
                }`}
              >
                {v === 'kanban' ? 'カンバン' : 'テーブル'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-[12px]">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStatus(opt.value)}
              aria-pressed={statusSet.has(opt.value)}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                statusSet.has(opt.value)
                  ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                  : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {statusSet.size > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatusSet(new Set());
                setSelectedId(null);
              }}
              className="px-2 py-1 text-[11px] text-[var(--text-lo)] underline"
            >
              解除
            </button>
          )}
          <span className="ml-auto text-[var(--text-lo)]">
            表示 {specimens.length} 件
          </span>
        </div>
      </div>

      {/* ビュー本体 */}
      <div className="flex-1 overflow-auto p-4">
        {specimens.length === 0 ? (
          <div className="text-[var(--text-lo)] p-6">該当する試験片はありません。</div>
        ) : view === 'kanban' ? (
          <SpecimenKanban
            specimens={specimens}
            projectsById={projectsById}
            materialsById={materialsById}
            onSelect={setSelectedId}
            selectedId={selectedId}
            includeDiscarded={includeDiscarded}
          />
        ) : (
          <SpecimenTable
            specimens={specimens}
            projectsById={projectsById}
            materialsById={materialsById}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        )}
      </div>
    </div>
  );
};
