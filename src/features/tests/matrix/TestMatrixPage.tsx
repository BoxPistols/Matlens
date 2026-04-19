import { useState } from 'react';
import type { ID } from '@/domain/types';
import { HeatmapMatrix } from './HeatmapMatrix';
import { useMaterials, useTestMatrix, useTestTypes } from './api';

interface SelectedCell {
  materialId: ID;
  testTypeId: ID;
}

export const TestMatrixPage = () => {
  const { data: matrix, isLoading: matrixLoading, isError: matrixError } = useTestMatrix();
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
  const [selected, setSelected] = useState<SelectedCell | null>(null);

  if (matrixError || testTypesError || materialsError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        試験マトリクスの読み込みに失敗しました。時間をおいて再度お試しください。
      </div>
    );
  }

  if (
    matrixLoading ||
    testTypesLoading ||
    materialsLoading ||
    !matrix ||
    !testTypes ||
    !materials
  ) {
    return (
      <div className="p-6">
        <div className="text-[var(--text-lo)]">試験マトリクスを読み込んでいます…</div>
      </div>
    );
  }

  const selectedMaterial = selected ? materials.find((m) => m.id === selected.materialId) : null;
  const selectedTestType = selected ? testTypes.find((t) => t.id === selected.testTypeId) : null;
  const selectedCell = selected
    ? matrix.cells.find(
        (c) => c.materialId === selected.materialId && c.testTypeId === selected.testTypeId
      )
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <h1 className="text-xl font-bold">試験マトリクス</h1>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          材料 × 試験種別ごとの実績件数を俯瞰し、過去試験の厚み薄さを可視化します。
        </p>
      </header>
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-6 overflow-auto">
          <HeatmapMatrix
            materials={materials}
            testTypes={testTypes}
            cells={matrix.cells}
            onCellClick={(materialId, testTypeId) => setSelected({ materialId, testTypeId })}
          />
          <div className="mt-4 flex items-center gap-4 text-[11px] text-[var(--text-lo)]">
            <span>件数の多寡を青の濃淡で表示。</span>
            <span>
              合計 {matrix.cells.reduce((sum, c) => sum + c.count, 0)} 件 / 材料 {materials.length}{' '}
              種 × 試験種別 {testTypes.length} 種
            </span>
          </div>
        </div>
        <aside
          className="w-80 border-l border-[var(--border-faint)] p-4 overflow-auto bg-[var(--bg-raised)]"
          aria-label="選択セル詳細"
        >
          {!selected || !selectedMaterial || !selectedTestType ? (
            <div className="text-[13px] text-[var(--text-lo)]">
              セルをクリックすると、その組合せの実績詳細が表示されます。
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-[13px]">
              <div>
                <div className="text-[11px] text-[var(--text-lo)]">材料</div>
                <div className="font-mono font-semibold">{selectedMaterial.designation}</div>
                <div className="text-[11px] text-[var(--text-lo)]">
                  {selectedMaterial.category}
                </div>
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
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
