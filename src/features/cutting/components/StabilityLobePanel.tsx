// Stability Lobe Diagram (SLD) パネル。
// 選択プロセスの工具 / 被削材から動特性を近似し、主軸回転数 × 限界切込み深さの
// 本格的な SLD を描画する。ConditionScatter の「概念曲線」とは別軸で、
// 厳密モデル（Altintas 2012）を可視化するための専用ビューア。

import { useMemo } from 'react';
import type { CuttingProcess, Tool } from '@/domain/types';
import {
  approximateModalParams,
  computeStabilityLobes,
  type SLDPoint,
} from '../utils/stabilityLobe';
import { kienzleFor } from '../utils/kcForceModel';

export interface StabilityLobePanelProps {
  process: CuttingProcess;
  tool: Tool | null | undefined;
}

const PAD = { top: 16, right: 16, bottom: 36, left: 52 };

export const StabilityLobePanel = ({
  process,
  tool,
}: StabilityLobePanelProps) => {
  const inputs = useMemo(() => {
    // 工具がない場合は汎用超硬 φ10 で暫定近似
    const diameter = tool?.diameter ?? 10;
    const material: 'HSS' | 'carbide' | 'ceramic' | 'CBN' =
      tool?.material === 'HSS'
        ? 'HSS'
        : tool?.material === 'ceramic'
          ? 'ceramic'
          : tool?.material === 'CBN'
            ? 'CBN'
            : 'carbide';
    const modal = approximateModalParams(diameter, material);
    const kienzle = kienzleFor(process.materialId);
    const teeth = tool?.fluteCount ?? 2;
    return {
      modal,
      Kc_N_mm2: kienzle.kc11,
      teeth,
      lobesMax: 4,
      samples: 180,
    };
  }, [process, tool]);

  const points: SLDPoint[] = useMemo(
    () => computeStabilityLobes(inputs),
    [inputs]
  );

  // 現在点（このプロセスの rpm / ap）
  const currentRpm = process.condition.spindleSpeed;
  const currentAp = process.condition.depthOfCut;

  const width = 560;
  const height = 240;
  const plotX0 = PAD.left;
  const plotX1 = width - PAD.right;
  const plotY0 = PAD.top;
  const plotY1 = height - PAD.bottom;

  if (points.length === 0) {
    return (
      <div className="text-[11px] text-[var(--text-lo)] p-3">
        工具 / 被削材の動特性が不足しているため SLD を描画できません。
      </div>
    );
  }

  const rpmMax = Math.max(
    ...points.map((p) => p.spindleRpm),
    currentRpm
  );
  const blimValues = points.map((p) => p.blim_mm);
  // 表示レンジ: 99 パーセンタイル程度までを収める（外れ値で軸がつぶれないよう）
  const sortedBlim = [...blimValues].sort((a, b) => a - b);
  const blimClip = sortedBlim[Math.floor(sortedBlim.length * 0.95)] ?? 10;
  const blimMax = Math.max(blimClip, currentAp * 1.2);

  const xScale = (v: number) => plotX0 + (v / rpmMax) * (plotX1 - plotX0);
  const yScale = (v: number) => plotY1 - (v / blimMax) * (plotY1 - plotY0);

  // lobe ごとに折れ線を引く（computeStabilityLobes が (lobe, rpm) でソート済）
  const lobeGroups = new Map<number, SLDPoint[]>();
  for (const p of points) {
    if (p.blim_mm > blimMax) continue; // 表示レンジ外
    const bucket = lobeGroups.get(p.lobe) ?? [];
    bucket.push(p);
    lobeGroups.set(p.lobe, bucket);
  }

  const xTicks = Array.from({ length: 6 }, (_, i) => (rpmMax / 5) * i);
  const yTicks = Array.from({ length: 5 }, (_, i) => (blimMax / 4) * i);

  const overLimit = currentAp > (points.find((p) => Math.abs(p.spindleRpm - currentRpm) < 500)?.blim_mm ?? blimMax);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[var(--text-lo)]">
          fn ≈ {inputs.modal.fn_Hz.toFixed(0)} Hz / ζ={inputs.modal.zeta} / Kc=
          {inputs.Kc_N_mm2} / 刃数={inputs.teeth}
        </span>
        <span className="font-mono text-[var(--text-lo)]">
          Altintas 2012 単一 DOF
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="Stability Lobe Diagram"
        style={{ maxHeight: 280 }}
      >
        <rect
          x={plotX0}
          y={plotY0}
          width={plotX1 - plotX0}
          height={plotY1 - plotY0}
          fill="var(--bg-base, transparent)"
          stroke="var(--border-faint, #334155)"
        />

        {/* Y 軸目盛り */}
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
                opacity={0.3}
              />
              <text
                x={plotX0 - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="var(--text-lo, #94a3b8)"
              >
                {t.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X 軸目盛り */}
        {xTicks.map((t, i) => {
          const x = xScale(t);
          const label = t >= 1000 ? `${(t / 1000).toFixed(1)}k` : t.toFixed(0);
          return (
            <g key={`gx-${i}`}>
              <line
                x1={x}
                y1={plotY0}
                x2={x}
                y2={plotY1}
                stroke="var(--border-faint, #1e293b)"
                strokeDasharray="2 3"
                opacity={0.3}
              />
              <text
                x={x}
                y={plotY1 + 14}
                textAnchor="middle"
                fontSize={10}
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
          fontSize={11}
          fill="var(--text-md, #cbd5e1)"
        >
          主軸回転数 (rpm)
        </text>
        <text
          x={12}
          y={(plotY0 + plotY1) / 2}
          textAnchor="middle"
          fontSize={11}
          fill="var(--text-md, #cbd5e1)"
          transform={`rotate(-90 12 ${(plotY0 + plotY1) / 2})`}
        >
          blim (mm)
        </text>

        {/* lobe ごとの折れ線 */}
        {Array.from(lobeGroups.entries()).map(([lobe, pts]) => {
          const d = pts
            .map(
              (p, i) =>
                `${i === 0 ? 'M' : 'L'} ${xScale(p.spindleRpm).toFixed(1)} ${yScale(p.blim_mm).toFixed(1)}`
            )
            .join(' ');
          return (
            <path
              key={lobe}
              d={d}
              stroke="var(--accent, #2563eb)"
              strokeWidth={1.2}
              fill="none"
              opacity={0.7}
            />
          );
        })}

        {/* 現在点 */}
        {currentRpm > 0 && currentRpm <= rpmMax && currentAp <= blimMax && (
          <g>
            <line
              x1={xScale(currentRpm)}
              y1={plotY0}
              x2={xScale(currentRpm)}
              y2={plotY1}
              stroke={overLimit ? 'var(--err, #dc2626)' : 'var(--ok, #22c55e)'}
              strokeDasharray="4 2"
              opacity={0.5}
            />
            <circle
              cx={xScale(currentRpm)}
              cy={yScale(Math.min(currentAp, blimMax))}
              r={5}
              fill={overLimit ? 'var(--err, #dc2626)' : 'var(--ok, #22c55e)'}
              stroke="white"
              strokeWidth={1}
            >
              <title>{`現在条件: ${currentRpm} rpm / ap=${currentAp.toFixed(2)} mm`}</title>
            </circle>
          </g>
        )}
      </svg>
      <div className="text-[10px] text-[var(--text-lo)] leading-relaxed">
        曲線の下側＝安定、上側＝チャタ領域。現在条件の縦線と ap 点が
        {overLimit
          ? ' 曲線の上にあるため びびり発生の可能性が高い'
          : ' 曲線の下にあり 安定切削が期待できる'}
        。モード特性 (fn, ζ) は径と工具材種からの近似であり、実際は impact test で同定する。
      </div>
    </div>
  );
};
