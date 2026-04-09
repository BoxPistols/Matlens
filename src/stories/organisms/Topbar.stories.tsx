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
    embStatus: 'ready',
    embCount: 15,
    onGlobalSearch: fn(),
    globalQuery: '',
    setGlobalQuery: fn(),
  },
  argTypes: {
    theme: { control: 'select', options: ['light', 'dark', 'eng', 'cae'] },
    embStatus: { control: 'select', options: ['idle', 'loading', 'indexing', 'ready', 'fallback'] },
    embCount: { control: { type: 'range', min: 0, max: 100 } },
    globalQuery: { control: 'text' },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
