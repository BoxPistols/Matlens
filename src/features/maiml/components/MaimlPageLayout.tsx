// MaiML Studio 配下サブ画面の共通レイアウト。
// Hub への戻り導線、ページタイトル、サブタイトルを統一。

import type { ReactNode } from 'react';

interface MaimlPageLayoutProps {
  title: string;
  subtitle?: string;
  /** Hub に戻るためのコールバック（onNav('maiml-hub') を渡す想定） */
  onBackToHub: () => void;
  children: ReactNode;
}

export const MaimlPageLayout = ({ title, subtitle, onBackToHub, children }: MaimlPageLayoutProps) => (
  <div className="flex flex-col h-full overflow-hidden">
    <header className="px-6 py-4 border-b border-[var(--border-faint)]">
      <button
        type="button"
        onClick={onBackToHub}
        className="text-[12px] text-[var(--text-lo)] underline mb-1"
      >
        ← MaiML Studio
      </button>
      <h1 className="text-xl font-bold">{title}</h1>
      {subtitle && (
        <p className="text-[13px] text-[var(--text-lo)] mt-1">{subtitle}</p>
      )}
    </header>
    <div className="flex-1 overflow-auto p-6">{children}</div>
  </div>
);
