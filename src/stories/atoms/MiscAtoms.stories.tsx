import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar, Typing, Kbd, Divider } from '../../components/atoms';
import { Icon, type IconName } from '../../components/Icon';

const ALL_ICONS: IconName[] = [
  'dashboard','list','plus','search','vecSearch','rag','similar','mic','help','about','settings',
  'chevronLeft','chevronRight','chevronDown','close','check','edit','trash','download','upload',
  'copy','speaker','stop','refresh','play','spark','embed','warning','info','filter','sort',
  'pdf','json','csv','report','ai','scan',
];

const meta = {
  title: 'Atoms/Misc',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** ProgressBar — 値・色バリエーション */
export const ProgressBars: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      {([
        ['10%', 10, 'var(--err)'],
        ['50%', 50, 'var(--accent)'],
        ['74%', 74, 'var(--warn)'],
        ['100%', 100, 'var(--ok)'],
      ] as [string, number, string][]).map(([label, value, color]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 40, fontSize: 12, color: 'var(--text-lo)', textAlign: 'right' }}>{label}</span>
          <ProgressBar value={value} color={color} className="flex-1" />
        </div>
      ))}
    </div>
  ),
};

/** Typing インジケーター */
export const TypingIndicators: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div><div style={{ fontSize: 11, color: 'var(--text-lo)', marginBottom: 4 }}>Default</div><Typing /></div>
      <div><div style={{ fontSize: 11, color: 'var(--text-lo)', marginBottom: 4 }}>AI</div><Typing color="var(--ai-col)" /></div>
      <div><div style={{ fontSize: 11, color: 'var(--text-lo)', marginBottom: 4 }}>Vec</div><Typing color="var(--vec)" /></div>
    </div>
  ),
};

/** Kbd + Divider */
export const KbdAndDivider: Story = {
  render: () => (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Kbd>⌘</Kbd><Kbd>Enter</Kbd><Kbd>Esc</Kbd><Kbd>Tab</Kbd>
      </div>
      <Divider />
      <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>Divider で区切り線を表示</div>
    </div>
  ),
};

/** Icon ギャラリー — 全38アイコン */
export const IconGallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
      {ALL_ICONS.map(name => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 10, border: '1px solid var(--border-faint)', borderRadius: 'var(--radius-md)' }}>
          <Icon name={name} size={20} />
          <span style={{ fontSize: 10, color: 'var(--text-lo)', fontFamily: 'var(--font-mono)' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
