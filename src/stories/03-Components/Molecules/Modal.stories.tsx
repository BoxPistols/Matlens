import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Modal, ExportModal } from '../../../components/molecules';
import { Button } from '../../../components/atoms';
import { INITIAL_DB } from '../../../data/initialDb';

const meta: Meta<typeof Modal> = {
  title: 'Components/Molecules/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'モーダルダイアログコンポーネント。ESCキーとオーバーレイクリックで閉じる。ExportModal はデータエクスポート用の特化ダイアログ。',
      },
    },
  },
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
  },
  args: {
    open: true,
    onClose: fn(),
    title: '確認ダイアログ',
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

/** 基本的なモーダル */
export const Default: Story = {
  args: {
    children: (
      <p>この操作を実行してもよろしいですか？削除されたデータは復元できません。</p>
    ),
    footer: (
      <>
        <Button variant="default">キャンセル</Button>
        <Button variant="danger">削除する</Button>
      </>
    ),
  },
};

/** データエクスポートダイアログ */
export const ExportDialog: Story = {
  render: () => (
    <ExportModal
      open={true}
      onClose={fn()}
      db={INITIAL_DB}
      filtered={INITIAL_DB.slice(0, 5)}
    />
  ),
};
