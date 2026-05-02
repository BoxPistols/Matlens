import { describe, it, expect } from 'vitest';
import type { WaveformSample } from '@/domain/types';
import { buildWaveformCsv, defaultWaveformCsvFilename } from './waveformCsv';

const sample: WaveformSample = {
  id: 'wf-1',
  processId: 'cp-1',
  channel: 'force_x',
  unit: 'N',
  sampleRateHz: 1000,
  values: [1, 2, 3],
  startedAt: '2026-04-17T10:00:00+09:00',
};

describe('buildWaveformCsv', () => {
  it('writes header lines and data rows', () => {
    const csv = buildWaveformCsv(sample, null);
    expect(csv).toContain('# Matlens waveform CSV');
    expect(csv).toContain('# sampleRateHz=1000');
    expect(csv).toContain('timeSec,value,frequencyHz,magnitude');
    // 3 サンプル → 3 データ行
    // 7 ヘッダ + 1 カラム名 + 3 データ行
    expect(csv.trim().split('\n')).toHaveLength(7 + 1 + 3);
  });

  it('aligns time and frequency rows by index, padding shorter side', () => {
    const csv = buildWaveformCsv(sample, {
      freqs: [0, 100],
      mags: [0.5, 1.5],
    });
    const lines = csv.trim().split('\n');
    // 7 ヘッダ + 1 カラム名 + max(3, 2) = 11
    expect(lines).toHaveLength(7 + 1 + 3);
    // 最初のデータ行（index=0）は時間と周波数両方が埋まる
    expect(lines[8]).toMatch(/^0\.000000,1,0\.000,0\.500000$/);
    // 3 行目（index=2）は時間のみで周波数列は空
    expect(lines[10]).toMatch(/^0\.002000,3,,$/);
  });
});

describe('defaultWaveformCsvFilename', () => {
  it('encodes channel + id + date in the filename', () => {
    const name = defaultWaveformCsvFilename(sample);
    expect(name).toMatch(/^waveform_force_x_wf-1_\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
