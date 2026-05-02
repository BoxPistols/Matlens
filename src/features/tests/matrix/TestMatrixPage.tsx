import { useMemo, useState } from 'react';
import type { ID, Test } from '@/domain/types';
import { HeatmapMatrix, materialsToRows, type MatrixValueType, type RowEntry } from './HeatmapMatrix';
import {
  useMaterials,
  useMatrixCustomers,
  useMatrixDamages,
  useMatrixProjects,
  useMatrixSpecimens,
  useMatrixTests,
  useTestMatrix,
  useTestTypes,
} from './api';
import { computeAbnormalCellMap } from './abnormalRatio';
import { computeCustomerTestTypeCells } from './customerMatrix';
import { CellTestList } from './components/CellTestList';
import { MaimlExportModal } from './components/MaimlExportModal';

type RowAxis = 'material' | 'customer';

interface SelectedCell {
  rowId: ID;
  testTypeId: ID;
}

type PeriodPreset = 'all' | 'last6m' | 'last1y';

const PERIOD_PRESETS: { key: PeriodPreset; label: string; labelEn: string; months: number | null }[] = [
  { key: 'all', label: '全期間', labelEn: 'All time', months: null },
  { key: 'last1y', label: '直近 1 年', labelEn: 'Last year', months: 12 },
  { key: 'last6m', label: '直近 6 ヶ月', labelEn: 'Last 6 months', months: 6 },
];

const dateFromForPreset = (preset: PeriodPreset, now: Date = new Date()): string | undefined => {
  const entry = PERIOD_PRESETS.find((p) => p.key === preset);
  if (!entry || entry.months === null) return undefined;
  const from = new Date(now);
  from.setMonth(from.getMonth() - entry.months);
  return from.toISOString().slice(0, 10); // YYYY-MM-DD
};

export const TestMatrixPage = () => {
  const [period, setPeriod] = useState<PeriodPreset>('all');
  const [valueType, setValueType] = useState<MatrixValueType>('count');
  const [rowAxis, setRowAxis] = useState<RowAxis>('material');

  const dateFrom = useMemo(() => dateFromForPreset(period), [period]);
  const query = useMemo(() => {
    return dateFrom ? { dateFrom } : undefined;
  }, [dateFrom]);

  const { data: matrix, isLoading: matrixLoading, isError: matrixError } = useTestMatrix(query);
  const {
    data: testTypes,
    isLoading: testTypesLoading,
    isError: testTypesError,
  } = useTestTypes();
  const {
    data: materials,
    isLoading: materialsLoading,
    isError: materialsError,
  } = useMaterials();

  // 異常率モード / 顧客行軸モード で共通して使う補助クエリ。
  // count モードかつ material 行軸では UI をブロックしない設計。
  const matrixTestsQ = useMatrixTests(dateFrom);
  const matrixDamagesQ = useMatrixDamages();
  const matrixSpecimensQ = useMatrixSpecimens();
  const matrixCustomersQ = useMatrixCustomers();
  const matrixProjectsQ = useMatrixProjects();

  const abnormalMap = useMemo(() => {
    if (valueType !== 'abnormalRatio') return undefined;
    if (!matrixTestsQ.data || !matrixDamagesQ.data || !matrixSpecimensQ.data) return undefined;
    return computeAbnormalCellMap({
      tests: matrixTestsQ.data,
      damages: matrixDamagesQ.data,
      specimens: matrixSpecimensQ.data,
    });
  }, [valueType, matrixTestsQ.data, matrixDamagesQ.data, matrixSpecimensQ.data]);

  // 顧客 × 試験種別のセル集計（顧客行軸モード時のみ使用）
  const customerCells = useMemo(() => {
    if (rowAxis !== 'customer') return undefined;
    if (!matrixTestsQ.data || !matrixSpecimensQ.data || !matrixProjectsQ.data) return undefined;
    return computeCustomerTestTypeCells({
      tests: matrixTestsQ.data,
      specimens: matrixSpecimensQ.data,
      projects: matrixProjectsQ.data,
    });
  }, [rowAxis, matrixTestsQ.data, matrixSpecimensQ.data, matrixProjectsQ.data]);

  const [selected, setSelected] = useState<SelectedCell | null>(null);
  const [exportTests, setExportTests] = useState<Test[] | null>(null);
  const [exportLabel, setExportLabel] = useState('');

  // 選択セルに含まれる試験を抽出（材料軸 / 顧客軸 共通の前計算）
  // - 材料軸: specimen.materialId === selectedRowId
  // - 顧客軸: specimen.projectId → project.customerId === selectedRowId
  const selectedCellTests = useMemo<Test[]>(() => {
    if (!selected) return [];
    if (!matrixTestsQ.data || !matrixSpecimensQ.data) return [];
    const specimensById = new Map(matrixSpecimensQ.data.map((s) => [s.id, s]));
    const projectsById = matrixProjectsQ.data
      ? new Map(matrixProjectsQ.data.map((p) => [p.id, p]))
      : null;
    return matrixTestsQ.data.filter((t) => {
      if (t.testTypeId !== selected.testTypeId) return false;
      const sp = specimensById.get(t.specimenId);
      if (!sp) return false;
      if (rowAxis === 'material') {
        return sp.materialId === selected.rowId;
      }
      if (!projectsById) return false;
      const project = projectsById.get(sp.projectId);
      return project?.customerId === selected.rowId;
    });
  }, [selected, rowAxis, matrixTestsQ.data, matrixSpecimensQ.data, matrixProjectsQ.data]);

  if (matrixError || testTypesError || materialsError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        試験マトリクスの読み込みに失敗しました。時間をおいて再度お試しください。
      </div>
    );
  }

  // 材料行軸は materials + matrix() で描画可能。顧客行軸は customers + customerCells が揃う必要。
  const isCustomerAxisReady =
    rowAxis !== 'customer' || (matrixCustomersQ.data && customerCells);

  if (
    matrixLoading ||
    testTypesLoading ||
    materialsLoading ||
    !matrix ||
    !testTypes ||
    !materials ||
    !isCustomerAxisReady
  ) {
    return (
      <div className="p-6">
        <div className="text-[var(--text-lo)]">試験マトリクスを読み込んでいます…</div>
      </div>
    );
  }

  // 行配列と表示用 cells を行軸で切替
  const rows: RowEntry[] =
    rowAxis === 'customer' && matrixCustomersQ.data
      ? matrixCustomersQ.data.map((c) => ({
          id: c.id,
          primaryLabel: c.name,
          secondaryLabel: undefined,
          axisLabel: '顧客',
        }))
      : materialsToRows(materials);

  const displayCells = rowAxis === 'customer' && customerCells ? customerCells : matrix.cells;
  const rowHeaderLabel = rowAxis === 'customer' ? '顧客 \\ 試験種別' : '材料 \\ 試験種別';

  // 選択セルの解決を行軸に応じて切替
  const selectedRow = selected ? rows.find((r) => r.id === selected.rowId) : null;
  const selectedTestType = selected ? testTypes.find((t) => t.id === selected.testTypeId) : null;
  const selectedCell = selected
    ? displayCells.find(
        (c) => c.materialId === selected.rowId && c.testTypeId === selected.testTypeId
      )
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold">試験マトリクス</h1>
            <p className="text-[13px] text-[var(--text-lo)] mt-1">
              材料 × 試験種別ごとの実績件数を俯瞰し、過去試験の厚み薄さを可視化します。
              0 件の組合せは新規提案の機会として破線で強調されます。
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div
              role="radiogroup"
              aria-label="行軸"
              className="flex gap-1 rounded-md border border-[var(--border-faint)] bg-[var(--bg-raised)] p-1"
            >
              {([
                { key: 'material' as const, label: '材料軸' },
                { key: 'customer' as const, label: '顧客軸' },
              ]).map((a) => {
                const active = rowAxis === a.key;
                return (
                  <button
                    key={a.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setRowAxis(a.key);
                      setSelected(null);
                    }}
                    className={`px-3 py-1 text-[12px] rounded transition-colors ${
                      active
                        ? 'bg-[var(--accent,#2563eb)] text-white font-semibold'
                        : 'text-[var(--text-md)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
            <div
              role="radiogroup"
              aria-label="集計期間"
              className="flex gap-1 rounded-md border border-[var(--border-faint)] bg-[var(--bg-raised)] p-1"
            >
              {PERIOD_PRESETS.map((p) => {
                const active = period === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setPeriod(p.key)}
                    className={`px-3 py-1 text-[12px] rounded transition-colors ${
                      active
                        ? 'bg-[var(--accent,#2563eb)] text-white font-semibold'
                        : 'text-[var(--text-md)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div
              role="radiogroup"
              aria-label="セル値"
              className="flex gap-1 rounded-md border border-[var(--border-faint)] bg-[var(--bg-raised)] p-1"
            >
              {([
                { key: 'count' as const, label: '件数' },
                { key: 'abnormalRatio' as const, label: '異常率' },
              ]).map((v) => {
                const active = valueType === v.key;
                return (
                  <button
                    key={v.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setValueType(v.key)}
                    className={`px-3 py-1 text-[12px] rounded transition-colors ${
                      active
                        ? 'bg-[var(--accent,#2563eb)] text-white font-semibold'
                        : 'text-[var(--text-md)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-6 overflow-auto">
          <HeatmapMatrix
            rows={rows}
            testTypes={testTypes}
            cells={displayCells}
            valueType={valueType}
            abnormalMap={abnormalMap}
            rowHeaderLabel={rowHeaderLabel}
            onCellClick={(rowId, testTypeId) => setSelected({ rowId, testTypeId })}
          />
          <div className="mt-4 flex items-center gap-4 text-[11px] text-[var(--text-lo)]">
            <span>件数の多寡を青の濃淡で表示。異常率モードは赤系。</span>
            <span>
              合計 {displayCells.reduce((sum, c) => sum + c.count, 0)} 件 /{' '}
              {rowAxis === 'customer' ? '顧客' : '材料'} {rows.length} 種 × 試験種別{' '}
              {testTypes.length} 種
            </span>
          </div>
        </div>
        <aside
          className="w-80 border-l border-[var(--border-faint)] p-4 overflow-auto bg-[var(--bg-raised)]"
          aria-label="選択セル詳細"
        >
          {!selected || !selectedRow || !selectedTestType ? (
            <div className="text-[13px] text-[var(--text-lo)]">
              セルをクリックすると、その組合せの実績詳細が表示されます。
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-[13px]">
              <div>
                <div className="text-[11px] text-[var(--text-lo)]">{selectedRow.axisLabel}</div>
                <div className="font-mono font-semibold">{selectedRow.primaryLabel}</div>
                {selectedRow.secondaryLabel && (
                  <div className="text-[11px] text-[var(--text-lo)]">{selectedRow.secondaryLabel}</div>
                )}
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-lo)]">試験種別</div>
                <div className="font-semibold">{selectedTestType.name}</div>
                <div className="text-[11px] text-[var(--text-lo)]">{selectedTestType.nameEn}</div>
              </div>
              <div className="border-t border-[var(--border-faint)] pt-3">
                <div className="text-[11px] text-[var(--text-lo)]">実績件数</div>
                <div className="font-mono text-2xl font-bold">{selectedCell?.count ?? 0}</div>
              </div>
              {selectedCell && selectedCell.count > 0 && (
                <>
                  {selectedCell.latestPerformedAt && (
                    <div>
                      <div className="text-[11px] text-[var(--text-lo)]">直近実施</div>
                      <div className="font-mono text-[12px]">
                        {new Date(selectedCell.latestPerformedAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  )}
                  {selectedCell.representativeTemperature !== null && (
                    <div>
                      <div className="text-[11px] text-[var(--text-lo)]">代表温度</div>
                      <div className="font-mono text-[12px]">
                        {selectedCell.representativeTemperature} ℃
                      </div>
                    </div>
                  )}
                  {selectedCell.atmospheres.length > 0 && (
                    <div>
                      <div className="text-[11px] text-[var(--text-lo)]">雰囲気</div>
                      <div className="flex gap-1 flex-wrap">
                        {selectedCell.atmospheres.map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 text-[11px] rounded border border-[var(--border-faint)]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {(!selectedCell || selectedCell.count === 0) && (
                <div className="text-[12px] text-[var(--text-lo)] italic">
                  この組合せの過去試験はまだありません。新規提案の機会です。
                </div>
              )}
              {selectedCell && selectedCell.count > 0 && (
                <div className="border-t border-[var(--border-faint)] pt-3">
                  <CellTestList
                    tests={selectedCellTests}
                    specimens={matrixSpecimensQ.data ?? []}
                    damages={matrixDamagesQ.data ?? []}
                    onExportSingle={(testId) => {
                      const t = selectedCellTests.find((x) => x.id === testId);
                      if (!t) return;
                      setExportTests([t]);
                      setExportLabel(
                        `${selectedRow.primaryLabel} × ${selectedTestType.name} / ${testId}`,
                      );
                    }}
                    onExportAll={() => {
                      setExportTests(selectedCellTests);
                      setExportLabel(
                        `${selectedRow.primaryLabel} × ${selectedTestType.name} (${selectedCellTests.length} 件)`,
                      );
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
      <MaimlExportModal
        tests={exportTests}
        label={exportLabel}
        allSpecimens={matrixSpecimensQ.data ?? []}
        allDamages={matrixDamagesQ.data ?? []}
        onClose={() => setExportTests(null)}
      />
    </div>
  );
};
