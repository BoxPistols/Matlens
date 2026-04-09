import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Modal, ExportModal } from '../../components/molecules';
import { Button } from '../../components/atoms';
import { INITIAL_DB } from '../../data/initialDb';

const meta = {
  title: 'Molecules/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: { onClose: fn() },
  argTypes: {
    open: { control: 'boolean' },
    width: { control: 'select', options: ['max-w-sm', 'max-w-lg', 'max-w-2xl'] },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    open: true,
    title: '削除の確認',
    children: <p><strong>Ti-6Al-4V チタン合金</strong>（MAT-0247）を削除します。この操作は元に戻せません。</p>,
    footer: (
      <>
        <Button variant="default">キャンセル</Button>
        <Button variant="danger">削除する</Button>
      </>
    ),
  },
};

export const ExportDialog: Story = {
  render: () => (
    <ExportModal open={true} onClose={fn()} db={INITIAL_DB} filtered={INITIAL_DB} />
  ),
};
