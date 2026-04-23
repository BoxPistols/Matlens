// 受託試験 PoC ダッシュボード (#/ops-dash)
// KPI ヘッダ / 納期リスク一覧 / 活動タイムライン の 3 ブロック構成。

import { useMemo } from 'react';
import { KpiCard } from '@/components/molecules';
import {
  useAllCuttingProcesses,
  useAllDamages,
  useAllProjects,
  useAllSpecimens,
  useAllTests,
  useAllTools,
  useCustomersIndex,
} from './api';
import {
  buildActivityTimeline,
  collectDueRisk,
  computeCuttingKpi,
  computeOpsKpi,
} from './utils/opsMetrics';

interface OpsDashboardPageProps {
  onNav?: (page: string) => void;
  /**
   * KPI の基準時刻。テストやモック環境で固定値を注入するために使う。
   * 省略時は実行時の現在時刻（`new Date()`）。
   * 現在のモック fixture に合わせて固定で見たい場合は `new Date('2026-04-20T00:00:00+09:00')` を渡す。
   */
  referenceNow?: Date;
}

export const OpsDashboardPage = ({ onNav, referenceNow }: OpsDashboardPageProps) => {
  const projectsQ = useAllProjects();
  const specimensQ = useAllSpecimens();
  const testsQ = useAllTests();
  const damagesQ = useAllDamages();
  // 切削 KPI 用。取得失敗でも受託試験側 KPI / 納期リスク / タイムラインはブロックしない設計。
  const toolsQ = useAllTools();
  const cuttingProcessesQ = useAllCuttingProcesses();
  // 顧客名はリスク行の表示のみに使う副次情報。取得失敗でもダッシュボード全体はブロックしない。
  const customersQ = useCustomersIndex();

  const isLoading =
    projectsQ.isLoading ||
    specimensQ.isLoading ||
    testsQ.isLoading ||
    damagesQ.isLoading;
  const isError =
    projectsQ.isError ||
    specimensQ.isError ||
    testsQ.isError ||
    damagesQ.isError;

  const now = useMemo(() => referenceNow ?? new Date(), [referenceNow]);

  const kpi = useMemo(() => {
    if (!projectsQ.data || !specimensQ.data || !testsQ.data || !damagesQ.data) {
      return null;
    }
    return computeOpsKpi({
      projects: projectsQ.data,
      specimens: specimensQ.data,
      tests: testsQ.data,
      damages: damagesQ.data,
      now,
    });
  }, [projectsQ.data, specimensQ.data, testsQ.data, damagesQ.data, now]);

  // 切削 KPI は toolsQ / cuttingProcessesQ 両方揃ったときのみ算出。
  // どちらか取得失敗でも null のままで、UI 側で「切削データなし」と表示する。
  const cuttingKpi = useMemo(() => {
    if (!toolsQ.data || !cuttingProcessesQ.data) return null;
    return computeCuttingKpi({
      tools: toolsQ.data,
      cuttingProcesses: cuttingProcessesQ.data,
      now,
    });
  }, [toolsQ.data, cuttingProcessesQ.data, now]);

  const dueRisk = useMemo(() => {
    if (!projectsQ.data) return [];
    return collectDueRisk(projectsQ.data, now, 7);
  }, [projectsQ.data, now]);

  const activity = useMemo(() => {
    if (!testsQ.data || !damagesQ.data) return [];
    return buildActivityTimeline(testsQ.data, damagesQ.data, 20);
  }, [testsQ.data, damagesQ.data]);

  if (isError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        ダッシュボードの読み込みに失敗しました。時間をおいて再度お試しください。
      </div>
    );
  }

  if (isLoading || !kpi) {
    return (
      <div className="p-6 text-[var(--text-lo)]">
        ダッシュボードを読み込んでいます…
      </div>
    );
  }

  const abnormalPercent = (kpi.abnormalFindingRatio * 100).toFixed(1);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">受託試験 ダッシュボード</h1>
          <span className="text-[11px] text-[var(--text-lo)]">Ops Dashboard (PoC)</span>
        </div>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          進行中案件・期限の迫る試験片・最近の試験活動を一画面で俯瞰します。
        </p>
      </header>

      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
        {/* KPI */}
        <section aria-label="主要 KPI">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
          >
            <KpiCard
              label="進行中案件"
              value={kpi.activeProjects}
              delta={`全 ${kpi.totalProjects} 件中`}
            />
            <KpiCard
              label="要アクションの試験片"
              value={kpi.pendingSpecimens}
              delta="進行中案件の 受入 / 準備 中"
              color="var(--accent, #2563eb)"
            />
            <KpiCard
              label="過去 30 日の完了試験"
              value={kpi.completedTestsLast30Days}
            />
            <KpiCard
              label="異常所見比率"
              value={`${abnormalPercent}%`}
              delta="低確信度以外の損傷所見 / 完了試験"
              color={
                kpi.abnormalFindingRatio > 0.5
                  ? 'var(--err, #dc2626)'
                  : 'var(--ok, #22c55e)'
              }
            />
            {cuttingKpi && (
              <>
                <KpiCard
                  label="工具寿命アラート"
                  value={cuttingKpi.toolsOverWearLimit}
                  delta={`全 ${cuttingKpi.totalTools} 工具中・VB ≥ 0.3 mm`}
                  color={
                    cuttingKpi.toolsOverWearLimit > 0
                      ? 'var(--warn, #d97706)'
                      : 'var(--ok, #22c55e)'
                  }
                />
                <KpiCard
                  label="びびり検出率 (30日)"
                  value={`${(cuttingKpi.chatterRatioLast30Days * 100).toFixed(1)}%`}
                  delta={
                    cuttingKpi.evaluatedCuttingProcessesLast30Days > 0
                      ? `評価済 ${cuttingKpi.evaluatedCuttingProcessesLast30Days} 件の切削`
                      : '評価済データなし'
                  }
                  color={
                    cuttingKpi.chatterRatioLast30Days > 0.3
                      ? 'var(--warn, #d97706)'
                      : 'var(--ok, #22c55e)'
                  }
                />
              </>
            )}
          </div>
        </section>

        {/* 納期リスク */}
        <section
          aria-label="納期リスク"
          className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-[14px] font-semibold">納期リスク（7 日以内）</h2>
            <span className="text-[11px] text-[var(--text-lo)] tabular-nums">
              {dueRisk.length} 件
            </span>
          </div>
          {dueRisk.length === 0 ? (
            <div className="text-[12px] text-[var(--text-lo)]">
              リスクのある案件はありません。
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {dueRisk.slice(0, 10).map(({ project, daysLeft }) => {
                const overdue = daysLeft < 0;
                const customer = customersQ.data?.get(project.customerId);
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => onNav?.(`pjdetail_${project.id}`)}
                      className="w-full text-left flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[var(--hover)] text-[12px] focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)]"
                    >
                      <span
                        className="inline-block rounded-full font-mono text-[11px] px-2 py-0.5 tabular-nums"
                        style={{
                          background: overdue
                            ? 'rgba(239,68,68,0.14)'
                            : 'rgba(245,158,11,0.14)',
                          color: overdue
                            ? 'var(--err, #dc2626)'
                            : 'var(--warn, #d97706)',
                        }}
                      >
                        {overdue ? `${Math.abs(daysLeft)} 日遅延` : `残 ${daysLeft} 日`}
                      </span>
                      <span className="font-mono text-[12px]">{project.code}</span>
                      <span className="flex-1 truncate">{project.title}</span>
                      {customer && (
                        <span className="text-[11px] text-[var(--text-lo)]">
                          {customer.name}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-[var(--text-lo)]">
                        {project.dueAt}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 活動タイムライン */}
        <section
          aria-label="活動タイムライン"
          className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-[14px] font-semibold">最新の活動</h2>
            <span className="text-[11px] text-[var(--text-lo)]">直近 {activity.length} 件</span>
          </div>
          {activity.length === 0 ? (
            <div className="text-[12px] text-[var(--text-lo)]">
              活動はまだ記録されていません。
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {activity.map((ev) => (
                <li
                  key={`${ev.kind}-${ev.id}`}
                  className="flex items-baseline gap-3 text-[12px] py-1"
                >
                  <span className="font-mono text-[10px] text-[var(--text-lo)] tabular-nums min-w-[120px]">
                    {ev.timestamp.slice(0, 16).replace('T', ' ')}
                  </span>
                  <span
                    className="inline-block w-2 h-2 rounded-full mt-1.5"
                    style={{
                      background:
                        ev.kind === 'test_completed'
                          ? 'var(--ok, #22c55e)'
                          : 'var(--warn, #f59e0b)',
                    }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{ev.primary}</div>
                    <div className="text-[11px] text-[var(--text-lo)] truncate">
                      {ev.secondary}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
