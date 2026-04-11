import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Register jest-axe's `toHaveNoViolations` matcher once at startup so every
// `expect(container).toHaveNoViolations()` call across the suite works
// without each file importing it individually.
expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});

// TensorFlow.js + USE は動的 import のみ。テストで誤ってロードしたときの軽量スタブ
vi.mock('@tensorflow-models/universal-sentence-encoder', () => ({
  load: vi.fn().mockResolvedValue({
    embed: vi.fn().mockImplementation(async (inputs: string | string[]) => {
      const list = Array.isArray(inputs) ? inputs : [inputs];
      const rows = list.map(() => new Array<number>(512).fill(0.01));
      return {
        array: async () => rows,
        dispose: vi.fn(),
      };
    }),
  }),
}));

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: class MockChart {
    static defaults = { color: '', borderColor: '', font: { size: 11 } };
    static register = vi.fn();
    destroy = vi.fn();
    constructor() {}
  },
  registerables: [],
}));

// Mock window.fetch for API tests
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
