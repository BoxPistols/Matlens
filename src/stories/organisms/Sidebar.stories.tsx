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
    dbCount: 42,
    embStatus: 'ready',
    embCount: 42,
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: { collapsed: true },
};

export const VectorSearchActive: Story = {
  args: { currentPage: 'vsearch' },
};

export const RAGActive: Story = {
  args: { currentPage: 'rag' },
};
