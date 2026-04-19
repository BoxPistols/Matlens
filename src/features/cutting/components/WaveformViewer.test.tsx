import { describe, expect, it } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { WaveformSample } from '@/domain/types';
import { WaveformViewer } from './WaveformViewer';

const makeSample = (
  id: string,
  channel: WaveformSample['channel'],
  values: number[]
): WaveformSample => ({
  id,
  processId: 'cut_000001',
  channel,
  unit: channel === 'temperature' ? '℃' : 'N',
  sampleRateHz: 10000,
  values,
  startedAt: '2026-04-20T10:00:00Z',
});

describe('WaveformViewer', () => {
  it('波形が空のとき空メッセージを表示する', () => {
    const { getByText } = render(<WaveformViewer samples={[]} />);
    expect(getByText(/波形サンプルはありません/)).toBeTruthy();
  });

  it('時間領域・周波数領域の 2 つの svg と統計値を描画する', () => {
    const values = Array.from({ length: 128 }, (_, i) => Math.sin((2 * Math.PI * 8 * i) / 128));
    const samples = [makeSample('wave_1', 'force_z', values)];
    const { container, getByText } = render(<WaveformViewer samples={samples} />);
    expect(container.querySelectorAll('svg').length).toBe(2);
    expect(getByText(/RMS/)).toBeTruthy();
    expect(getByText(/ピーク周波数/)).toBeTruthy();
  });

  it('複数チャネルのときタブで切替できる', () => {
    const samples = [
      makeSample('wave_1', 'force_z', [1, 2, 3, 4]),
      makeSample('wave_2', 'vibration', [0.5, -0.5, 0.5, -0.5]),
    ];
    const { getByRole, getAllByRole } = render(<WaveformViewer samples={samples} />);
    const tabs = getAllByRole('tab');
    expect(tabs.length).toBe(2);
    // 初期は 1 本目が選択
    expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
    // 2 本目をクリック
    fireEvent.click(getByRole('tab', { name: /振動/ }));
    expect(getByRole('tab', { name: /振動/ }).getAttribute('aria-selected')).toBe('true');
  });

  it('単一チャネルのときはタブを表示しない', () => {
    const samples = [makeSample('wave_only', 'force_z', [1, 2, 3, 4])];
    const { queryAllByRole } = render(<WaveformViewer samples={samples} />);
    expect(queryAllByRole('tab').length).toBe(0);
  });
});
