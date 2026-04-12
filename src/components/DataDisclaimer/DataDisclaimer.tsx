import { useState } from 'react';
import { Icon } from '../Icon';
import { DATA_DISCLAIMER } from '../../data/initialDb';

export const DataDisclaimer = ({ compact = false }: { compact?: boolean }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--warn-dim)] border border-[var(--border-faint)] rounded text-[11px] text-warn">
        <Icon name="warning" size={12} className="flex-shrink-0" />
        <span>デモ用サンプルデータ — 設計・研究には一次ソースで要検証</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-[var(--warn-dim)] border border-[var(--border-faint)] rounded-lg text-[12px]">
      <Icon name="warning" size={15} className="text-warn flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-warn mb-1">サンプルデータについて</div>
        <p className="text-text-md leading-relaxed">{DATA_DISCLAIMER.ja}</p>
        <a href="#help" className="inline-block mt-1.5 text-[12px] text-accent hover:underline font-ui">ヘルプ・用語集を見る →</a>
      </div>
      <button onClick={() => setDismissed(true)} className="text-text-lo hover:text-text-hi flex-shrink-0" aria-label="閉じる">
        <Icon name="close" size={12} />
      </button>
    </div>
  );
};
