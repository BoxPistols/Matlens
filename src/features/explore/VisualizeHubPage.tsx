// 可視化（統合）ハブ。
// 4 種類の可視化画面（タイムライン / 予測 vs 実績 / 結晶 3D / マルチスケール）
// を 1 ページのタブ UI に統合する。
//
// 旧ルート (/timeline / /overlay / /crystal / /multimodal) は App.tsx に
// 残してあり、直接 URL アクセスは引き続き可能。
//
// Crystal3D は WebGL コンテキストを持つので tab 切替時に毎回 unmount される
// よう key={tab} で再マウントを強制する（メモリリーク防止）。

import { Suspense, lazy, useState } from 'react';
import type { Material } from '@/types';

type VisualizeTab = 'timeline' | 'overlay' | 'crystal' | 'multimodal';

const TABS: { id: VisualizeTab; label: string; labelEn: string }[] = [
  { id: 'timeline',   label: '加工タイムライン',     labelEn: 'Process Timeline' },
  { id: 'overlay',    label: '予測 vs 実績',         labelEn: 'Prediction vs Actual' },
  { id: 'crystal',    label: '結晶構造 3D',          labelEn: 'Crystal 3D' },
  { id: 'multimodal', label: 'マルチスケール',       labelEn: 'Multiscale' },
];

const STORAGE_KEY = 'matlens_visualize_tab';

// 個別ページは lazy import（重いのでタブ切替時のみロード）
const ProcessTimelinePage = lazy(() => import('@/pages/ProcessTimeline').then((m) => ({ default: m.ProcessTimelinePage })));
const OverlayPage = lazy(() => import('@/pages/Overlay').then((m) => ({ default: m.OverlayPage })));
const Crystal3DPage = lazy(() => import('@/pages/Crystal3D').then((m) => ({ default: m.Crystal3DPage })));
const MultiModalPage = lazy(() => import('@/pages/MultiModal').then((m) => ({ default: m.MultiModalPage })));

interface VisualizeHubPageProps {
  db: Material[];
  initialTab?: VisualizeTab;
}

const loadInitialTab = (): VisualizeTab => {
  if (typeof window === 'undefined') return 'timeline';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && TABS.some((t) => t.id === raw)) return raw as VisualizeTab;
  } catch {
    // ignore
  }
  return 'timeline';
};

export const VisualizeHubPage = ({ db, initialTab }: VisualizeHubPageProps) => {
  const [tab, setTab] = useState<VisualizeTab>(initialTab ?? loadInitialTab());

  const switchTab = (next: VisualizeTab) => {
    setTab(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-3 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">可視化（統合）</h1>
          <span className="text-[11px] text-[var(--text-lo)]">
            タイムライン / 予測 vs 実績 / 結晶 3D / マルチスケール を 1 画面に集約
          </span>
        </div>
        <div className="mt-2 flex gap-1.5" role="tablist" aria-label="可視化モード">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(t.id)}
                className={`px-3 py-1 text-[12px] rounded transition-colors ${
                  active
                    ? 'bg-[var(--accent,#2563eb)] text-white font-semibold'
                    : 'border border-[var(--border-faint)] text-[var(--text-md)] hover:bg-[var(--hover)]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </header>
      <div className="flex-1 overflow-auto" key={tab /* WebGL 等のリーク防止に強制再マウント */}>
        <Suspense fallback={<div className="p-6 text-[var(--text-lo)]">読み込み中…</div>}>
          {tab === 'timeline' && <ProcessTimelinePage />}
          {tab === 'overlay' && <OverlayPage db={db} />}
          {tab === 'crystal' && <Crystal3DPage />}
          {tab === 'multimodal' && <MultiModalPage db={db} />}
        </Suspense>
      </div>
    </div>
  );
};
