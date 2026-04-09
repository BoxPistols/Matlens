import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from '@storybook/test';
import { SupportPanel } from './SupportPanel';
import { AppCtx } from '../../context/AppContext';
import type { AppContextValue, AIHook } from '../../types';

const mockAi: AIHook = {
  call: fn(),
  provider: 'openai-nano',
  setProvider: fn(),
  providerDef: { id: 'openai-nano', label: 'GPT-5.4 nano', model: 'gpt-5.4-nano', free: true },
  providers: [
    { id: 'openai-nano', label: 'GPT-5.4 nano', model: 'gpt-5.4-nano', free: true },
    { id: 'gemini-flash', label: 'Gemini 2.5 Flash', model: 'gemini-2.5-flash', free: true },
    { id: 'openai-mini', label: 'GPT-5.4 mini', model: 'gpt-5.4-mini', requiresKey: true },
  ],
  hasOwnKey: false,
  ownKey: '',
  setOwnKey: fn(),
  rateInfo: { remaining: 18, limit: 30 },
};

const mockCtx: AppContextValue = {
  db: [],
  dispatch: fn(),
  addToast: fn(),
  toasts: [],
  theme: 'light',
};

const meta: Meta<typeof SupportPanel> = {
  title: 'Components/Organisms/SupportPanel',
  component: SupportPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'サポートパネル。ヘルプ / FAQ / AI設定の3タブ構成。画面右下にフローティング表示。AppCtx が必要。',
      },
    },
    layout: 'fullscreen',
  },
  args: {
    ai: mockAi,
    visible: true,
    onClose: fn(),
    onNav: fn(),
  },
  decorators: [
    (Story) => (
      <AppCtx.Provider value={mockCtx}>
        <div style={{ position: 'relative', minHeight: '700px', background: 'var(--bg-base)' }}>
          <Story />
        </div>
      </AppCtx.Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SupportPanel>;

/** サポートパネル（ヘルプタブ） */
export const Default: Story = {};
