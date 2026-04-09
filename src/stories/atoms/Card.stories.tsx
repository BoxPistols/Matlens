import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, SectionCard, Button } from '../../components/atoms';
import { Icon } from '../../components/Icon';

const meta = {
  title: 'Atoms/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { className: 'p-4', children: 'カードコンポーネント。あらゆるコンテンツを内包します。' },
};

/** Card + SectionCard のバリエーション */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card className="p-4">基本カード</Card>
      <SectionCard title="セクションタイトル">セクションカードの本文です。</SectionCard>
      <SectionCard title="アクション付き" action={<Button variant="ghost" size="xs">一覧へ <Icon name="chevronRight" size={10} /></Button>}>
        右上にアクションボタンが配置されます。
      </SectionCard>
    </div>
  ),
};
