import type { Material, TestType, ID } from '@/domain/types';
import type { MatrixCell } from '@/infra/repositories/interfaces';
import type { AbnormalCell } from './abnormalRatio';

export type MatrixValueType = 'count' | 'abnormalRatio';

export interface HeatmapMatrixProps {
  materials: Material[];
  testTypes: TestType[];
  cells: MatrixCell[];
  onCellClick?: (materialId: ID, testTypeId: ID) => void;
  /** セル値の表示モード。既定 'count'。 */
  valueType?: MatrixValueType;
  /** 異常率モード時の補助マップ。count モードでは不要。 */
  abnormalMap?: Map<string, AbnormalCell>;
}

const cellKey = (materialId: ID, testTypeId: ID) => `${materialId}__${testTypeId}`;

const colorForCount = (count: number, max: number): string => {
  if (count === 0) return 'transparent';
  const ratio = Math.min(1, count / Math.max(1, max));
  // 青系階調 (Tailwind blue-100 → blue-700 に近い)
  const alpha = 0.15 + ratio * 0.7;
  return `rgba(37, 99, 235, ${alpha.toFixed(3)})`;
};

const textColorForCount = (count: number, max: number): string => {
  if (count === 0) return 'var(--text-lo, #94a3b8)';
  const ratio = Math.min(1, count / Math.max(1, max));
  return ratio > 0.5 ? '#ffffff' : 'var(--text-hi, #0f172a)';
};

// 異常率用: 0..1 を赤系のグラデーションで表現（低=透明、高=赤）
const colorForRatio = (ratio: number): string => {
  if (ratio <= 0) return 'transparent';
  const alpha = 0.15 + ratio * 0.7;
  return `rgba(220, 38, 38, ${alpha.toFixed(3)})`;
};

const textColorForRatio = (ratio: number): string => {
  if (ratio <= 0) return 'var(--text-lo, #94a3b8)';
  return ratio > 0.5 ? '#ffffff' : 'var(--text-hi, #0f172a)';
};

const formatRatio = (ratio: number): string => `${(ratio * 100).toFixed(0)}%`;

export const HeatmapMatrix = ({
  materials,
  testTypes,
  cells,
  onCellClick,
  valueType = 'count',
  abnormalMap,
}: HeatmapMatrixProps) => {
  const cellMap = new Map<string, MatrixCell>();
  cells.forEach((c) => cellMap.set(cellKey(c.materialId, c.testTypeId), c));

  const maxCount = cells.reduce((m, c) => Math.max(m, c.count), 0);
  const rowTotals = new Map<ID, number>();
  const colTotals = new Map<ID, number>();
  cells.forEach((c) => {
    rowTotals.set(c.materialId, (rowTotals.get(c.materialId) ?? 0) + c.count);
    colTotals.set(c.testTypeId, (colTotals.get(c.testTypeId) ?? 0) + c.count);
  });

  return (
    <div className="overflow-auto border border-[var(--border-faint)] rounded-lg bg-[var(--bg-raised,transparent)]">
      <table className="w-full border-collapse text-[12px]" aria-label="試験マトリクス">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 top-0 z-20 bg-[var(--bg-raised)] border-b border-r border-[var(--border-faint)] px-3 py-2 text-left font-semibold"
              style={{ minWidth: 180 }}
            >
              材料 \ 試験種別
            </th>
            {testTypes.map((tt) => (
              <th
                key={tt.id}
                scope="col"
                className="sticky top-0 z-10 bg-[var(--bg-raised)] border-b border-[var(--border-faint)] px-2 py-2 text-[11px] font-semibold whitespace-nowrap"
                style={{ minWidth: 72 }}
                title={`${tt.name} (${tt.nameEn})`}
              >
                <div className="rotate-[-20deg] origin-left inline-block">{tt.name}</div>
              </th>
            ))}
            <th
              scope="col"
              className="sticky top-0 right-0 z-10 bg-[var(--bg-raised)] border-b border-l border-[var(--border-faint)] px-2 py-2 font-semibold"
              style={{ minWidth: 60 }}
            >
              計
            </th>
          </tr>
        </thead>
        <tbody>
          {materials.map((mat) => (
            <tr key={mat.id}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-[var(--bg-raised)] border-b border-r border-[var(--border-faint)] px-3 py-2 text-left font-medium whitespace-nowrap"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-[12px]">{mat.designation}</span>
                  <span className="text-[10px] text-[var(--text-lo)]">{mat.category}</span>
                </div>
              </th>
              {testTypes.map((tt) => {
                const cell = cellMap.get(cellKey(mat.id, tt.id));
                const count = cell?.count ?? 0;
                const isEmpty = count === 0;
                const abnormal = abnormalMap?.get(cellKey(mat.id, tt.id));
                const isAbnormalMode = valueType === 'abnormalRatio';
                const ratio = abnormal?.ratio ?? 0;

                const displayText = isAbnormalMode
                  ? isEmpty
                    ? '·'
                    : formatRatio(ratio)
                  : count > 0
                    ? String(count)
                    : '·';

                const background = isAbnormalMode && !isEmpty
                  ? colorForRatio(ratio)
                  : colorForCount(count, maxCount);

                const textColor = isAbnormalMode && !isEmpty
                  ? textColorForRatio(ratio)
                  : textColorForCount(count, maxCount);

                const ariaLabel = isEmpty
                  ? `${mat.designation} × ${tt.name}: 未経験の組合せ（新規提案候補）`
                  : isAbnormalMode && abnormal
                    ? `${mat.designation} × ${tt.name}: 異常率 ${formatRatio(ratio)}（${abnormal.abnormalCount} / ${abnormal.totalCount}）`
                    : `${mat.designation} × ${tt.name}: ${count}件`;

                return (
                  <td
                    key={tt.id}
                    className="border-b border-[var(--border-faint)] p-0 text-center"
                  >
                    <button
                      type="button"
                      onClick={() => onCellClick?.(mat.id, tt.id)}
                      aria-label={ariaLabel}
                      data-empty-cell={isEmpty ? 'true' : undefined}
                      className={
                        'w-full h-full min-h-[34px] px-1 py-1 font-mono tabular-nums transition-colors hover:outline hover:outline-2 hover:outline-[var(--accent,#2563eb)]' +
                        (isEmpty
                          ? ' outline outline-1 outline-dashed outline-[var(--warn,#d97706)] -outline-offset-2'
                          : '')
                      }
                      style={{
                        background,
                        color: textColor,
                      }}
                    >
                      {displayText}
                    </button>
                  </td>
                );
              })}
              <td className="sticky right-0 bg-[var(--bg-raised)] border-b border-l border-[var(--border-faint)] px-2 py-2 text-right font-mono tabular-nums font-semibold">
                {rowTotals.get(mat.id) ?? 0}
              </td>
            </tr>
          ))}
          <tr>
            <th
              scope="row"
              className="sticky left-0 z-10 bg-[var(--bg-raised)] border-t border-r border-[var(--border-faint)] px-3 py-2 text-left font-semibold"
            >
              計
            </th>
            {testTypes.map((tt) => (
              <td
                key={tt.id}
                className="border-t border-[var(--border-faint)] px-1 py-2 text-center font-mono tabular-nums font-semibold"
              >
                {colTotals.get(tt.id) ?? 0}
              </td>
            ))}
            <td className="sticky right-0 bg-[var(--bg-raised)] border-t border-l border-[var(--border-faint)] px-2 py-2 text-right font-mono tabular-nums font-bold">
              {cells.reduce((sum, c) => sum + c.count, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
