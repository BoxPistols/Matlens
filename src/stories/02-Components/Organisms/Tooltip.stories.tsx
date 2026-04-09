import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from '../../../components/Tooltip';
import { Button } from '../../../components/atoms';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Organisms/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ポータルベースのツールチップ。ホバー500ms遅延で表示。画面端での自動位置補正に対応。4方向の配置をサポート。',
      },
    },
  },
  argTypes: {
    placement: { control: 'select', options: ['bottom', 'top', 'right', 'left'] },
    label: { control: 'text' },
  },
  args: {
    label: 'ツールチップのテキスト',
    placement: 'bottom',
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/** ボタンにホバーするとツールチップが表示されます（500ms遅延） */
export const Default: Story = {
  render: (args) => (
    <Tooltip label={args.label} placement={args.placement}>
      <Button variant="primary">ホバーしてください</Button>
    </Tooltip>
  ),
};

/** 4方向の配置 */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 16, justifyContent: 'center' }}>
      <div />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip label="上に表示" placement="top">
          <Button variant="outline">Top</Button>
        </Tooltip>
      </div>
      <Tooltip label="左に表示" placement="left">
        <Button variant="outline">Left</Button>
      </Tooltip>
      <Tooltip label="右に表示" placement="right">
        <Button variant="outline">Right</Button>
      </Tooltip>
      <div />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Tooltip label="下に表示" placement="bottom">
          <Button variant="outline">Bottom</Button>
        </Tooltip>
      </div>
    </div>
  ),
};
