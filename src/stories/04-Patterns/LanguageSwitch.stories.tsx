import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';

/**
 * data-lang を切り替えてサイドバーのラベルが JP/EN で変わることを示すパターン。
 * useLang フックと同じく document.documentElement に data-lang を設定する。
 */

const LanguageSwitchDemo = () => {
  const [lang, setLang] = useState<'ja' | 'en'>('ja');

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    return () => {
      document.documentElement.setAttribute('data-lang', 'ja');
      document.documentElement.setAttribute('lang', 'ja');
    };
  }, [lang]);

  return (
    <div className="flex flex-col gap-4">
      {/* トグルボタン */}
      <div className="flex items-center gap-3 px-3 py-2 bg-raised rounded-md border border-[var(--border-faint)] max-w-xs">
        <span className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase">Language</span>
        <div className="flex rounded-md overflow-hidden border border-[var(--border-default)]">
          {(['ja', 'en'] as const).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-[12px] font-semibold transition-colors ${
                lang === l
                  ? 'bg-accent text-white'
                  : 'bg-raised text-text-md hover:bg-hover'
              }`}
            >
              {l === 'ja' ? 'JP' : 'EN'}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-text-lo ml-auto">
          data-lang="{lang}"
        </span>
      </div>

      {/* サイドバー */}
      <div className="border border-[var(--border-faint)] rounded-md overflow-hidden" style={{ width: 220, height: 600 }}>
        <Sidebar
          currentPage="list"
          onNav={() => {}}
          collapsed={false}
          onToggle={() => {}}
          dbCount={247}
          embStatus="ready"
          embCount={15}
          lang={lang}
        />
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Patterns/LanguageSwitch',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '言語切り替え (JP/EN) パターン。data-lang 属性を切り替えてサイドバーのラベルが日本語/英語で変わることを確認する。Sidebar コンポーネントは lang prop で表示言語を制御する。',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/** JP/EN トグルでサイドバーラベルが切り替わる */
export const Default: Story = {
  render: () => <LanguageSwitchDemo />,
};
