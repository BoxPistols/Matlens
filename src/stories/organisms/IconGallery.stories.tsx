import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, type IconName } from '../../components/Icon';

const ALL_ICONS: IconName[] = [
  'dashboard', 'list', 'plus', 'search', 'vecSearch', 'rag',
  'similar', 'mic', 'help', 'about', 'settings',
  'chevronLeft', 'chevronRight', 'chevronDown', 'close', 'check',
  'edit', 'trash', 'download', 'upload', 'copy', 'speaker',
  'stop', 'refresh', 'play', 'spark', 'embed', 'warning',
  'info', 'filter', 'sort', 'pdf', 'json', 'csv', 'report',
  'ai', 'scan',
];

const IconGalleryView = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px', padding: '16px' }}>
    {ALL_ICONS.map(name => (
      <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
        <Icon name={name} size={24} />
        <span style={{ fontSize: '11px', color: 'var(--text-lo)', fontFamily: 'monospace' }}>{name}</span>
      </div>
    ))}
  </div>
);

const meta = {
  title: 'Organisms/IconGallery',
  component: IconGalleryView,
  tags: ['autodocs'],
} satisfies Meta<typeof IconGalleryView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {};
