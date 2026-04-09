import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Topbar } from '../../components/Topbar';

const meta = {
  title: 'Organisms/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  args: {
    theme: 'light',
    setTheme: fn(),
    onToggleSidebar: fn(),
    embStatus: 'idle',
    embCount: 0,
    onGlobalSearch: fn(),
    globalQuery: '',
    setGlobalQuery: fn(),
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkTheme: Story = {
  args: { theme: 'dark' },
};

export const EmbeddingReady: Story = {
  args: { embStatus: 'ready', embCount: 15 },
};

export const EmbeddingLoading: Story = {
  args: { embStatus: 'loading' },
};
