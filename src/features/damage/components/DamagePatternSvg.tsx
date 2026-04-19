// 損傷タイプごとの procedural SVG パターン。
// 実画像の代替として、決定論的・完全ローカルなビジュアルを提供する。
// ID から seed を作ることで、同じ所見は常に同じ模様になる。

import type React from 'react';
import { useId } from 'react';
import type { DamageType, ID } from '@/domain/types';

const HUE: Record<DamageType, number> = {
  fatigue: 0, // rose
  creep: 25, // orange
  corrosion: 45, // amber
  stress_corrosion: 55, // yellow
  brittle_fracture: 85, // lime
  ductile_fracture: 155, // emerald
  wear: 190, // cyan
  thermal: 275, // violet
};

const hashToSeed = (id: ID): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const mulberry32 = (a: number) => () => {
  let t = (a = (a + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

interface DamagePatternSvgProps {
  id: ID;
  type: DamageType;
  width?: number;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

export const DamagePatternSvg = ({
  id,
  type,
  width = 320,
  height = 240,
  className,
  ariaLabel,
}: DamagePatternSvgProps) => {
  const rand = mulberry32(hashToSeed(id));
  const hue = HUE[type];
  const bgLight = `hsl(${hue}, 18%, 22%)`;
  const bgDark = `hsl(${hue}, 30%, 10%)`;
  const fg = `hsl(${hue}, 70%, 65%)`;
  const fgDim = `hsl(${hue}, 40%, 45%)`;
  // 同じ損傷所見をグリッドとライトボックスに同時描画しても DOM id が衝突しないよう、
  // インスタンス固有の prefix を useId から生成して linearGradient に付与する
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `bg-${instanceId}-${id}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={ariaLabel ?? `損傷パターン (${type})`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bgLight} />
          <stop offset="1" stopColor={bgDark} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${gradientId})`} />
      {renderPattern(type, width, height, rand, fg, fgDim)}
    </svg>
  );
};

const renderPattern = (
  type: DamageType,
  w: number,
  h: number,
  rand: () => number,
  fg: string,
  fgDim: string
) => {
  switch (type) {
    case 'fatigue':
    case 'brittle_fracture': {
      // 放射状のき裂
      const cx = rand() * w;
      const cy = rand() * h;
      const cracks = 5 + Math.floor(rand() * 4);
      const lines = Array.from({ length: cracks }).map((_, i) => {
        const angle = (i / cracks) * Math.PI * 2 + rand() * 0.3;
        const length = (0.5 + rand() * 0.5) * Math.max(w, h);
        const segs = segmentedPath(cx, cy, angle, length, rand);
        return (
          <path key={i} d={segs} stroke={fg} strokeWidth={1 + rand() * 1.5} fill="none" />
        );
      });
      return <>{lines}</>;
    }
    case 'creep': {
      // 粒界空洞を模した小円群
      const count = 80 + Math.floor(rand() * 40);
      return (
        <>
          {Array.from({ length: count }).map((_, i) => (
            <circle
              key={i}
              cx={rand() * w}
              cy={rand() * h}
              r={1 + rand() * 3}
              fill={fg}
              opacity={0.3 + rand() * 0.5}
            />
          ))}
        </>
      );
    }
    case 'corrosion':
    case 'stress_corrosion': {
      // 孔食状のまだら
      const count = 20 + Math.floor(rand() * 15);
      return (
        <>
          {Array.from({ length: count }).map((_, i) => (
            <ellipse
              key={i}
              cx={rand() * w}
              cy={rand() * h}
              rx={2 + rand() * 10}
              ry={2 + rand() * 10}
              fill={fgDim}
              opacity={0.35 + rand() * 0.45}
            />
          ))}
        </>
      );
    }
    case 'ductile_fracture': {
      // ディンプル（円形くぼみ）模様
      const grid = 10;
      const items: React.ReactElement[] = [];
      for (let y = 0; y < grid; y++) {
        for (let x = 0; x < grid; x++) {
          if (rand() < 0.35) continue;
          items.push(
            <circle
              key={`${x}-${y}`}
              cx={(x + 0.5 + (rand() - 0.5) * 0.5) * (w / grid)}
              cy={(y + 0.5 + (rand() - 0.5) * 0.5) * (h / grid)}
              r={(rand() * 0.3 + 0.2) * (w / grid) * 0.5}
              fill={fgDim}
              opacity={0.4 + rand() * 0.3}
            />
          );
        }
      }
      return <>{items}</>;
    }
    case 'wear': {
      // 平行な摺動痕
      const count = 40 + Math.floor(rand() * 20);
      const angle = rand() * 0.2 - 0.1;
      return (
        <g transform={`rotate(${(angle * 180) / Math.PI} ${w / 2} ${h / 2})`}>
          {Array.from({ length: count }).map((_, i) => {
            const y = (i / count) * h + rand() * 4 - 2;
            return (
              <line
                key={i}
                x1={-w}
                y1={y}
                x2={w * 2}
                y2={y}
                stroke={fgDim}
                strokeWidth={0.5 + rand() * 1.2}
                opacity={0.2 + rand() * 0.4}
              />
            );
          })}
        </g>
      );
    }
    case 'thermal': {
      // 熱疲労的な網目き裂
      const cells = 6;
      const items: React.ReactElement[] = [];
      for (let y = 0; y <= cells; y++) {
        const yy = (y / cells) * h + (rand() - 0.5) * 10;
        items.push(
          <path
            key={`h-${y}`}
            d={wavyLine(0, yy, w, yy, rand)}
            stroke={fgDim}
            strokeWidth={1}
            fill="none"
            opacity={0.4 + rand() * 0.4}
          />
        );
      }
      for (let x = 0; x <= cells; x++) {
        const xx = (x / cells) * w + (rand() - 0.5) * 10;
        items.push(
          <path
            key={`v-${x}`}
            d={wavyLine(xx, 0, xx, h, rand)}
            stroke={fgDim}
            strokeWidth={1}
            fill="none"
            opacity={0.4 + rand() * 0.4}
          />
        );
      }
      return <>{items}</>;
    }
    default:
      return null;
  }
};

const segmentedPath = (
  cx: number,
  cy: number,
  angle: number,
  length: number,
  rand: () => number
): string => {
  const segments = 5 + Math.floor(rand() * 4);
  const parts: string[] = [`M ${cx.toFixed(1)} ${cy.toFixed(1)}`];
  let x = cx;
  let y = cy;
  let a = angle;
  for (let i = 0; i < segments; i++) {
    a += (rand() - 0.5) * 0.4;
    const step = (length / segments) * (0.7 + rand() * 0.6);
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    parts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return parts.join(' ');
};

const wavyLine = (x1: number, y1: number, x2: number, y2: number, rand: () => number): string => {
  const segs = 10;
  const parts: string[] = [`M ${x1} ${y1}`];
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const x = x1 + (x2 - x1) * t + (rand() - 0.5) * 4;
    const y = y1 + (y2 - y1) * t + (rand() - 0.5) * 4;
    parts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return parts.join(' ');
};
