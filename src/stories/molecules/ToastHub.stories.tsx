import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastHub } from '../../components/molecules';
import { AppCtx } from '../../context/AppContext';

const withContext = (toasts: { id: number; msg: string; type: string }[]) =>
  (Story: any) => (
    <AppCtx.Provider value={{ db: [], dispatch: () => {}, addToast: () => {}, toasts, theme: 'light' }}>
      <Story />
    </AppCtx.Provider>
  );

const meta = {
  title: 'Molecules/ToastHub',
  component: ToastHub,
  tags: ['autodocs'],
} satisfies Meta<typeof ToastHub>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithToasts: Story = {
  decorators: [
    withContext([
      { id: 1, msg: 'データを保存しました', type: 'ok' },
      { id: 2, msg: 'APIレートリミットに近づいています', type: 'warn' },
      { id: 3, msg: 'ベクトル検索が有効になりました', type: 'info' },
    ]),
  ],
};

export const Empty: Story = {
  decorators: [withContext([])],
};
