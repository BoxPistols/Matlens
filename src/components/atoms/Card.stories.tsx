import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, SectionCard, Button } from './atoms';
import { Icon } from '../Icon';

const meta: Meta<typeof Card> = {
  title: 'Components/Atoms/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '汎用カードコンポーネントとセクション付きカード。コンテンツ領域のラッパーとして使用。',
      },
    },
  },
  args: {
    children: 'カードの中身がここに入ります。パディングは用途に応じて外側で指定します。',
    className: 'p-4',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

/** 基本的なカード */
export const Default: Story = {};

/** Card / SectionCard バリエーション */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
          基本 Card
        </div>
        <Card className="p-4">
          <p style={{ fontSize: 13, color: 'var(--text-md)' }}>
            シンプルなカードコンポーネント。背景・ボーダー・角丸・影を提供します。
          </p>
        </Card>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
          SectionCard
        </div>
        <SectionCard title="材料特性">
          <p style={{ fontSize: 13, color: 'var(--text-md)' }}>
            セクション見出し付きのカード。ダッシュボードやフォームのグルーピングに使用します。
          </p>
        </SectionCard>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
          SectionCard + アクション
        </div>
        <SectionCard
          title="試験データ"
          action={<Button variant="ghost" size="xs"><Icon name="download" size={12} />エクスポート</Button>}
        >
          <p style={{ fontSize: 13, color: 'var(--text-md)' }}>
            右上にアクションボタンを配置したセクションカード。一覧画面のフィルタセクションなどに使用します。
          </p>
        </SectionCard>
      </div>
    </div>
  ),
};
