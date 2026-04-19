import { describe, expect, it } from 'vitest';
import { binFrequency, fft, magnitudeSpectrum } from './fft';

describe('fft', () => {
  it('DC 信号の FFT は 0 番目のビンにのみエネルギーを持つ', () => {
    const signal = new Array<number>(128).fill(1);
    const result = fft(signal);
    const spec = magnitudeSpectrum(result);
    expect(spec[0]).toBeCloseTo(1, 5);
    for (let k = 1; k < spec.length; k++) {
      expect(spec[k]).toBeLessThan(1e-6);
    }
  });

  it('正弦波の FFT は該当周波数ビンにピークを持つ', () => {
    const n = 128;
    const sampleRate = 1024; // Hz
    const freq = 64; // Hz
    const amp = 2;
    const signal = Array.from({ length: n }, (_, i) =>
      amp * Math.sin((2 * Math.PI * freq * i) / sampleRate)
    );
    const result = fft(signal);
    const spec = magnitudeSpectrum(result);
    const targetBin = Math.round((freq * n) / sampleRate);
    // ピークが target bin にあること、振幅が amp に近いこと
    const peakIdx = spec.indexOf(Math.max(...spec));
    expect(peakIdx).toBe(targetBin);
    expect(spec[targetBin]).toBeCloseTo(amp, 1);
  });

  it('2 の冪でない入力長は 0 パディングされる', () => {
    const signal = [1, 2, 3];
    const result = fft(signal);
    expect(result.n).toBe(4);
    expect(result.re.length).toBe(4);
  });

  it('binFrequency は sampleRate * k / n を返す', () => {
    expect(binFrequency(10, 128, 10000)).toBeCloseTo(781.25, 3);
    expect(binFrequency(0, 128, 10000)).toBe(0);
  });

  it('空配列 / 単点は 0 スペクトルを返して落ちない', () => {
    const empty = fft([]);
    expect(empty.n).toBe(1);
    const single = fft([42]);
    expect(single.n).toBe(1);
  });
});
