// 切削条件 散布図。純 SVG 自作 (依存ゼロ) で描画する。
// - 軸: Vc / f / ap の組合せを切替可能（デフォルト Vc × f で互換維持）
// - 色: びびり / 工具摩耗 VB / 表面粗さ Ra の 3 モードで切替
// - 形状: 冷却方式 MQL → ◇、cryogenic → △、それ以外は ○
// - 選択中の点は強調
// - Stability Lobe の簡易プレースホルダ曲線をオーバーレイ（Vc × f 軸時のみ）

import { useMemo, useRef, useState } from 'react';
import type { CuttingProcess } from '@/domain/types';
import {
  COLOR_MODE_LABEL,
  SCATTER_AXES,
  colorForProcess,
  markerPathD,
  markerShapeFor,
  type ScatterAxisKey,
  type ScatterColorMode,
} from './scatterMappings';

export interface ConditionScatterProps {
  processes: CuttingProcess[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** true のとき Stability Lobe プレースホルダ曲線を重ねる（Vc × f のときのみ有効） */
  showStabilityLobe?: boolean;
  /** X 軸キー（デフォルト Vc）。cuttingSpeed / feed / depthOfCut */
  xAxisKey?: ScatterAxisKey;
  /** Y 軸キー（デフォルト f）。cuttingSpeed / feed / depthOfCut */
  yAxisKey?: ScatterAxisKey;
  /** 色分けモード（デフォルト chatter）。chatter / toolWear / surfaceRoughness */
  colorMode?: ScatterColorMode;
}

const PADDING = { top: 16, right: 24, bottom: 40, left: 56 };

interface AxisScale {
  min: number;
  max: number;
  /** pixel への線形写像 */
  toPx: (value: number) => number;
  /** 目盛り候補 */
  ticks: number[];
}

const makeScale = (
  values: number[],
  range: [number, number],
  tickCount = 5
): AxisScale => {
  const finite = values.filter((v) => Number.isFinite(v));
  const rawMin = finite.length > 0 ? Math.min(...finite) : 0;
  const rawMax = finite.length > 0 ? Math.max(...finite) : 1;
  const min = rawMin === rawMax ? rawMin - 1 : rawMin - (rawMax - rawMin) * 0.05;
  const max = rawMin === rawMax ? rawMax + 1 : rawMax + (rawMax - rawMin) * 0.05;
  const [r0, r1] = range;
  const toPx = (value: number): number =>
    r0 + ((value - min) / (max - min)) * (r1 - r0);
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const t = i / (tickCount - 1);
    return min + (max - min) * t;
  });
  return { min, max, toPx, ticks };
};

const formatTick = (value: number): string => {
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(2);
};

export const ConditionScatter = ({
  processes,
  selectedId,
  onSelect,
  showStabilityLobe = true,
  xAxisKey = 'cuttingSpeed',
  yAxisKey = 'feed',
  colorMode = 'chatter',
}: ConditionScatterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const width = 720;
  const height = 440;
  const plotX0 = PADDING.left;
  const plotX1 = width - PADDING.right;
  const plotY0 = PADDING.top;
  const plotY1 = height - PADDING.bottom;

  const xAxis = SCATTER_AXES[xAxisKey];
  const yAxis = SCATTER_AXES[yAxisKey];

  const { xScale, yScale } = useMemo(() => {
    const x = makeScale(
      processes.map((p) => xAxis.get(p)),
      [plotX0, plotX1]
    );
    const y = makeScale(
      processes.map((p) => yAxis.get(p)),
      [plotY1, plotY0] // y は上下反転
    );
    return { xScale: x, yScale: y };
  }, [processes, xAxis, yAxis, plotX0, plotX1, plotY0, plotY1]);

  // Stability Lobe は Vc × f 平面でのみ意味があるため、それ以外の軸では描画しない。
  const stabilityLobeApplicable =
    xAxisKey === 'cuttingSpeed' && yAxisKey === 'feed';

  // Stability Lobe プレースホルダ: 送りが高いほど許容 Vc が下がる、
  // という定性的な曲線（log 近似）。実装は後続 PR で厳密化する。
  const lobePath = useMemo(() => {
    if (!showStabilityLobe || !stabilityLobeApplicable) return null;
    const samples = 80;
    const vcMin = xScale.min;
    const vcMax = xScale.max;
    const fMin = yScale.min;
    const fMax = yScale.max;
    if (vcMax <= vcMin || fMax <= fMin || !stabilityLobeApplicable) return null;
    const parts: string[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const vc = vcMin + (vcMax - vcMin) * t;
      // 送り許容値: f = fMax * (1 - 0.55 * (vc - vcMin) / (vcMax - vcMin))
      const f = Math.max(fMin, fMax * (1 - 0.55 * t));
      const x = xScale.toPx(vc);
      const y = yScale.toPx(f);
      parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return parts.join(' ');
  }, [xScale, yScale, showStabilityLobe, stabilityLobeApplicable]);

  return (
    <div ref={containerRef} className="w-full overflow-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="切削速度と送りの散布図（びびり有無で色分け）"
        className="block"
        style={{ maxHeight: 520 }}
      >
        {/* 背景 */}
        <rect
          x={plotX0}
          y={plotY0}
          width={plotX1 - plotX0}
          height={plotY1 - plotY0}
          fill="var(--bg-base, transparent)"
          stroke="var(--border-faint, #334155)"
        />

        {/* 格子線 */}
        {xScale.ticks.map((t, i) => {
          const x = xScale.toPx(t);
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
                y={plotY1 + 16}
                textAnchor="middle"
                fontSize={11}
                fill="var(--text-lo, #94a3b8)"
              >
                {formatTick(t)}
              </text>
            </g>
          );
        })}
        {yScale.ticks.map((t, i) => {
          const y = yScale.toPx(t);
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
                x={plotX0 - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill="var(--text-lo, #94a3b8)"
              >
                {formatTick(t)}
              </text>
            </g>
          );
        })}

        {/* 軸ラベル */}
        <text
          x={(plotX0 + plotX1) / 2}
          y={height - 6}
          textAnchor="middle"
          fontSize={12}
          fill="var(--text-md, #cbd5e1)"
        >
          {xAxis.label} ({xAxis.unit})
        </text>
        <text
          x={14}
          y={(plotY0 + plotY1) / 2}
          textAnchor="middle"
          fontSize={12}
          fill="var(--text-md, #cbd5e1)"
          transform={`rotate(-90 14 ${(plotY0 + plotY1) / 2})`}
        >
          {yAxis.label} ({yAxis.unit})
        </text>

        {/* Stability Lobe プレースホルダ曲線 */}
        {lobePath && (
          <g aria-label="安定性ローブ概念曲線">
            <path
              d={lobePath}
              stroke="var(--accent, #2563eb)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              fill="none"
              opacity={0.55}
            />
            <text
              x={plotX1 - 8}
              y={plotY0 + 14}
              textAnchor="end"
              fontSize={10}
              fill="var(--accent, #2563eb)"
              opacity={0.8}
            >
              Stability Lobe (概念)
            </text>
          </g>
        )}

        {/* 点群 — 形状（円 / ◇ / △）と色（colorMode）を分離して描画 */}
        {processes.map((p) => {
          const cx = xScale.toPx(xAxis.get(p));
          const cy = yScale.toPx(yAxis.get(p));
          const isSelected = p.id === selectedId;
          const isHovered = p.id === hoverId;
          const fill = colorForProcess(p, colorMode);
          const stroke = isSelected
            ? 'var(--accent, #2563eb)'
            : isHovered
              ? 'rgba(148, 163, 184, 0.9)'
              : 'transparent';
          const r = isSelected ? 6 : isHovered ? 5 : 3.6;
          const shape = markerShapeFor(p);
          const eventHandlers = {
            tabIndex: 0,
            onMouseEnter: () => setHoverId(p.id),
            onMouseLeave: () => setHoverId(null),
            onFocus: () => setHoverId(p.id),
            onBlur: () => setHoverId(null),
            onClick: () => onSelect(isSelected ? null : p.id),
            onKeyDown: (e: React.KeyboardEvent<SVGElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(isSelected ? null : p.id);
              }
            },
            style: { cursor: 'pointer', outline: 'none' },
          };
          const titleEl = (
            <title>{`${p.code}\n${xAxis.label}=${xAxis.get(p).toFixed(3)} ${xAxis.unit}\n${yAxis.label}=${yAxis.get(p).toFixed(3)} ${yAxis.unit}\nap=${p.condition.depthOfCut.toFixed(2)} mm\n冷却=${p.condition.coolant}${p.chatterDetected === true ? '\nびびり検出' : ''}`}</title>
          );
          const ariaLabel = `プロセス ${p.code} ${xAxis.label}=${xAxis.get(p).toFixed(3)} ${yAxis.label}=${yAxis.get(p).toFixed(3)}`;
          if (shape === 'circle') {
            return (
              <circle
                key={p.id}
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 2 : 1}
                aria-label={ariaLabel}
                {...eventHandlers}
              >
                {titleEl}
              </circle>
            );
          }
          return (
            <path
              key={p.id}
              d={markerPathD(shape, cx, cy, r + 0.5)}
              fill={fill}
              stroke={stroke}
              strokeWidth={isSelected ? 2 : 1}
              aria-label={ariaLabel}
              {...eventHandlers}
            >
              {titleEl}
            </path>
          );
        })}

        {/* 凡例 — 色モードに応じてラベルを切替、特殊冷却マーカーも併記 */}
        <g transform={`translate(${plotX1 - 230}, ${plotY1 - 56})`}>
          <rect
            width={222}
            height={48}
            fill="var(--bg-raised, rgba(15, 23, 42, 0.7))"
            stroke="var(--border-faint, #334155)"
          />
          <text x={8} y={14} fontSize={10} fill="var(--text-lo, #94a3b8)">
            色: {COLOR_MODE_LABEL[colorMode]}
          </text>
          {colorMode === 'chatter' && (
            <>
              <circle cx={20} cy={28} r={4} fill="rgba(37, 99, 235, 0.72)" />
              <text x={28} y={31} fontSize={11} fill="var(--text-md, #cbd5e1)">
                安定
              </text>
              <circle cx={80} cy={28} r={4} fill="rgba(239, 68, 68, 0.78)" />
              <text x={88} y={31} fontSize={11} fill="var(--text-md, #cbd5e1)">
                びびり
              </text>
            </>
          )}
          {colorMode === 'toolWear' && (
            <text x={8} y={31} fontSize={11} fill="var(--text-md, #cbd5e1)">
              緑: VB&lt;0.3 / 黄: 0.3-0.6 / 赤: &gt;0.6
            </text>
          )}
          {colorMode === 'surfaceRoughness' && (
            <text x={8} y={31} fontSize={11} fill="var(--text-md, #cbd5e1)">
              青: Ra&lt;1.6 / 紫: ~3.2 / 赤: &gt;3.2
            </text>
          )}
          <text x={8} y={44} fontSize={10} fill="var(--text-lo, #94a3b8)">
            形状: ○通常 / ◇MQL / △cryogenic
          </text>
        </g>
      </svg>
    </div>
  );
};
