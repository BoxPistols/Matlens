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

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ALL_ICONS,
    },
    size: {
      control: { type: 'range', min: 12, max: 48, step: 2 },
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { name: 'dashboard', size: 24 },
};

export const Small: Story = {
  args: { name: 'search', size: 14 },
};

export const Large: Story = {
  args: { name: 'spark', size: 36 },
};
