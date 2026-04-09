import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, type IconName } from '../../../components/Icon';

const ALL_ICONS: IconName[] = [
  'dashboard', 'list', 'plus', 'search', 'vecSearch', 'rag',
  'similar', 'mic', 'help', 'about', 'settings',
  'chevronLeft', 'chevronRight', 'chevronDown', 'close', 'check',
  'edit', 'trash', 'download', 'upload', 'copy', 'speaker',
  'stop', 'refresh', 'play', 'spark', 'embed', 'warning',
  'info', 'filter', 'sort', 'pdf', 'json', 'csv', 'report',
  'ai', 'scan',
];

const meta: Meta<typeof Icon> = {
  title: 'Components/Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Lucide React ベースのアイコンコンポーネント。37種類のアイコン名に対応。統一されたstrokeWidthとサイジングを提供。',
      },
    },
  },
  argTypes: {
    name: { control: 'select', options: ALL_ICONS },
    size: { control: { type: 'range', min: 12, max: 48, step: 2 } },
  },
  args: {
    name: 'dashboard',
    size: 24,
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

/** Controls パネルでアイコン名とサイズを操作できます */
export const Default: Story = {};

/** 全37アイコンのギャラリー */
export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
      {ALL_ICONS.map(name => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: '12px 4px',
            borderRadius: 8,
            border: '1px solid var(--border-faint)',
            background: 'var(--bg-raised)',
          }}
        >
          <Icon name={name} size={20} className="text-text-hi" />
          <span style={{ fontSize: 9, color: 'var(--text-lo)', fontFamily: 'var(--font-mono)', textAlign: 'center', wordBreak: 'break-all' }}>
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};
