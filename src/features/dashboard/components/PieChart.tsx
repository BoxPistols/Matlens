// 純 SVG 円グラフ（ADR-009 純 SVG + 依存ゼロ方針）。
// ダッシュボードの分布表示専用。ラベルは凡例で表示し、スライス上には最大カウントのみ表示する。

import { useId } from 'react';

export interface PieSlice {
  label: string;
  value: number;
  colorKey?: string; // CSS 変数名の接頭辞（未指定時はインデックスでローテート）
}

interface PieChartProps {
  slices: PieSlice[];
  /** SVG 描画サイズ（円の直径に近い） */
  size?: number;
  /** 凡例の表示有無 */
  showLegend?: boolean;
  /** a11y 用の図表タイトル */
  title: string;
}

// テーマ変数を優先し、不足分は CSS 変数のデフォルトでカバー。
// Matlens の 4 テーマで自然に追従する。
const DEFAULT_COLORS = [
  'var(--accent, #2563eb)',
  'var(--ok, #22c55e)',
  'var(--warn, #d97706)',
  'var(--err, #dc2626)',
  'var(--ai-col, #a855f7)',
  'var(--vec, #0ea5e9)',
  'var(--text-md, #64748b)',
  'var(--text-lo, #94a3b8)',
];

export const PieChart = ({
  slices,
  size = 180,
  showLegend = true,
  title,
}: PieChartProps) => {
  // useId() は複数同時描画時の id 衝突を防ぐ。Matlens の決定論描画パターンを踏襲。
  const uid = useId();

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 text-[12px] text-[var(--text-lo)] py-4">
        <span>{title}</span>
        <span>データなし</span>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.92; // 少し内側に描いてラベルのオーバーハングを回避

  // スライスパス生成。角度は 12 時方向（-90°）から時計回り。
  let cumulative = 0;
  const paths = slices
    .filter((s) => s.value > 0)
    .map((s, i) => {
      const startAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
      cumulative += s.value;
      const endAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

      // スライス全体が 100% の場合は円を 2 分割して描く（SVG arc は 360° を描けない）
      const d =
        s.value === total
          ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`
          : `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

      const color = s.colorKey ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const percent = ((s.value / total) * 100).toFixed(0);

      return {
        key: `${uid}-${i}`,
        d,
        color,
        label: s.label,
        value: s.value,
        percent,
      };
    });

  return (
    <figure
      className="flex items-center gap-3 flex-wrap"
      role="figure"
      aria-label={title}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
      >
        <title>{title}</title>
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill={p.color}
            stroke="var(--bg-raised, #fff)"
            strokeWidth={1}
          />
        ))}
      </svg>

      {showLegend && (
        <ul className="flex flex-col gap-0.5 text-[12px]">
          {paths.map((p) => (
            <li key={`legend-${p.key}`} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: p.color }}
              />
              <span className="text-[var(--text-hi)]">{p.label}</span>
              <span className="tabular-nums text-[var(--text-lo)]">
                {p.value}（{p.percent}%）
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
};
