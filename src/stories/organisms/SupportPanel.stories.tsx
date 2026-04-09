import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { SupportPanel } from '../../components/SupportPanel';
import { AppCtx } from '../../context/AppContext';
import type { AppContextValue, AIHook } from '../../types';

const mockAI: AIHook = {
  call: fn(),
  provider: 'openai-nano',
  setProvider: fn(),
  providerDef: { id: 'openai-nano', label: 'GPT-5.4 nano', model: 'gpt-4.1-nano', free: true },
  providers: [
    { id: 'openai-nano', label: 'GPT-5.4 nano', model: 'gpt-4.1-nano', free: true },
    { id: 'gemini-flash', label: 'Gemini 2.5 Flash', model: 'gemini-2.5-flash', free: true },
    { id: 'openai-mini', label: 'GPT-5.4 mini', model: 'gpt-4.1-mini', free: false, requiresKey: true },
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

const meta = {
  title: 'Organisms/SupportPanel',
  component: SupportPanel,
  tags: ['autodocs'],
  args: {
    ai: mockAI,
    visible: true,
    onClose: fn(),
    onNav: fn(),
  },
  decorators: [
    (Story) => (
      <AppCtx.Provider value={mockCtx}>
        <div style={{ position: 'relative', height: '600px' }}>
          <Story />
        </div>
      </AppCtx.Provider>
    ),
  ],
} satisfies Meta<typeof SupportPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {};

export const Hidden: Story = {
  args: { visible: false },
};

export const WithOwnKey: Story = {
  args: {
    ai: {
      ...mockAI,
      hasOwnKey: true,
      ownKey: 'sk-test-key-12345',
    },
  },
};
