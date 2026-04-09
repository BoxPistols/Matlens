import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { Sidebar } from '../../components/Sidebar';

const meta = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  args: {
    currentPage: 'dash',
    onNav: fn(),
    collapsed: false,
    onToggle: fn(),
    dbCount: 15,
    embStatus: 'ready',
    embCount: 15,
  },
  argTypes: {
    currentPage: { control: 'select', options: ['dash','list','new','vsearch','rag','sim','api','tests','uxdesign','help','about','settings'] },
    collapsed: { control: 'boolean' },
    embStatus: { control: 'select', options: ['idle', 'loading', 'indexing', 'ready', 'fallback'] },
  },
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ height: '100vh', display: 'flex' }}><Story /></div>],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
