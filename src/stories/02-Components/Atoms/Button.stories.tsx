import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Button } from '../../../components/atoms';
import { Icon } from '../../../components/Icon';

const meta: Meta<typeof Button> = {
  title: 'Components/Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'アクションを実行するボタンコンポーネント。7つのバリアントと4つのサイズに対応。',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'ai', 'vec', 'danger', 'ghost', 'outline'] },
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'ボタン',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Controls パネルで各プロパティを操作できます */
export const Default: Story = {};

const VARIANTS = ['default', 'primary', 'ai', 'vec', 'danger', 'ghost', 'outline'] as const;
const VARIANT_LABELS: Record<string, string> = {
  default: 'Default',
  primary: 'Primary',
  ai: 'AI',
  vec: 'Vec',
  danger: 'Danger',
  ghost: 'Ghost',
  outline: 'Outline',
};

/** 7種類のバリアントを一覧表示 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {VARIANTS.map(v => (
        <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Button variant={v}>{VARIANT_LABELS[v]}</Button>
          <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>{v}</span>
        </div>
      ))}
    </div>
  ),
};

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

/** 4種類のサイズを一覧表示 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {SIZES.map(s => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Button variant="primary" size={s}>ボタン {s}</Button>
          <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>{s}</span>
        </div>
      ))}
    </div>
  ),
};

/** アイコン付きボタン */
export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary"><Icon name="plus" size={14} />新規登録</Button>
      <Button variant="ai"><Icon name="spark" size={14} />AI 分析</Button>
      <Button variant="vec"><Icon name="embed" size={14} />ベクトル検索</Button>
      <Button variant="danger"><Icon name="trash" size={14} />削除</Button>
      <Button variant="ghost"><Icon name="refresh" size={14} />更新</Button>
      <Button variant="outline"><Icon name="download" size={14} />エクスポート</Button>
    </div>
  ),
};
