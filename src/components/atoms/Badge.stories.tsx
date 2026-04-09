import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './atoms';

const meta: Meta<typeof Badge> = {
  title: 'Components/Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ステータスやカテゴリを示すラベルコンポーネント。ステータス文字列による自動配色に対応。',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['gray', 'blue', 'green', 'amber', 'red', 'ai', 'vec'] },
  },
  args: {
    children: 'ラベル',
    variant: 'blue',
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/** Controls パネルで各プロパティを操作できます */
export const Default: Story = {};

const VARIANTS = ['gray', 'blue', 'green', 'amber', 'red', 'ai', 'vec'] as const;
const VARIANT_LABELS: Record<string, string> = {
  gray: 'Gray',
  blue: 'Blue',
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
  ai: 'AI',
  vec: 'Vec',
};

const STATUS_AUTO = ['登録済', '承認済', 'レビュー待', '要修正'] as const;

/** 全バリアント + ステータス自動検出 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
          カラーバリアント
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {VARIANTS.map(v => (
            <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Badge variant={v}>{VARIANT_LABELS[v]}</Badge>
              <span style={{ fontSize: 12, color: 'var(--text-lo)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
          ステータス自動配色
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_AUTO.map(s => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </div>
    </div>
  ),
};
