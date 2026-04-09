import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock TensorFlow.js + USE (heavy ML deps)
vi.mock('@tensorflow/tfjs', () => ({}));
vi.mock('@tensorflow-models/universal-sentence-encoder', () => ({
  load: vi.fn().mockResolvedValue({
    embed: vi.fn().mockResolvedValue({
      array: vi.fn().mockResolvedValue([new Array(512).fill(0)]),
      dispose: vi.fn(),
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
