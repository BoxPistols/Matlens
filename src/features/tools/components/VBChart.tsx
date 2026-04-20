// VB 進展チャート。累積加工距離 × 工具摩耗 VB をプロットし、
// VB=0.3mm を摩耗限界の水平破線で示す。純 SVG 自作。

import type { WearPoint } from '../api';

export interface VBChartProps {
  series: WearPoint[];
  limit?: number; // 摩耗限界 (mm)
}

const PAD = { top: 12, right: 12, bottom: 32, left: 48 };

export const VBChart = ({ series, limit = 0.3 }: VBChartProps) => {
  const width = 640;
  const height = 260;
  const plotX0 = PAD.left;
  const plotX1 = width - PAD.right;
  const plotY0 = PAD.top;
  const plotY1 = height - PAD.bottom;

  if (series.length === 0) {
    return (
      <div className="text-[12px] text-[var(--text-lo)] p-4">
        VB 測定済の加工プロセスがありません。
      </div>
    );
  }

  const xs = series.map((s) => s.cumulativeDistanceMm);
  const ys = series.map((s) => s.toolWearVB);
  const xMax = Math.max(...xs, 1);
  const yMax = Math.max(...ys, limit) * 1.1;
  const xScale = (v: number) => plotX0 + (v / xMax) * (plotX1 - plotX0);
  const yScale = (v: number) => plotY1 - (v / yMax) * (plotY1 - plotY0);

  const pathD = series
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.cumulativeDistanceMm).toFixed(1)} ${yScale(p.toolWearVB).toFixed(1)}`)
    .join(' ');

  const xTicks = Array.from({ length: 5 }, (_, i) => (xMax / 4) * i);
  const yTicks = Array.from({ length: 5 }, (_, i) => (yMax / 4) * i);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="工具摩耗 VB 進展チャート"
      style={{ maxHeight: 320 }}
    >
      <rect
        x={plotX0}
        y={plotY0}
        width={plotX1 - plotX0}
        height={plotY1 - plotY0}
        fill="var(--bg-base, transparent)"
        stroke="var(--border-faint, #334155)"
      />

      {/* 水平グリッド + y 軸ラベル */}
      {yTicks.map((t, i) => {
        const y = yScale(t);
        return (
          <g key={`gy-${i}`}>
            <line
              x1={plotX0}
              y1={y}
              x2={plotX1}
              y2={y}
              stroke="var(--border-faint, #1e293b)"
              strokeDasharray="2 3"
              opacity={0.35}
            />
            <text
              x={plotX0 - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--text-lo, #94a3b8)"
            >
              {t.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* 垂直グリッド + x 軸ラベル */}
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

      {/* 折れ線 */}
      <path
        d={pathD}
        stroke="var(--accent, #2563eb)"
        strokeWidth={1.5}
        fill="none"
      />

      {/* 点 */}
      {series.map((p) => {
        const over = p.toolWearVB >= limit;
        return (
          <circle
            key={p.processId}
            cx={xScale(p.cumulativeDistanceMm)}
            cy={yScale(p.toolWearVB)}
            r={p.chatter ? 4 : 3}
            fill={over ? 'rgba(220,38,38,0.85)' : 'rgba(37,99,235,0.85)'}
            stroke={p.chatter ? 'var(--warn, #f59e0b)' : 'transparent'}
            strokeWidth={p.chatter ? 1.2 : 0}
          >
            <title>{`${p.processId}\ndistance=${p.cumulativeDistanceMm.toFixed(0)} mm\nVB=${p.toolWearVB.toFixed(3)} mm\n${p.performedAt.slice(0, 10)}${p.chatter ? '\n(びびり検出)' : ''}`}</title>
          </circle>
        );
      })}
    </svg>
  );
};
