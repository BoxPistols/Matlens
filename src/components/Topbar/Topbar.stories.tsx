import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Topbar } from './Topbar';

const meta: Meta<typeof Topbar> = {
  title: 'Components/Organisms/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'アプリケーション上部のヘッダーバー。テーマ切替・グローバル検索・ベクトル検索ステータスを表示。',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    theme: { control: 'select', options: ['light', 'dark', 'eng', 'cae'] },
    embStatus: { control: 'select', options: ['idle', 'loading', 'indexing', 'ready', 'fallback'] },
    embCount: { control: { type: 'range', min: 0, max: 500, step: 1 } },
  },
  args: {
    theme: 'light',
    setTheme: fn(),
    onToggleSidebar: fn(),
    embStatus: 'ready',
    embCount: 15,
    onGlobalSearch: fn(),
    globalQuery: '',
    setGlobalQuery: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--bg-base)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Topbar>;

/** Controls パネルでテーマやステータスを操作できます */
export const Default: Story = {};
