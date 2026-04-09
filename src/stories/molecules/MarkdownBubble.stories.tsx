import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { MarkdownBubble } from '../../components/molecules';

const meta = {
  title: 'Molecules/MarkdownBubble',
  component: MarkdownBubble,
  tags: ['autodocs'],
} satisfies Meta<typeof MarkdownBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleText: Story = {
  args: {
    text: 'Ti-6Al-4V チタン合金は航空宇宙産業で広く使用される高性能材料です。',
  },
};

export const WithMarkdown: Story = {
  args: {
    text: [
      '## 材料分析レポート',
      '',
      '**Ti-6Al-4V チタン合金**の主要特性:',
      '',
      '- 引張強度: **950 MPa**',
      '- 弾性率: 114 GPa',
      '- 密度: 4.43 g/cm3',
      '',
      '```',
      '硬度HV: 330',
      'ステータス: 登録済',
      '```',
      '',
      '> 航空宇宙用途に最適な材料です。',
    ].join('\n'),
  },
};

export const WithSpeakButton: Story = {
  args: {
    text: 'この材料は高強度・低密度で、航空宇宙用途に適しています。音声読み上げボタンを押すとテキストが読み上げられます。',
    onSpeak: fn(),
  },
};
