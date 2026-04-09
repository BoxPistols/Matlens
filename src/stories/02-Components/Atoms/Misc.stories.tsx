import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar, Typing, Kbd, Divider } from '../../../components/atoms';

const MiscShowcase = () => <div />;

const meta: Meta<typeof MiscShowcase> = {
  title: 'Components/Atoms/Misc',
  component: MiscShowcase,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ProgressBar / Typing / Kbd / Divider などのユーティリティ系アトムコンポーネント群。',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MiscShowcase>;

/** プログレスバーの各状態 */
export const ProgressBars: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-md)' }}>完了率</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ok)', fontFamily: 'var(--font-mono)' }}>85%</span>
        </div>
        <ProgressBar value={85} color="var(--ok)" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-md)' }}>処理中</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>45%</span>
        </div>
        <ProgressBar value={45} color="var(--accent)" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-md)' }}>残り枠（警告）</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>20%</span>
        </div>
        <ProgressBar value={20} color="var(--warn)" />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-md)' }}>残り枠（危険）</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--err)', fontFamily: 'var(--font-mono)' }}>5%</span>
        </div>
        <ProgressBar value={5} color="var(--err)" />
      </div>
    </div>
  ),
};

/** タイピングインジケーター */
export const TypingIndicators: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Typing color="var(--ai-col)" />
        <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>AI</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Typing color="var(--vec)" />
        <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>Vec</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Typing color="var(--accent)" />
        <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>Accent</span>
      </div>
    </div>
  ),
};

/** キーボードショートカットとディバイダー */
export const KbdAndDivider: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
        キーボードショートカット
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-md)' }}>
          <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-lo)' }}>グローバル検索</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-md)' }}>
          <Kbd>Ctrl</Kbd> + <Kbd>N</Kbd>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-lo)' }}>新規登録</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-md)' }}>
          <Kbd>Esc</Kbd>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-lo)' }}>モーダルを閉じる</span>
        </div>
      </div>
      <Divider />
      <p style={{ fontSize: 12, color: 'var(--text-lo)' }}>
        ディバイダーはセクション間の区切りに使用します。
      </p>
    </div>
  ),
};
