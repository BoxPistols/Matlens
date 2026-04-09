import type { Meta, StoryObj } from '@storybook/react-vite';

const SIZES = [
  { px: 10, usage: 'バッジ・補助ラベル' },
  { px: 11, usage: 'ツールチップ・キーボードヒント' },
  { px: 12, usage: 'ナビ・フォームラベル・タグ' },
  { px: 13, usage: '本文・入力フィールド' },
  { px: 14, usage: 'ベースフォントサイズ (1rem)' },
  { px: 15, usage: 'モーダル見出し・ロゴ' },
  { px: 16, usage: 'Markdown h1' },
  { px: 17, usage: 'ページ見出し' },
  { px: 19, usage: 'ダッシュボード大見出し' },
];

const TypographyScale = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '60px 200px 1fr', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border-default)', marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>サイズ</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>用途</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>サンプル</span>
    </div>
    {SIZES.map(s => (
      <div
        key={s.px}
        style={{
          display: 'grid',
          gridTemplateColumns: '60px 200px 1fr',
          gap: '8px',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid var(--border-faint)',
        }}
      >
        <code style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
          {s.px}px
        </code>
        <span style={{ fontSize: 12, color: 'var(--text-lo)' }}>{s.usage}</span>
        <span style={{ fontSize: s.px, color: 'var(--text-hi)', fontFamily: 'var(--font-ui)', lineHeight: 1.4 }}>
          材料データベース Matlens — Typography {s.px}px
        </span>
      </div>
    ))}
    <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-raised)', borderRadius: 8, border: '1px solid var(--border-faint)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>フォントファミリー</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <code style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>--font-ui</code>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-ui)', color: 'var(--text-hi)', marginTop: 4 }}>
            -apple-system, BlinkMacSystemFont, Hiragino Sans, Yu Gothic UI, Meiryo, Arial, sans-serif
          </p>
        </div>
        <div>
          <code style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>--font-mono</code>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-hi)', marginTop: 4 }}>
            SFMono-Regular, Consolas, Courier New, monospace
          </p>
        </div>
      </div>
    </div>
  </div>
);

const meta: Meta<typeof TypographyScale> = {
  title: 'DesignTokens/Typography',
  component: TypographyScale,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Matlensのタイポグラフィスケール。10px〜19pxの用途別フォントサイズとフォントファミリーの一覧。',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TypographyScale>;

/** タイポグラフィスケール一覧 */
export const Default: Story = {};
