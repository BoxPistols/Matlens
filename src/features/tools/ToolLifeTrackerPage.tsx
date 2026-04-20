// 工具ライフトラッカー (#/tools) — #48 Should
// 工具一覧 + 選択工具の VB 推移 + 直近プロセス。

import { useMemo, useState } from 'react';
import type { ID, Tool, ToolType } from '@/domain/types';
import { VBChart } from './components/VBChart';
import { TaylorPredictionPanel } from './components/TaylorPredictionPanel';
import {
  buildWearSeries,
  summarizeByTool,
  useAllCuttingProcesses,
  useMaterialsIndex,
  useTools,
} from './api';

const TOOL_TYPE_LABEL: Record<ToolType, string> = {
  end_mill: 'エンドミル',
  face_mill: '正面フライス',
  ball_mill: 'ボール',
  insert_turning: '旋削インサート',
  insert_milling: 'ミーリングインサート',
  drill: 'ドリル',
  reamer: 'リーマ',
  tap: 'タップ',
};

const TOOL_TYPE_OPTIONS: ToolType[] = [
  'end_mill',
  'ball_mill',
  'face_mill',
  'insert_turning',
  'insert_milling',
  'drill',
  'reamer',
  'tap',
];

const WEAR_LIMIT = 0.3;

// TODO(stage2): 工具マスタが数百件に拡大したらページネーション UI または
// 集計 API（/api/v1/tools/usage-summary）に切り出す。
const TOOLS_PAGE_SIZE = 500;

export const ToolLifeTrackerPage = () => {
  const [search, setSearch] = useState('');
  const [typeSet, setTypeSet] = useState<Set<ToolType>>(new Set());
  const [selectedId, setSelectedId] = useState<ID | null>(null);

  // TODO(stage2): 工具マスタ全件取得は集計 API / ページネーション対応に置換予定。
  // 現状 fixture 12 件なので 500 でも十分だが、規模拡大時の制約を明示するための定数化。
  const toolsQ = useTools({ pageSize: TOOLS_PAGE_SIZE });
  const processesQ = useAllCuttingProcesses();
  const materialsQ = useMaterialsIndex();

  const toolsFiltered = useMemo(() => {
    const all = toolsQ.data?.items ?? [];
    const q = search.trim().toLowerCase();
    return all.filter((t) => {
      if (typeSet.size > 0 && !typeSet.has(t.type)) return false;
      if (q) {
        return (
          t.code.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.nameEn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [toolsQ.data, search, typeSet]);

  const usageByTool = useMemo(
    () => (processesQ.data ? summarizeByTool(processesQ.data) : new Map()),
    [processesQ.data]
  );

  // 全工具から引く（toolsFiltered は絞込後でフィルタを変えると選択工具が
  // 消える問題があるため、全体集合を参照する）
  const selectedTool: Tool | null = selectedId
    ? toolsQ.data?.items.find((t) => t.id === selectedId) ?? null
    : null;

  const wearSeries = useMemo(
    () =>
      selectedTool && processesQ.data
        ? buildWearSeries(processesQ.data, selectedTool.id)
        : [],
    [selectedTool, processesQ.data]
  );

  const recentProcesses = useMemo(() => {
    if (!selectedTool || !processesQ.data) return [];
    return processesQ.data
      .filter((p) => p.toolId === selectedTool.id)
      .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
      .slice(0, 15);
  }, [selectedTool, processesQ.data]);

  const toggleType = (t: ToolType) => {
    setTypeSet((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
    setSelectedId(null);
  };

  if (toolsQ.isError || processesQ.isError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        工具データの読み込みに失敗しました。
      </div>
    );
  }
  if (toolsQ.isLoading || processesQ.isLoading || !toolsQ.data) {
    return <div className="p-6 text-[var(--text-lo)]">工具データを読み込んでいます…</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">工具ライフトラッカー</h1>
          <span className="text-[11px] text-[var(--text-lo)]">Tool Life Tracker (PoC)</span>
          <span className="ml-auto text-[12px] text-[var(--text-lo)]">
            {toolsFiltered.length} 工具
          </span>
        </div>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          工具ごとに累積加工距離に対する工具摩耗 VB の推移を俯瞰し、交換タイミングを把握します。
        </p>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* 左: 工具一覧 */}
        <aside
          className="w-80 flex-shrink-0 border-r border-[var(--border-faint)] bg-[var(--bg-raised)] overflow-auto"
          aria-label="工具一覧"
        >
          <div className="px-3 py-2 border-b border-[var(--border-faint)] flex flex-col gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="コード・名称で検索"
              className="w-full px-2 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
            />
            <div className="flex items-center gap-1 flex-wrap">
              {TOOL_TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={typeSet.has(t)}
                  onClick={() => toggleType(t)}
                  className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                    typeSet.has(t)
                      ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                      : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
                  }`}
                >
                  {TOOL_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
          <ul className="flex flex-col">
            {toolsFiltered.map((t) => {
              const usage = usageByTool.get(t.id);
              const overLimit =
                usage && usage.maxVB !== null && usage.maxVB >= WEAR_LIMIT;
              const active = selectedId === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    aria-pressed={active}
                    className={`w-full text-left px-3 py-2 border-b border-[var(--border-faint)] focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)] ${
                      active
                        ? 'bg-[var(--hover)]'
                        : 'hover:bg-[var(--hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[12px] font-semibold">
                        {t.code}
                      </span>
                      {overLimit && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background: 'rgba(220,38,38,0.14)',
                            color: 'var(--err, #dc2626)',
                          }}
                        >
                          限界超
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-md)] truncate">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-lo)] mt-0.5 flex items-center gap-2">
                      <span>{TOOL_TYPE_LABEL[t.type]}</span>
                      <span>φ{t.diameter}</span>
                      {usage && (
                        <span className="ml-auto font-mono">
                          {usage.processCount} 工程 / 最大 VB{' '}
                          {usage.maxVB !== null ? usage.maxVB.toFixed(2) : '—'}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* 右: 選択工具の詳細 */}
        <section className="flex-1 overflow-auto p-4" aria-label="工具詳細">
          {!selectedTool ? (
            <div className="text-[var(--text-lo)] p-6">
              左のリストから工具を選ぶと、摩耗推移と直近プロセスが表示されます。
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="text-lg font-bold font-mono">{selectedTool.code}</h2>
                <span className="text-[13px] text-[var(--text-md)]">{selectedTool.name}</span>
                <span className="text-[11px] text-[var(--text-lo)] ml-auto">
                  {TOOL_TYPE_LABEL[selectedTool.type]} / φ{selectedTool.diameter} /{' '}
                  {selectedTool.material}
                  {selectedTool.coating ? ` / ${selectedTool.coating}` : ''}
                </span>
              </div>

              {/* KPI */}
              {(() => {
                const usage = usageByTool.get(selectedTool.id);
                return (
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
                  >
                    <div className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
                      <div className="text-[11px] text-[var(--text-lo)]">実施プロセス</div>
                      <div className="font-mono text-xl font-semibold">
                        {usage?.processCount ?? 0}
                      </div>
                    </div>
                    <div className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
                      <div className="text-[11px] text-[var(--text-lo)]">累積切削距離</div>
                      <div className="font-mono text-xl font-semibold">
                        {usage?.totalDistanceMm.toLocaleString() ?? 0}
                        <span className="text-[11px] font-normal text-[var(--text-lo)] ml-1">
                          mm
                        </span>
                      </div>
                    </div>
                    <div className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
                      <div className="text-[11px] text-[var(--text-lo)]">最大 VB</div>
                      <div
                        className="font-mono text-xl font-semibold"
                        style={{
                          color:
                            usage && usage.maxVB !== null && usage.maxVB >= WEAR_LIMIT
                              ? 'var(--err, #dc2626)'
                              : undefined,
                        }}
                      >
                        {usage?.maxVB !== undefined && usage.maxVB !== null
                          ? usage.maxVB.toFixed(3)
                          : '—'}
                        <span className="text-[11px] font-normal text-[var(--text-lo)] ml-1">
                          mm
                        </span>
                      </div>
                    </div>
                    <div className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
                      <div className="text-[11px] text-[var(--text-lo)]">びびり検出</div>
                      <div className="font-mono text-xl font-semibold">
                        {usage?.chatterCount ?? 0}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 推奨母材 */}
              {selectedTool.applicableMaterials.length > 0 && (
                <div className="text-[12px] text-[var(--text-md)]">
                  <span className="text-[11px] text-[var(--text-lo)] mr-2">推奨母材:</span>
                  {selectedTool.applicableMaterials
                    .map((id) => materialsQ.data?.get(id)?.designation ?? id)
                    .join(' / ')}
                </div>
              )}

              {/* VB チャート */}
              <section
                aria-label="VB 進展チャート"
                className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[13px] font-semibold">摩耗 VB 進展</h3>
                  <span className="text-[11px] text-[var(--text-lo)]">
                    累積切削距離 × VB、赤破線 = 摩耗限界 (VB={WEAR_LIMIT}mm)
                  </span>
                </div>
                <VBChart series={wearSeries} limit={WEAR_LIMIT} />
              </section>

              {/* Taylor 寿命予測 */}
              <section
                aria-label="Taylor 工具寿命予測"
                className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[13px] font-semibold">Taylor 工具寿命予測</h3>
                  <span className="text-[11px] text-[var(--text-lo)]">
                    V·T^n = C
                  </span>
                </div>
                <TaylorPredictionPanel
                  tool={selectedTool}
                  processes={processesQ.data ?? []}
                />
              </section>

              {/* 直近プロセス */}
              <section aria-label="直近プロセス">
                <h3 className="text-[13px] font-semibold mb-2">直近プロセス</h3>
                {recentProcesses.length === 0 ? (
                  <div className="text-[12px] text-[var(--text-lo)]">
                    まだこの工具は使用されていません。
                  </div>
                ) : (
                  <div className="overflow-auto border border-[var(--border-faint)] rounded-lg">
                    <table className="w-full text-[12px]">
                      <thead className="bg-[var(--bg-raised)]">
                        <tr className="text-left border-b border-[var(--border-faint)]">
                          <th className="px-3 py-1.5 font-semibold">コード</th>
                          <th className="px-3 py-1.5 font-semibold">操作</th>
                          <th className="px-3 py-1.5 font-semibold">母材</th>
                          <th className="px-3 py-1.5 font-semibold text-right">Vc</th>
                          <th className="px-3 py-1.5 font-semibold text-right">f</th>
                          <th className="px-3 py-1.5 font-semibold text-right">距離</th>
                          <th className="px-3 py-1.5 font-semibold text-right">VB</th>
                          <th className="px-3 py-1.5 font-semibold">びびり</th>
                          <th className="px-3 py-1.5 font-semibold text-right">実施日</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProcesses.map((p) => {
                          const overVB = p.toolWearVB !== null && p.toolWearVB >= WEAR_LIMIT;
                          const material = materialsQ.data?.get(p.materialId);
                          return (
                            <tr key={p.id} className="border-b border-[var(--border-faint)]">
                              <td className="px-3 py-1 font-mono">{p.code}</td>
                              <td className="px-3 py-1 text-[11px]">{p.operation}</td>
                              <td className="px-3 py-1 font-mono text-[11px]">
                                {material?.designation ?? p.materialId}
                              </td>
                              <td className="px-3 py-1 font-mono text-right">
                                {p.condition.cuttingSpeed.toFixed(0)}
                              </td>
                              <td className="px-3 py-1 font-mono text-right">
                                {p.condition.feed.toFixed(3)}
                              </td>
                              <td className="px-3 py-1 font-mono text-right">
                                {p.cuttingDistanceMm.toLocaleString()}
                              </td>
                              <td
                                className="px-3 py-1 font-mono text-right"
                                style={{
                                  color: overVB ? 'var(--err, #dc2626)' : undefined,
                                }}
                              >
                                {p.toolWearVB !== null ? p.toolWearVB.toFixed(3) : '—'}
                              </td>
                              <td className="px-3 py-1 text-[11px]">
                                {p.chatterDetected === true ? '⚠️' : ''}
                              </td>
                              <td className="px-3 py-1 font-mono text-right text-[11px]">
                                {p.performedAt.slice(0, 10)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export { TOOL_TYPE_LABEL };
