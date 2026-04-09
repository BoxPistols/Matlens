import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Modal } from '../../components/molecules';

const meta = {
  title: 'Molecules/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    title: 'モーダルタイトル',
    children: 'コンテンツ',
    footer: <button>OK</button>,
  },
};

export const Closed: Story = {
  args: {
    open: false,
    title: 'モーダルタイトル',
    children: 'このモーダルは非表示です',
  },
};

export const WithLongContent: Story = {
  args: {
    open: true,
    title: '長いコンテンツ',
    children: (
      <div>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} style={{ marginBottom: 8 }}>
            材料データベースの分析結果 #{i + 1}: Ti-6Al-4V チタン合金の引張強度は 950 MPa であり、
            航空宇宙用途に適した特性を示しています。弾性率は 114 GPa で、密度は 4.43 g/cm3 です。
          </p>
        ))}
      </div>
    ),
  },
};

export const WithFooterButtons: Story = {
  args: {
    open: true,
    title: '確認ダイアログ',
    children: 'この操作は取り消せません。本当に削除しますか？',
    footer: (
      <>
        <button style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ccc' }}>キャンセル</button>
        <button style={{ padding: '4px 12px', borderRadius: 6, background: '#e53e3e', color: '#fff', border: 'none' }}>削除する</button>
      </>
    ),
  },
};
