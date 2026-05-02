// 波形サンプルの CSV シリアライザ（純関数）。
// 生波形 + FFT 振幅スペクトルを 1 ファイルにまとめ、外部解析ツールに
// インポートしやすい縦持ち CSV を返す。
//
// 出力フォーマット:
//   # header lines (# で始まる)
//   timeSec,value,frequencyHz,magnitude
//   0.000,12.3,0.0,0.123
//   ...
//
// 時間/周波数のサンプル数は揃わないので、長い方に合わせて空欄で埋める。

import type { WaveformSample } from '@/domain/types';

export interface FftResultLite {
  freqs: number[];
  mags: number[];
}

/** 値をコンマ・改行・ダブルクォートに対して安全な CSV 字句に整形する */
function escapeCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildWaveformCsv(sample: WaveformSample, spectrum: FftResultLite | null): string {
  const headerLines = [
    `# Matlens waveform CSV`,
    `# sampleId=${sample.id}`,
    `# channel=${sample.channel}`,
    `# unit=${sample.unit}`,
    `# sampleRateHz=${sample.sampleRateHz}`,
    `# pointCount=${sample.values.length}`,
    `# startedAt=${sample.startedAt}`,
  ];

  const dt = sample.sampleRateHz > 0 ? 1 / sample.sampleRateHz : 0;
  const timeRows = sample.values.map((v, i) => ({
    timeSec: i * dt,
    value: v,
  }));
  const freqRows = spectrum
    ? spectrum.freqs.map((f, i) => ({ frequencyHz: f, magnitude: spectrum.mags[i] ?? 0 }))
    : [];

  const totalRows = Math.max(timeRows.length, freqRows.length);
  const lines: string[] = [
    ...headerLines,
    ['timeSec', 'value', 'frequencyHz', 'magnitude'].map(escapeCell).join(','),
  ];
  for (let i = 0; i < totalRows; i++) {
    const t = timeRows[i];
    const f = freqRows[i];
    lines.push(
      [
        t ? t.timeSec.toFixed(6) : '',
        t ? t.value : '',
        f ? f.frequencyHz.toFixed(3) : '',
        f ? (f.magnitude ?? 0).toFixed(6) : '',
      ]
        .map(escapeCell)
        .join(','),
    );
  }
  return lines.join('\n') + '\n';
}

export function defaultWaveformCsvFilename(sample: WaveformSample): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = `${sample.channel}_${sample.id}`.replace(/[^A-Za-z0-9_-]+/g, '-');
  return `waveform_${slug}_${date}.csv`;
}
