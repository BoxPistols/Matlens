import type { Meta, StoryObj } from '@storybook/react-vite';
import { UnitInput } from '../../components/atoms';

const meta = {
  title: 'Atoms/UnitInput',
  component: UnitInput,
  tags: ['autodocs'],
} satisfies Meta<typeof UnitInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HV: Story = {
  args: {
    unit: 'HV',
    inputProps: { placeholder: '200' },
  },
};

export const MPa: Story = {
  args: {
    unit: 'MPa',
    inputProps: { placeholder: '500' },
  },
};

export const Percentage: Story = {
  args: {
    unit: '%',
    inputProps: { placeholder: '85' },
  },
};
