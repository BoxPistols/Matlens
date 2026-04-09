import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { AppCtx } from '../context/AppContext';
import type { Material, AppContextValue } from '../types';
import { INITIAL_DB } from '../data/initialDb';

const mockContext: AppContextValue = {
  db: INITIAL_DB,
  dispatch: vi.fn(),
  addToast: vi.fn(),
  toasts: [],
  theme: 'light',
};

const mockClaude = {
  call: vi.fn().mockResolvedValue('AI応答テスト'),
  provider: 'openai-nano',
  setProvider: vi.fn(),
  providerDef: { id: 'openai-nano' as const, label: 'GPT-5.4 nano', model: 'gpt-5.4-nano', free: true },
  providers: [],
  hasOwnKey: false,
  ownKey: '',
  setOwnKey: vi.fn(),
  rateInfo: { remaining: 20, limit: 30 },
};

const mockEmbedding = {
  status: 'ready',
  embeddings: {},
  search: vi.fn().mockResolvedValue([]),
  addToIndex: vi.fn().mockResolvedValue(undefined),
  embCount: 15,
};

const mockVoice = {
  voiceState: 'idle', transcript: '', isHandsfree: false,
  ttsRate: 1, setTtsRate: vi.fn(), ttsPitch: 1, setTtsPitch: vi.fn(),
  voices: [], selectedVoice: 0, setSelectedVoice: vi.fn(),
  speak: vi.fn(), stopSpeaking: vi.fn(), toggleListening: vi.fn(),
  toggleHandsfree: vi.fn(), clearTranscript: vi.fn(), isSRAvailable: false,
};

export { mockContext, mockClaude, mockEmbedding, mockVoice, INITIAL_DB };

export function renderWithContext(ui: React.ReactElement, options?: RenderOptions) {
  return render(
    <AppCtx.Provider value={mockContext}>{ui}</AppCtx.Provider>,
    options,
  );
}
