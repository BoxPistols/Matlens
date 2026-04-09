import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Organisms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'サイドナビゲーション。ページ遷移・セクション分類・折り畳み対応。下部にベクトル検索ステータスを表示。',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    currentPage: {
      control: 'select',
      options: ['dash', 'list', 'new', 'vsearch', 'rag', 'sim', 'api', 'tests', 'uxdesign', 'help', 'about', 'settings'],
    },
    collapsed: { control: 'boolean' },
    embStatus: { control: 'select', options: ['idle', 'loading', 'indexing', 'ready', 'fallback'] },
  },
  args: {
    currentPage: 'dash',
    onNav: fn(),
    collapsed: false,
    onToggle: fn(),
    dbCount: 15,
    embStatus: 'ready',
    embCount: 15,
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '600px', background: 'var(--bg-base)' }}>
        <Story />
        <div style={{ flex: 1, padding: 24, color: 'var(--text-lo)', fontSize: 13 }}>
          メインコンテンツ領域
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

/** Controls パネルでページ・折り畳み・ステータスを操作できます */
export const Default: Story = {};
