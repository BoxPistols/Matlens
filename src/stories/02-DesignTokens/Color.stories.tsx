import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

const THEMES = ['light', 'dark', 'eng', 'cae'] as const;

const COLOR_ROLES = [
  { token: '--accent',     label: 'Accent' },
  { token: '--ai-col',     label: 'AI' },
  { token: '--vec',        label: 'Vec' },
  { token: '--ok',         label: 'OK' },
  { token: '--warn',       label: 'Warn' },
  { token: '--err',        label: 'Error' },
  { token: '--text-hi',    label: 'Text Hi' },
  { token: '--text-md',    label: 'Text Md' },
  { token: '--text-lo',    label: 'Text Lo' },
  { token: '--bg-base',    label: 'BG Base' },
  { token: '--bg-surface', label: 'BG Surface' },
  { token: '--bg-raised',  label: 'BG Raised' },
] as const;

const Swatch = ({ token, label, theme }: { token: string; label: string; theme: string }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hex, setHex] = React.useState('');

  React.useEffect(() => {
    if (!ref.current) return;
    const computed = getComputedStyle(ref.current).backgroundColor;
    setHex(computed);
  }, [theme]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 80 }}>
      <div
        ref={ref}
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          background: `var(${token})`,
          border: '1px solid var(--border-default)',
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-hi)' }}>{label}</span>
      <code style={{ fontSize: 12, color: 'var(--text-lo)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', textAlign: 'center' }}>
        {token}
      </code>
      <span style={{ fontSize: 12, color: 'var(--text-lo)', fontFamily: 'var(--font-mono)' }}>{hex}</span>
    </div>
  );
};

const ColorPalette = () => {
  const [activeTheme, setActiveTheme] = React.useState<string>('light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {THEMES.map(t => (
          <button
            key={t}
            onClick={() => setActiveTheme(t)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: activeTheme === t ? '2px solid var(--accent)' : '1px solid var(--border-default)',
              background: activeTheme === t ? 'var(--accent-dim)' : 'var(--bg-raised)',
              color: activeTheme === t ? 'var(--accent)' : 'var(--text-md)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {COLOR_ROLES.map(role => (
          <Swatch key={role.token} token={role.token} label={role.label} theme={activeTheme} />
        ))}
      </div>
    </div>
  );
};

const meta: Meta<typeof ColorPalette> = {
  title: 'DesignTokens/Color',
  component: ColorPalette,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Matlensの4テーマ（Light / Dark / Eng / CAE）のカラートークン一覧。各ロールカラーのCSS変数と実色を表示。',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPalette>;

/** 全テーマのカラートークン一覧 */
export const Default: Story = {};
