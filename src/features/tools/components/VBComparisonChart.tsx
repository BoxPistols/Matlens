// 複数工具の VB 進展を 1 枚に重ね描きする比較チャート（純 SVG）。
// 軸スケールは全シリーズの最大値で統一し、シリーズごとに色を割り当てる。
//
// VBChart と分けた理由:
// - VBChart は単一シリーズ専用で軸ロジックが内包されている
// - 比較は色凡例 + 軸スケール統一が必須なので、別コンポーネントの方が
//   読み手にとって責務が明確になる

import type { WearPoint } from '../api';

export interface VBComparisonSeries {
  toolId: string;
  toolCode: string;
  points: WearPoint[];
}

export interface VBComparisonChartProps {
  series: VBComparisonSeries[];
  /** VB 摩耗限界。横破線で表示 */
  limit?: number;
}

const PAD = { top: 12, right: 12, bottom: 36, left: 48 };

// 緑/橙/紫/ピンク/青緑/青 の 6 色サイクル。色覚多様性に配慮しつつ十分な差をつける。
const SERIES_COLORS = [
  '#22c55e', // green-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#3b82f6', // blue-500
];

export const VBComparisonChart = ({ series, limit = 0.3 }: VBComparisonChartProps) => {
  const allPoints = series.flatMap((s) => s.points);
  const width = 720;
  const height = 320;
  const plotX0 = PAD.left;
  const plotX1 = width - PAD.right;
  const plotY0 = PAD.top;
  const plotY1 = height - PAD.bottom;

  if (allPoints.length === 0) {
    return (
      <div className="text-[12px] text-[var(--text-lo)] p-4">
        比較対象の VB 測定データがありません。
      </div>
    );
  }

  const xMax = Math.max(...allPoints.map((p) => p.cumulativeDistanceMm), 1);
  const yMax = Math.max(...allPoints.map((p) => p.toolWearVB), limit) * 1.1;
  const xScale = (v: number) => plotX0 + (v / xMax) * (plotX1 - plotX0);
  const yScale = (v: number) => plotY1 - (v / yMax) * (plotY1 - plotY0);

  const xTicks = Array.from({ length: 5 }, (_, i) => (xMax / 4) * i);
  const yTicks = Array.from({ length: 5 }, (_, i) => (yMax / 4) * i);

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="複数工具の VB 進展比較チャート"
        style={{ maxHeight: 380 }}
      >
        <rect
          x={plotX0}
          y={plotY0}
          width={plotX1 - plotX0}
          height={plotY1 - plotY0}
          fill="var(--bg-base, transparent)"
          stroke="var(--border-faint, #334155)"
        />

        {/* y 軸グリッド + ラベル */}
        {yTicks.map((t, i) => (
          <g key={`gy-${i}`}>
            <line
              x1={plotX0}
              y1={yScale(t)}
              x2={plotX1}
              y2={yScale(t)}
              stroke="var(--border-faint, #1e293b)"
              strokeDasharray="2 3"
              opacity={0.35}
            />
            <text
              x={plotX0 - 6}
              y={yScale(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--text-lo, #94a3b8)"
            >
              {t.toFixed(2)}
            </text>
          </g>
        ))}

        {/* x 軸グリッド + ラベル */}
        {xTicks.map((t, i) => {
          const x = xScale(t);
          const label = t >= 10000 ? `${(t / 1000).toFixed(0)}k` : t.toFixed(0);
          return (
            <g key={`gx-${i}`}>
              <line
                x1={x}
                y1={plotY0}
                x2={x}
                y2={plotY1}
                stroke="var(--border-faint, #1e293b)"
                strokeDasharray="2 3"
                opacity={0.35}
              />
              <text
                x={x}
                y={plotY1 + 14}
                textAnchor="middle"
                fontSize={11}
                fill="var(--text-lo, #94a3b8)"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* 軸ラベル */}
        <text
          x={(plotX0 + plotX1) / 2}
          y={height - 4}
          textAnchor="middle"
          fontSize={12}
          fill="var(--text-md, #cbd5e1)"
        >
          累積加工距離 (mm)
        </text>
        <text
          x={12}
          y={(plotY0 + plotY1) / 2}
          textAnchor="middle"
          fontSize={12}
          fill="var(--text-md, #cbd5e1)"
          transform={`rotate(-90 12 ${(plotY0 + plotY1) / 2})`}
        >
          工具摩耗 VB (mm)
        </text>

        {/* 摩耗限界 */}
        {limit > 0 && limit < yMax && (
          <g>
            <line
              x1={plotX0}
              y1={yScale(limit)}
              x2={plotX1}
              y2={yScale(limit)}
              stroke="var(--err, #dc2626)"
              strokeDasharray="6 3"
              opacity={0.8}
            />
            <text
              x={plotX1 - 6}
              y={yScale(limit) - 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--err, #dc2626)"
              opacity={0.9}
            >
              摩耗限界 VB={limit.toFixed(2)} mm
            </text>
          </g>
        )}

        {/* 各シリーズの折れ線 + 点 */}
        {series.map((s, sIdx) => {
          const color = SERIES_COLORS[sIdx % SERIES_COLORS.length]!;
          if (s.points.length === 0) return null;
          const d = s.points
            .map(
              (p, i) =>
                `${i === 0 ? 'M' : 'L'} ${xScale(p.cumulativeDistanceMm).toFixed(1)} ${yScale(p.toolWearVB).toFixed(1)}`,
            )
            .join(' ');
          return (
            <g key={s.toolId} aria-label={`${s.toolCode} の VB シリーズ`}>
              <path d={d} stroke={color} strokeWidth={1.5} fill="none" opacity={0.85} />
              {s.points.map((p) => (
                <circle
                  key={p.processId}
                  cx={xScale(p.cumulativeDistanceMm)}
                  cy={yScale(p.toolWearVB)}
                  r={3}
                  fill={color}
                  opacity={0.9}
                >
                  <title>{`${s.toolCode}\n${p.processId}\nVB=${p.toolWearVB.toFixed(3)} mm @ ${p.cumulativeDistanceMm.toFixed(0)} mm`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>

      {/* 凡例 */}
      <ul className="flex gap-3 flex-wrap text-[11px]" aria-label="工具シリーズ凡例">
        {series.map((s, sIdx) => {
          const color = SERIES_COLORS[sIdx % SERIES_COLORS.length]!;
          return (
            <li key={s.toolId} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: color }}
              />
              <span className="font-mono">{s.toolCode}</span>
              <span className="text-[var(--text-lo)]">({s.points.length} 点)</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
