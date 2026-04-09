import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { ExportModal } from '../../components/molecules';
import { INITIAL_DB } from '../../data/initialDb';

const meta = {
  title: 'Molecules/ExportModal',
  component: ExportModal,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof ExportModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    db: INITIAL_DB,
    filtered: INITIAL_DB.slice(0, 5),
  },
};

export const Closed: Story = {
  args: {
    open: false,
    db: INITIAL_DB,
    filtered: INITIAL_DB,
  },
};
