// 波形ビューア。時系列プロット + FFT スペクトル + 基本統計を純 SVG で描画する。
// 依存ゼロ（自前 FFT を使用）。128 点規模の PoC 用途を想定。
//
// 表示モード:
//   - single  (既定) — 選択チャネル 1 本を統計付きで表示
//   - overlay        — 全チャネルを同一スケールで重ね描き
//                       チャネル間の同期挙動（X / Y / Z 切削抵抗の相関等）を
//                       直感的に確認するための比較ビュー
//
// CSV ダウンロード: 選択チャネルの時間波形 + FFT 振幅スペクトルをまとめて
// CSV ファイルとして出力する（外部解析ツールで再利用可能）。

import { useEffect, useMemo, useState } from 'react';
import type { WaveformSample } from '@/domain/types';
import { binFrequency, fft, magnitudeSpectrum } from '../utils/fft';
import { buildWaveformCsv, defaultWaveformCsvFilename } from '../utils/waveformCsv';
import { downloadTextFile } from '@/services/downloadFile';

export interface WaveformViewerProps {
  samples: WaveformSample[];
}

type ViewMode = 'single' | 'overlay';

interface WaveformStats {
  min: number;
  max: number;
  mean: number;
  rms: number;
  std: number;
}

const computeStats = (values: readonly number[]): WaveformStats => {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, rms: 0, std: 0 };
  }
  let min = values[0] ?? 0;
  let max = values[0] ?? 0;
  let sum = 0;
  let sumSq = 0;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    sumSq += v * v;
  }
  const mean = sum / values.length;
  const rms = Math.sqrt(sumSq / values.length);
  const variance = sumSq / values.length - mean * mean;
  const std = Math.sqrt(Math.max(0, variance));
  return { min, max, mean, rms, std };
};

const CHANNEL_COLOR: Record<WaveformSample['channel'], string> = {
  force_x: '#ef4444',
  force_y: '#10b981',
  force_z: '#3b82f6',
  vibration: '#a855f7',
  acoustic: '#f59e0b',
  temperature: '#ec4899',
};

const CHANNEL_LABEL: Record<WaveformSample['channel'], string> = {
  force_x: '切削抵抗 Fx',
  force_y: '切削抵抗 Fy',
  force_z: '切削抵抗 Fz',
  vibration: '振動加速度',
  acoustic: '音響',
  temperature: '温度',
};

export const WaveformViewer = ({ samples }: WaveformViewerProps) => {
  const firstSampleId = samples[0]?.id ?? '';
  const [activeId, setActiveId] = useState<string>(firstSampleId);
  const [viewMode, setViewMode] = useState<ViewMode>('single');

  // samples が差し替わったら選択状態をリセットする（前回の activeId が新しい配列に
  // 含まれないと詳細表示と選択状態が乖離するため）
  useEffect(() => {
    if (!samples.some((s) => s.id === activeId)) {
      setActiveId(firstSampleId);
    }
  }, [samples, activeId, firstSampleId]);

  const active = samples.find((s) => s.id === activeId) ?? samples[0] ?? null;

  const stats = useMemo(
    () => (active ? computeStats(active.values) : null),
    [active]
  );

  const timeDomainPath = useMemo(() => {
    if (!active || !stats) return '';
    const values = active.values;
    if (values.length === 0) return '';
    const n = values.length;
    const w = 560;
    const h = 120;
    const pad = 24;
    const plotW = w - pad * 2;
    const plotH = h - pad * 2;
    const yMin = stats.min;
    const yMax = stats.max;
    const yRange = yMax === yMin ? 1 : yMax - yMin;
    const parts: string[] = [];
    for (let i = 0; i < n; i++) {
      const x = pad + (plotW * i) / Math.max(1, n - 1);
      const y = pad + plotH - ((values[i]! - yMin) / yRange) * plotH;
      parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return parts.join(' ');
  }, [active, stats]);

  const spectrum = useMemo(() => {
    if (!active) return null;
    const result = fft(active.values);
    const mags = magnitudeSpectrum(result);
    const freqs = mags.map((_, k) => binFrequency(k, result.n, active.sampleRateHz));
    return { mags, freqs };
  }, [active]);

  const spectrumPath = useMemo(() => {
    if (!spectrum) return '';
    const { mags } = spectrum;
    if (mags.length === 0) return '';
    const w = 560;
    const h = 120;
    const pad = 24;
    const plotW = w - pad * 2;
    const plotH = h - pad * 2;
    const maxMag = Math.max(...mags);
    if (maxMag <= 0) return '';
    const parts: string[] = [];
    // DC ビン (k=0) は視認性のためスキップ、代わりに k=1 から描画
    for (let k = 1; k < mags.length; k++) {
      const x = pad + (plotW * k) / Math.max(1, mags.length - 1);
      const y = pad + plotH - (mags[k]! / maxMag) * plotH;
      parts.push(`${k === 1 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return parts.join(' ');
  }, [spectrum]);

  const peakInfo = useMemo(() => {
    if (!spectrum) return null;
    const { mags, freqs } = spectrum;
    let peakIdx = 1;
    let peakMag = 0;
    for (let k = 1; k < mags.length; k++) {
      if ((mags[k] ?? 0) > peakMag) {
        peakMag = mags[k] ?? 0;
        peakIdx = k;
      }
    }
    return { freq: freqs[peakIdx] ?? 0, mag: peakMag };
  }, [spectrum]);

  const handleCsvDownload = () => {
    if (!active) return;
    const csv = buildWaveformCsv(active, spectrum);
    downloadTextFile(csv, defaultWaveformCsvFilename(active), 'text/csv');
  };

  if (!active) {
    return (
      <div className="text-[11px] text-[var(--text-lo)]">
        この工程に紐づく波形サンプルはありません。
      </div>
    );
  }

  const color = CHANNEL_COLOR[active.channel];

  return (
    <div className="flex flex-col gap-2">
      {/* 操作行: モード切替 + CSV */}
      <div className="flex items-center gap-2 flex-wrap">
        {samples.length > 1 && (
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="波形ビューア表示モード"
          >
            {([
              { v: 'single' as const, label: '単独' },
              { v: 'overlay' as const, label: '重ね描き' },
            ]).map((o) => (
              <button
                key={o.v}
                type="button"
                role="radio"
                aria-checked={viewMode === o.v}
                onClick={() => setViewMode(o.v)}
                className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                  viewMode === o.v
                    ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                    : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleCsvDownload}
          className="ml-auto text-[11px] px-2 py-0.5 rounded border border-[var(--border-default)] hover:bg-[var(--hover)]"
          aria-label="選択波形を CSV ダウンロード"
        >
          CSV
        </button>
      </div>

      {/* チャネルタブ（単独モードのみ） */}
      {samples.length > 1 && viewMode === 'single' && (
        <div
          className="flex items-center gap-1 flex-wrap"
          role="tablist"
          aria-label="波形チャネル"
        >
          {samples.map((s) => {
            const isActive = s.id === active.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(s.id)}
                className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                  isActive
                    ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                    : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
                }`}
              >
                {CHANNEL_LABEL[s.channel]}
              </button>
            );
          })}
        </div>
      )}

      {/* 重ね描き（overlay）モード — 全チャネルを共通スケールで描画 */}
      {viewMode === 'overlay' && samples.length > 1 && (
        <OverlayPlot samples={samples} />
      )}

      {/* 統計値（単独モードのみ） */}
      {viewMode === 'single' && stats && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
          <dt className="text-[var(--text-lo)]">min</dt>
          <dd className="font-mono text-right">
            {stats.min.toFixed(2)} {active.unit}
          </dd>
          <dt className="text-[var(--text-lo)]">max</dt>
          <dd className="font-mono text-right">
            {stats.max.toFixed(2)} {active.unit}
          </dd>
          <dt className="text-[var(--text-lo)]">平均</dt>
          <dd className="font-mono text-right">
            {stats.mean.toFixed(2)} {active.unit}
          </dd>
          <dt className="text-[var(--text-lo)]">RMS</dt>
          <dd className="font-mono text-right">
            {stats.rms.toFixed(2)} {active.unit}
          </dd>
          <dt className="text-[var(--text-lo)]">標準偏差</dt>
          <dd className="font-mono text-right">
            {stats.std.toFixed(2)} {active.unit}
          </dd>
          {peakInfo && peakInfo.mag > 0 && (
            <>
              <dt className="text-[var(--text-lo)]">ピーク周波数</dt>
              <dd className="font-mono text-right">
                {peakInfo.freq.toFixed(1)} Hz
              </dd>
            </>
          )}
        </dl>
      )}

      {/* 時間領域プロット（単独モード） */}
      {viewMode === 'single' && (
      <div>
        <div className="text-[10px] text-[var(--text-lo)] mb-0.5">
          時間領域 ({active.values.length} 点 / {active.sampleRateHz} Hz)
        </div>
        <svg
          viewBox="0 0 560 120"
          width="100%"
          className="block"
          role="img"
          aria-label={`${CHANNEL_LABEL[active.channel]}の時間波形`}
        >
          <rect
            x={24}
            y={24}
            width={512}
            height={72}
            fill="var(--bg-base, transparent)"
            stroke="var(--border-faint, #334155)"
          />
          <path d={timeDomainPath} stroke={color} strokeWidth={1.2} fill="none" />
        </svg>
      </div>
      )}

      {/* 周波数領域プロット（単独モード） */}
      {viewMode === 'single' && (
      <div>
        <div className="text-[10px] text-[var(--text-lo)] mb-0.5">
          周波数領域 (FFT 片側振幅スペクトル)
        </div>
        <svg
          viewBox="0 0 560 120"
          width="100%"
          className="block"
          role="img"
          aria-label={`${CHANNEL_LABEL[active.channel]}のスペクトル`}
        >
          <rect
            x={24}
            y={24}
            width={512}
            height={72}
            fill="var(--bg-base, transparent)"
            stroke="var(--border-faint, #334155)"
          />
          <path d={spectrumPath} stroke={color} strokeWidth={1.2} fill="none" />
        </svg>
      </div>
      )}
    </div>
  );
};

// ----- Overlay プロット（複数波形の同期表示） -----

interface OverlayPlotProps {
  samples: WaveformSample[];
}

const OverlayPlot = ({ samples }: OverlayPlotProps) => {
  const allValues = samples.flatMap((s) => s.values);
  if (allValues.length === 0) return null;
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yRange = yMax === yMin ? 1 : yMax - yMin;
  const w = 560;
  const h = 160;
  const pad = 24;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;
  const longestN = Math.max(...samples.map((s) => s.values.length), 1);

  const buildPath = (values: readonly number[]) => {
    if (values.length === 0) return '';
    const parts: string[] = [];
    for (let i = 0; i < values.length; i++) {
      const x = pad + (plotW * i) / Math.max(1, longestN - 1);
      const y = pad + plotH - ((values[i]! - yMin) / yRange) * plotH;
      parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return parts.join(' ');
  };

  return (
    <div>
      <div className="text-[10px] text-[var(--text-lo)] mb-0.5">
        重ね描き（{samples.length} チャネル / 共通スケール）
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        className="block"
        role="img"
        aria-label="複数チャネルの時間波形 重ね描き"
      >
        <rect
          x={pad}
          y={pad}
          width={plotW}
          height={plotH}
          fill="var(--bg-base, transparent)"
          stroke="var(--border-faint, #334155)"
        />
        {samples.map((s) => (
          <path
            key={s.id}
            d={buildPath(s.values)}
            stroke={CHANNEL_COLOR[s.channel]}
            strokeWidth={1.1}
            fill="none"
            opacity={0.85}
          />
        ))}
      </svg>
      <ul className="flex gap-3 flex-wrap text-[11px] mt-1" aria-label="チャネル凡例">
        {samples.map((s) => (
          <li key={s.id} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: CHANNEL_COLOR[s.channel] }}
            />
            {CHANNEL_LABEL[s.channel]}
          </li>
        ))}
      </ul>
    </div>
  );
};
